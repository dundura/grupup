import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { userId: existingUserId } = await auth();
    const body = await req.json();
    const { sessionId, athleteName, contactName, firstName, lastName, email, notes } = body;
    const userId = existingUserId ?? `guest-${Date.now()}`;

    const [session] = await db
      .select()
      .from(trainerSessions)
      .where(eq(trainerSessions.id, parseInt(sessionId)));

    if (!session || !session.isActive) {
      return NextResponse.json({ error: "Session not found or no longer available" }, { status: 404 });
    }
    if (session.spotsLeft <= 0) {
      return NextResponse.json({ error: "This session is full" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "https://www.grupup.app";
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: session.title,
              description: [
                session.sessionType.replace(/-/g, " "),
                session.city,
                session.dayOfWeek && session.time ? `${session.dayOfWeek}s at ${session.time}` : null,
              ].filter(Boolean).join(" · "),
            },
            unit_amount: session.pricePerPlayer * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        sessionId: String(session.id),
        userId,
        athleteName: athleteName ?? "",
        contactName: contactName ?? "",
        notes: notes ?? "",
      },
      success_url: `${origin}/sessions/${session.id}/book/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sessions/${session.id}/book`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "Payments not configured yet. Please contact info@anytime-soccer.com." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create checkout. Please try again." }, { status: 500 });
  }
}
