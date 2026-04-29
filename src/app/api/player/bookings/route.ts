import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select().from(bookings)
      .where(eq(bookings.clerkUserId, userId))
      .orderBy(desc(bookings.createdAt));

    const paid = rows.filter((b) => b.status === "paid" || b.status === "refunded");

    const enriched = await Promise.all(paid.map(async (b) => {
      let sessionTitle = b.bookingType === "private" ? "Private Session" : "Unknown Session";
      let dayOfWeek = "";
      let time = "";
      let city = "";
      let venue = "";
      let trainerName = "";

      if (b.sessionId) {
        try {
          const [session] = await db.select().from(trainerSessions)
            .where(eq(trainerSessions.id, parseInt(b.sessionId)));
          if (session) {
            sessionTitle = session.title;
            dayOfWeek = session.dayOfWeek ?? "";
            time = session.time ?? "";
            city = session.city ?? "";
            venue = session.venue ?? "";
          }
        } catch {}
      }

      if (b.trainerClerkId) {
        try {
          const [trainer] = await db.select({ name: trainers.name }).from(trainers)
            .where(eq(trainers.clerkId, b.trainerClerkId));
          if (trainer) trainerName = trainer.name;
        } catch {}
      }

      return {
        id: b.id,
        sessionTitle,
        trainerName,
        dayOfWeek,
        time,
        city,
        venue,
        athleteName: b.athleteName ?? "",
        amountPaid: b.amountPaid ?? 0,
        sessionCount: b.sessionCount ?? 1,
        bookingType: b.bookingType ?? "group",
        status: b.status ?? "paid",
        createdAt: b.createdAt,
      };
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/player/bookings]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
