import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getStripe, stripeOpts } from "@/lib/stripe";
import { sendBookingConfirmation, sendTrainerNewBooking } from "@/lib/email";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function ensureBookingRecorded(checkoutSessionId: string) {
  try {
    // Idempotency: don't double-record
    const [existing] = await db.select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.stripeSessionId, checkoutSessionId));
    if (existing) return;

    const stripe = getStripe();
    // Retrieve without stripeOpts — always from platform account
    const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId, {}, stripeOpts());
    console.log("[success] cs.payment_status:", cs.payment_status, "metadata:", cs.metadata);
    if (cs.payment_status !== "paid") return;

    const { trainerSessionId, userId, userName, userEmail, athleteName, sessionCount, type, trainerId } = cs.metadata ?? {};
    const amount = (cs.amount_total ?? 0) / 100;

    // Private booking path
    if (type === "private" && trainerId) {
      const [trainerRow] = await db.select().from(trainers).where(eq(trainers.id, trainerId));
      await db.insert(bookings).values({
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
      });
      return;
    }

    const sessionIdInt = parseInt(trainerSessionId ?? "");
    if (isNaN(sessionIdInt)) return;

    const [sessionRow] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionIdInt));

    await db.insert(bookings).values({
      sessionId: trainerSessionId,
      clerkUserId: userId ?? "",
      userName: userName ?? "",
      userEmail: userEmail ?? "",
      athleteName: athleteName ?? "",
      status: "paid",
      stripeSessionId: cs.id,
      amountPaid: amount,
      bookingType: "group",
      trainerClerkId: sessionRow?.trainerClerkId ?? null,
      sessionCount: parseInt(sessionCount ?? "1") || 1,
      trainerPaid: false,
    });

    // Decrement spots
    await db.update(trainerSessions)
      .set({ spotsLeft: sql`GREATEST(${trainerSessions.spotsLeft} - 1, 0)` })
      .where(eq(trainerSessions.id, sessionIdInt));

    const [trainerProfile] = await db.select().from(trainers).where(eq(trainers.clerkId, sessionRow?.trainerClerkId ?? ""));

    // Email player
    if (userEmail && sessionRow) {
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
      } catch {}
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
            sessionTitle: sessionRow?.title ?? "your session",
            amount,
          });
        }
      } catch {}
    }

    // Email admin
    try {
      await sendTrainerNewBooking({
        trainerEmail: "neil@anytime-soccer.com",
        trainerName: "Admin",
        playerName: `${userName ?? "Someone"} → ${sessionRow?.title ?? "session"} (${trainerProfile?.name ?? "unknown"})`,
        sessionTitle: sessionRow?.title ?? "Group Session",
        amount,
      });
    } catch {}
  } catch (err) {
    console.error("[success-page] FAILED:", String(err));
    throw err; // surface in Vercel logs as a function error
  }
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout_session_id?: string }>;
}) {
  const [, { checkout_session_id }] = await Promise.all([params, searchParams]);

  if (checkout_session_id) {
    await ensureBookingRecorded(checkout_session_id);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "#f0f9f4" }}>
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re booked!</h1>
        <p className="text-muted-foreground mb-6">
          Payment confirmed. A confirmation email is on its way. We&apos;ll see you at the session!
        </p>
        <div className="space-y-3">
          <Link href="/dashboard"
            className="flex items-center justify-center w-full py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: "#0F3154" }}>
            Go to my dashboard
          </Link>
          <Link href="/groups"
            className="flex items-center justify-center w-full py-3 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors">
            Browse more sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
