import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const playerBookings = await db.select().from(bookings)
      .where(and(eq(bookings.clerkUserId, userId), eq(bookings.status, "paid")));

    const pending = [];
    for (const b of playerBookings) {
      if (b.questionnaireCompleted) continue;
      if (!b.sessionId) continue;
      const [session] = await db.select({
        id: trainerSessions.id,
        title: trainerSessions.title,
        questionnaire: trainerSessions.questionnaire,
      }).from(trainerSessions).where(eq(trainerSessions.id, parseInt(b.sessionId)));
      if (!session?.questionnaire) continue;
      pending.push({
        bookingId: b.id,
        sessionTitle: session.title,
        questionnaire: session.questionnaire,
      });
    }

    return NextResponse.json({ pending });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
