import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";
import { trainers } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";
const HOURS_24 = 24 * 60 * 60 * 1000;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (booking.clerkUserId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "paid") return NextResponse.json({ error: "Already refunded" }, { status: 400 });

    const bookedAt = new Date(booking.createdAt!).getTime();
    const withinWindow = Date.now() - bookedAt < HOURS_24;

    if (!withinWindow) {
      return NextResponse.json({ error: "outside_window" }, { status: 400 });
    }

    // Issue refund
    if (!booking.stripeSessionId) return NextResponse.json({ error: "No Stripe session" }, { status: 400 });
    const stripe = getStripe();
    const cs = await stripe.checkout.sessions.retrieve(booking.stripeSessionId, {}, stripeOpts());
    if (!cs.payment_intent) return NextResponse.json({ error: "No payment intent" }, { status: 400 });
    await stripe.refunds.create({ payment_intent: cs.payment_intent as string }, stripeOpts());

    await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, bookingId));

    if (booking.sessionId) {
      await db.update(trainerSessions)
        .set({ spotsLeft: sql`${trainerSessions.spotsLeft} + 1`, isActive: true })
        .where(eq(trainerSessions.id, parseInt(booking.sessionId)));
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

    // Get session title for emails
    let sessionTitle = "your session";
    if (booking.sessionId) {
      try {
        const [s] = await db.select({ title: trainerSessions.title }).from(trainerSessions).where(eq(trainerSessions.id, parseInt(booking.sessionId)));
        if (s) sessionTitle = s.title;
      } catch {}
    }

    // Email player
    if (booking.userEmail && resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: booking.userEmail,
          bcc: ADMIN_BCC,
          subject: `Booking cancelled: ${sessionTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Booking cancelled</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">Your refund is on the way</p>
              </div>
              <p style="color: #374151; font-size: 15px;">Hi ${booking.userName || "there"},</p>
              <p style="color: #374151; font-size: 15px;">Your booking for <strong>${sessionTitle}</strong> has been cancelled and <strong>$${booking.amountPaid}</strong> will be refunded to your original payment method within 5–10 business days.</p>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Questions? Reply to this email.</p>
            </div>
          `,
        });
      } catch {}
    }

    // Email trainer
    if (booking.trainerClerkId && resend) {
      try {
        const client = await clerkClient();
        const [trainerProfile] = await db.select({ name: trainers.name }).from(trainers).where(eq(trainers.clerkId, booking.trainerClerkId));
        const trainerUser = await client.users.getUser(booking.trainerClerkId);
        const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
        const trainerName = trainerProfile?.name || `${trainerUser.firstName ?? ""} ${trainerUser.lastName ?? ""}`.trim() || "Coach";
        if (trainerEmail) {
          await resend.emails.send({
            from: FROM,
            to: trainerEmail,
            bcc: ADMIN_BCC,
            subject: `Booking cancelled: ${sessionTitle}`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
                <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">Booking cancelled</h1>
                </div>
                <p style="color: #374151; font-size: 15px;">Hi ${trainerName},</p>
                <p style="color: #374151; font-size: 15px;"><strong>${booking.userName || "A player"}</strong> has cancelled their booking for <strong>${sessionTitle}</strong>. A spot has been opened back up.</p>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">The $${booking.amountPaid} refund has been processed automatically.</p>
              </div>
            `,
          });
        }
      } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel booking]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
