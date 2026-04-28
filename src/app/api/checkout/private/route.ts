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
    const { trainerId, trainerName, pricePerHour, firstName, lastName, email, phone, athleteName, notes } = body;
    const userId = existingUserId ?? `guest-${Date.now()}`;

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
            unit_amount: pricePerHour * 100,
            product_data: {
              name: `Private 1-on-1 with ${trainerName}`,
              description: `60-min private session · ${athleteName}`,
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
