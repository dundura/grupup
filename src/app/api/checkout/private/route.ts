import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId: existingUserId } = await auth();
    const body = await req.json();
    const {
      trainerId, trainerName,
      pricePerSession, sessionCount = 1, discountPercent = 0, totalPrice,
      firstName, lastName, email, phone, athleteName, notes,
    } = body;
    const userId = existingUserId ?? `guest-${Date.now()}`;

    // Look up trainer's Stripe Connect account
    const [trainer] = await db.select({ stripeAccountId: trainers.stripeAccountId, clerkId: trainers.clerkId })
      .from(trainers).where(eq(trainers.id, trainerId));

    const origin = req.headers.get("origin") ?? "https://www.grupup.app";
    const stripe = getStripe();

    const sessionLabel = sessionCount === 1
      ? `Private 1-on-1 with ${trainerName}`
      : `${sessionCount} × Private Sessions with ${trainerName}`;
    const discountNote = discountPercent > 0 ? ` (${discountPercent}% multi-session discount applied)` : "";
    const platformFee = Math.round(totalPrice * 0.15 * 100);

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: totalPrice * 100,
            product_data: {
              name: sessionLabel,
              description: `60-min session${sessionCount > 1 ? "s" : ""} · ${athleteName}${discountNote}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "private",
        trainerId,
        trainerName,
        userId,
        userName: `${firstName} ${lastName}`.trim(),
        userEmail: email,
        athleteName,
        phone: phone ?? "",
        notes: notes ?? "",
        sessionCount: String(sessionCount),
        discountPercent: String(discountPercent),
        pricePerSession: String(pricePerSession),
      },
      success_url: `${origin}/booking-confirmed?type=private&trainer=${encodeURIComponent(trainerName)}`,
      cancel_url: `${origin}/trainers/${trainerId}/book-private`,
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
    console.error("[POST /api/checkout/private]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
