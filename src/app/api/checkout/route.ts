import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerSessions, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId: existingUserId } = await auth();
    const body = await req.json();
    const { sessionId, athleteName, contactName, firstName, lastName, email, notes, sessionCount = 1 } = body;
    const userId = existingUserId ?? `guest-${Date.now()}`;

    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, parseInt(sessionId)));

    if (!session || !session.isActive) {
      return NextResponse.json({ error: "Session not found or no longer available" }, { status: 404 });
    }
    if (session.spotsLeft <= 0) {
      return NextResponse.json({ error: "This session is full" }, { status: 400 });
    }

    // Look up trainer's Stripe Connect account
    const [trainer] = await db.select({ stripeAccountId: trainers.stripeAccountId })
      .from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));

    const origin = req.headers.get("origin") ?? "https://www.grupup.app";
    const stripe = getStripe();

    // Pro-rate packages where some sessions have passed
    const sessionDates: string[] = Array.isArray((session as any).sessionDates) ? (session as any).sessionDates : [];
    const isPlan = (session as any).isPlan ?? false;
    const allowLateBooking = (session as any).allowLateBooking !== false;

    if (isPlan && sessionDates.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const remaining = sessionDates.filter((d) => d >= today).length;
      if (remaining === 0) {
        return NextResponse.json({ error: "This package has ended" }, { status: 400 });
      }
      if (remaining < sessionDates.length && !allowLateBooking) {
        return NextResponse.json({ error: "Late bookings are not allowed for this package" }, { status: 400 });
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const remainingSessions = isPlan && sessionDates.length > 0
      ? sessionDates.filter((d) => d >= today).length
      : null;
    const totalSessions = sessionDates.length || sessionCount;

    // Plan discount based on total package size
    function planDiscount(n: number) {
      if (n >= 8) return 20; if (n >= 6) return 15; if (n >= 4) return 10; return 5;
    }

    let unitAmount: number;
    let displayQty: number;
    let lineItemName: string;

    if (isPlan && remainingSessions !== null) {
      // Package: charge per-session rate × remaining sessions, with plan discount
      const disc = planDiscount(totalSessions);
      const perSessionAfterDiscount = Math.round(session.pricePerPlayer * (1 - disc / 100));
      unitAmount = perSessionAfterDiscount * remainingSessions;
      displayQty = 1;
      lineItemName = remainingSessions < totalSessions
        ? `${session.title} (${remainingSessions} of ${totalSessions} sessions remaining)`
        : `${session.title} — ${totalSessions}-session package`;
    } else {
      const discountedPrice = (session.discountPct && session.discountPct > 0)
        ? Math.round(session.pricePerPlayer * (1 - session.discountPct / 100))
        : session.pricePerPlayer;
      unitAmount = discountedPrice;
      displayQty = sessionCount;
      lineItemName = sessionCount > 1 ? `${session.title} × ${sessionCount} sessions` : session.title;
    }

    const totalAmount = unitAmount * displayQty;
    const platformFee = Math.round(totalAmount * 0.15 * 100); // 15% in cents

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: lineItemName,
              description: [
                session.sessionType.replace(/-/g, " "),
                session.city,
                session.dayOfWeek && session.time ? `${session.dayOfWeek}s at ${session.time}` : null,
              ].filter(Boolean).join(" · "),
            },
            unit_amount: unitAmount * 100,
          },
          quantity: displayQty,
        },
      ],
      metadata: {
        trainerSessionId: String(session.id),
        userId,
        userName: contactName ?? "",
        userEmail: email ?? "",
        athleteName: athleteName ?? "",
        notes: notes ?? "",
        sessionCount: String(sessionCount),
        type: "group",
      },
      success_url: `${origin}/sessions/${session.id}/book/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sessions/${session.id}/book`,
    };

    // Auto-transfer 85% to trainer if they have Connect set up
    if (trainer?.stripeAccountId) {
      checkoutParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: { destination: trainer.stripeAccountId },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams, stripeOpts());
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Payments not configured yet." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create checkout. Please try again." }, { status: 500 });
  }
}
