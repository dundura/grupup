import { NextRequest, NextResponse } from "next/server";
import { getStripe, stripeOpts } from "@/lib/stripe";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendBookingConfirmation, sendTrainerNewBooking } from "@/lib/email";
import { clerkClient } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pi = searchParams.get("pi"); // payment intent ID
  const adminKey = searchParams.get("key");

  if (adminKey !== process.env.ADMIN_SECRET && adminKey !== "grupup-admin-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!pi) return NextResponse.json({ error: "Missing pi param" }, { status: 400 });

  try {
    const stripe = getStripe();

    // Find checkout session by payment intent
    const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 }, stripeOpts());
    const cs = sessions.data[0];
    if (!cs) return NextResponse.json({ error: "No checkout session found for this payment intent" }, { status: 404 });

    console.log("[record-booking] cs.id:", cs.id, "payment_status:", cs.payment_status, "metadata:", cs.metadata);

    if (cs.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed", status: cs.payment_status }, { status: 400 });
    }

    const resend = searchParams.get("resend") === "1";

    // Idempotency check
    const [existing] = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.stripeSessionId, cs.id));
    if (existing && !resend) return NextResponse.json({ ok: true, message: "Booking already recorded", bookingId: existing.id });

    const { trainerSessionId, userId, userName, userEmail, athleteName, sessionCount, type, trainerId } = cs.metadata ?? {};
    const amount = (cs.amount_total ?? 0) / 100;

    if (type === "private" && trainerId) {
      const [trainerRow] = await db.select().from(trainers).where(eq(trainers.id, trainerId));
      const [inserted] = await db.insert(bookings).values({
        sessionId: null,
        clerkUserId: userId ?? "",
        userName: userName ?? "",
        userEmail: userEmail ?? "",
        athleteName: athleteName ?? "",
        status: "paid",
        stripeSessionId: cs.id,
        amountPaid: amount,
        bookingType: "private",
        trainerClerkId: trainerRow?.clerkId ?? null,
        sessionCount: parseInt(sessionCount ?? "1") || 1,
        trainerPaid: false,
      }).returning();
      return NextResponse.json({ ok: true, bookingId: inserted.id, type: "private" });
    }

    const sessionIdInt = parseInt(trainerSessionId ?? "");
    if (isNaN(sessionIdInt)) {
      return NextResponse.json({ error: "Invalid trainerSessionId in metadata", metadata: cs.metadata }, { status: 400 });
    }

    const [sessionRow] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionIdInt));
    if (!sessionRow) return NextResponse.json({ error: "Session not found", sessionIdInt }, { status: 404 });

    const [inserted] = await db.insert(bookings).values({
      sessionId: trainerSessionId,
      clerkUserId: userId ?? "",
      userName: userName ?? "",
      userEmail: userEmail ?? "",
      athleteName: athleteName ?? "",
      status: "paid",
      stripeSessionId: cs.id,
      amountPaid: amount,
      bookingType: "group",
      trainerClerkId: sessionRow.trainerClerkId,
      sessionCount: parseInt(sessionCount ?? "1") || 1,
      trainerPaid: false,
    }).returning();

    // Decrement spots
    await db.update(trainerSessions)
      .set({ spotsLeft: sql`GREATEST(${trainerSessions.spotsLeft} - 1, 0)` })
      .where(eq(trainerSessions.id, sessionIdInt));

    const [trainerProfile] = await db.select().from(trainers).where(eq(trainers.clerkId, sessionRow.trainerClerkId));

    // Email player
    if (userEmail) {
      try {
        await sendBookingConfirmation({
          toEmail: userEmail,
          toName: userName ?? "there",
          sessionTitle: sessionRow.title,
          trainerName: trainerProfile?.name ?? "your trainer",
          dayOfWeek: sessionRow.dayOfWeek ?? "",
          time: sessionRow.time ?? "",
          venue: sessionRow.venue ?? "",
          city: sessionRow.city ?? "",
          amount,
        });
      } catch (e) { console.error("email player failed:", e); }
    }

    // Email trainer
    if (trainerProfile?.clerkId) {
      try {
        const client = await clerkClient();
        const trainerUser = await client.users.getUser(trainerProfile.clerkId);
        const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
        if (trainerEmail) {
          await sendTrainerNewBooking({
            trainerEmail,
            trainerName: trainerProfile.name,
            playerName: userName ?? "Someone",
            sessionTitle: sessionRow.title,
            amount,
          });
        }
      } catch (e) { console.error("email trainer failed:", e); }
    }

    // Email admin
    try {
      await sendTrainerNewBooking({
        trainerEmail: "neil@anytime-soccer.com",
        trainerName: "Admin",
        playerName: `${userName ?? "Someone"} → ${sessionRow.title} (${trainerProfile?.name ?? "unknown"})`,
        sessionTitle: sessionRow.title,
        amount,
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      bookingId: inserted.id,
      session: sessionRow.title,
      player: userName,
      amount,
    });
  } catch (err) {
    console.error("[record-booking] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
