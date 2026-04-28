import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

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

    const origin = req.headers.get("origin") ?? "https://www.grupup.app";
    const stripe = getStripe();

    const sessionLabel = sessionCount === 1
      ? `Private 1-on-1 with ${trainerName}`
      : `${sessionCount} × Private Sessions with ${trainerName}`;
    const discountNote = discountPercent > 0 ? ` (${discountPercent}% multi-session discount applied)` : "";

    const checkoutSession = await stripe.checkout.sessions.create({
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
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/checkout/private]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
