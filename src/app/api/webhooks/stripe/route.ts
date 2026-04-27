import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
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
    const { trainerSessionId, userId, userName, userEmail, athleteName, notes } = cs.metadata ?? {};

    const sessionIdInt = parseInt(trainerSessionId ?? "");
    if (isNaN(sessionIdInt)) return NextResponse.json({ received: true });

    // Record booking
    await db.insert(bookings).values({
      sessionId: trainerSessionId,
      clerkUserId: userId ?? "",
      userName: userName ?? "",
      userEmail: userEmail ?? "",
      status: "paid",
      stripeSessionId: cs.id,
      amountPaid: (cs.amount_total ?? 0) / 100,
    });

    // Decrement spots and auto-deactivate if full
    await db
      .update(trainerSessions)
      .set({ spotsLeft: sql`GREATEST(${trainerSessions.spotsLeft} - 1, 0)` })
      .where(eq(trainerSessions.id, sessionIdInt));

    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionIdInt));

    // Auto-deactivate when full
    if (session && session.spotsLeft <= 0) {
      await db.update(trainerSessions).set({ isActive: false }).where(eq(trainerSessions.id, sessionIdInt));
    }

    // Send confirmation email
    if (session && userEmail) {
      const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));
      await sendBookingConfirmation({
        toEmail: userEmail,
        toName: userName ?? "there",
        sessionTitle: session.title,
        trainerName: trainer?.name ?? "your trainer",
        dayOfWeek: session.dayOfWeek ?? "",
        time: session.time ?? "",
        venue: session.venue ?? "",
        city: session.city ?? "",
        amount: (cs.amount_total ?? 0) / 100,
      });
    }
  }

  return NextResponse.json({ received: true });
}
