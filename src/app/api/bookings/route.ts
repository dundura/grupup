import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, sessions, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select({
        booking: bookings,
        session: sessions,
        trainer: {
          name: trainers.name,
          photo: trainers.photo,
        },
      })
      .from(bookings)
      .leftJoin(sessions, eq(bookings.sessionId, sessions.id))
      .leftJoin(trainers, eq(sessions.trainerId, trainers.id))
      .where(eq(bookings.clerkUserId, userId))
      .orderBy(bookings.createdAt);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
