import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { bookings, sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendBookingConfirmation } from "@/lib/email";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const { sessionId, clerkUserId, userName, userEmail } = cs.metadata!;

    await db.insert(bookings).values({
      sessionId,
      clerkUserId,
      userName,
      userEmail,
      status: "confirmed",
      stripeSessionId: cs.id,
      amountPaid: (cs.amount_total ?? 0) / 100,
    });

    await db
      .update(sessions)
      .set({ spotsLeft: sql`${sessions.spotsLeft} - 1` })
      .where(eq(sessions.id, sessionId));

    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (session && userEmail) {
      await sendBookingConfirmation({
        toEmail: userEmail,
        toName: userName ?? "there",
        sessionTitle: session.title,
        trainerName: session.trainerId ?? "your trainer",
        dayOfWeek: session.dayOfWeek ?? "",
        time: session.time ?? "",
        venue: session.venue ?? "",
        city: session.city,
        amount: (cs.amount_total ?? 0) / 100,
      });
    }
  }

  return NextResponse.json({ received: true });
}
