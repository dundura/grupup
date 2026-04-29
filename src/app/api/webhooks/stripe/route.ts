import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { sendBookingConfirmation, sendTrainerNewBooking, sendFollowerSessionAlert } from "@/lib/email";
import { playerFollows } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";

const ADMIN_EMAIL = "neil@anytime-soccer.com";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

async function getTrainerEmail(clerkId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(clerkId);
    return u.emailAddresses?.[0]?.emailAddress ?? "";
  } catch { return ""; }
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
    const { trainerSessionId, userId, userName, userEmail, athleteName, notes, sessionCount, type, trainerId } = cs.metadata ?? {};
    const amount = (cs.amount_total ?? 0) / 100;

    console.log("[webhook] checkout.session.completed", { trainerSessionId, userId, userName, type, amount });

    // Private bookings
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

      // Notify trainer
      if (trainerRow?.clerkId) {
        const trainerEmail = await getTrainerEmail(trainerRow.clerkId);
        if (trainerEmail) {
          await sendTrainerNewBooking({
            trainerEmail,
            trainerName: trainerRow.name,
            playerName: userName ?? "Someone",
            sessionTitle: "Private Session",
            amount,
          });
        }
      }

      // Notify admin
      await sendTrainerNewBooking({
        trainerEmail: ADMIN_EMAIL,
        trainerName: "Admin",
        playerName: `${userName ?? "Someone"} booked a private session with ${trainerRow?.name ?? "a trainer"}`,
        sessionTitle: "Private Session",
        amount,
      });

      return NextResponse.json({ received: true });
    }

    const sessionIdInt = parseInt(trainerSessionId ?? "");
    if (isNaN(sessionIdInt)) {
      console.error("[webhook] invalid sessionId:", trainerSessionId);
      return NextResponse.json({ received: true });
    }

    const [sessionRow] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionIdInt));

    // Record booking
    console.log("[webhook] inserting booking for sessionId:", sessionIdInt, "trainer:", sessionRow?.trainerClerkId);
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
    await db
      .update(trainerSessions)
      .set({ spotsLeft: sql`GREATEST(${trainerSessions.spotsLeft} - 1, 0)` })
      .where(eq(trainerSessions.id, sessionIdInt));

    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionIdInt));

    if (session && session.spotsLeft <= 0) {
      await db.update(trainerSessions).set({ isActive: false }).where(eq(trainerSessions.id, sessionIdInt));
    }

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, session?.trainerClerkId ?? ""));

    // Email player
    if (session && userEmail) {
      await sendBookingConfirmation({
        toEmail: userEmail,
        toName: userName ?? "there",
        sessionTitle: session.title,
        trainerName: trainer?.name ?? "your trainer",
        dayOfWeek: session.dayOfWeek ?? "",
        time: session.time ?? "",
        venue: session.venue ?? "",
        city: session.city ?? "",
        amount,
      });
    }

    // Email trainer
    if (trainer?.clerkId) {
      const trainerEmail = await getTrainerEmail(trainer.clerkId);
      if (trainerEmail) {
        await sendTrainerNewBooking({
          trainerEmail,
          trainerName: trainer.name,
          playerName: userName ?? "Someone",
          sessionTitle: session?.title ?? "your session",
          amount,
        });
      }
    }

    // Email admin
    await sendTrainerNewBooking({
      trainerEmail: ADMIN_EMAIL,
      trainerName: "Admin",
      playerName: `${userName ?? "Someone"} → ${session?.title ?? "session"} (${trainer?.name ?? "unknown trainer"})`,
      sessionTitle: session?.title ?? "Group Session",
      amount,
    });

    // Notify the booking player's followers
    if (userId && !userId.startsWith("guest-") && session) {
      try {
        const client = await clerkClient();
        const [player, followerRows] = await Promise.all([
          client.users.getUser(userId),
          db.select({ followerClerkId: playerFollows.followerClerkId })
            .from(playerFollows)
            .where(and(eq(playerFollows.targetClerkId, userId), eq(playerFollows.status, "approved"))),
        ]);
        const playerMeta = player.publicMetadata as { playerName?: string };
        const playerDisplayName = playerMeta.playerName?.trim()
          || `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()
          || userName
          || "Someone";

        for (const { followerClerkId } of followerRows) {
          try {
            const fu = await client.users.getUser(followerClerkId);
            const email = fu.emailAddresses?.[0]?.emailAddress ?? "";
            if (email) {
              await sendFollowerSessionAlert({
                toEmail: email,
                playerName: playerDisplayName,
                sessionTitle: session.title,
                sessionId: String(session.id),
                action: "booked",
                spotsLeft: Math.max(0, session.spotsLeft - 1),
                dayOfWeek: session.dayOfWeek ?? undefined,
                time: session.time ?? undefined,
                city: session.city ?? undefined,
              });
            }
          } catch {}
        }
      } catch {}
    }
  }

  return NextResponse.json({ received: true });
}
