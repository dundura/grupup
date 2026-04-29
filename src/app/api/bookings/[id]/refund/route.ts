import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Stripe from "stripe";
import { Resend } from "resend";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.trainerClerkId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "paid") return NextResponse.json({ error: "Only paid bookings can be refunded" }, { status: 400 });

    if (!booking.stripeSessionId) return NextResponse.json({ error: "No Stripe session on record" }, { status: 400 });

    // Get Stripe payment intent from checkout session
    const stripe = getStripe();
    const cs = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
    if (!cs.payment_intent) return NextResponse.json({ error: "No payment intent found" }, { status: 400 });

    await stripe.refunds.create({ payment_intent: cs.payment_intent as string });

    // Update booking status
    await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, bookingId));

    // Restore spot on session
    if (booking.sessionId) {
      await db.update(trainerSessions)
        .set({ spotsLeft: sql`${trainerSessions.spotsLeft} + 1`, isActive: true })
        .where(eq(trainerSessions.id, parseInt(booking.sessionId)));
    }

    // Email player
    if (booking.userEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to: booking.userEmail,
        bcc: ADMIN_BCC,
        subject: "Your booking has been refunded",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #0F3154; margin: 0 0 8px;">Refund confirmed</h1>
            <p style="color: #374151;">Hi ${booking.userName || "there"},</p>
            <p style="color: #374151;">Your booking has been refunded. The amount of <strong>$${booking.amountPaid}</strong> will appear back on your original payment method within 5–10 business days.</p>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Questions? Reply to this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/bookings/[id]/refund]", err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
