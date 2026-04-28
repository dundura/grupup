import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get sessions belonging to this trainer
    const mySessions = await db.select({ id: trainerSessions.id, title: trainerSessions.title })
      .from(trainerSessions)
      .where(eq(trainerSessions.trainerClerkId, userId));
    const mySessionIds = mySessions.map((s) => String(s.id));
    const sessionTitles: Record<string, string> = {};
    for (const s of mySessions) sessionTitles[String(s.id)] = s.title;

    if (mySessionIds.length === 0 && !userId) return NextResponse.json([]);

    // Bookings for this trainer — by trainerClerkId OR by sessionId
    const byTrainer = await db.select().from(bookings)
      .where(eq(bookings.trainerClerkId, userId))
      .orderBy(desc(bookings.createdAt));

    const bySession = mySessionIds.length
      ? await db.select().from(bookings)
          .where(inArray(bookings.sessionId, mySessionIds))
          .orderBy(desc(bookings.createdAt))
      : [];

    // Merge and deduplicate by id
    const seen = new Set<number>();
    const all = [...byTrainer, ...bySession].filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return b.status === "paid";
    });

    all.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    return NextResponse.json(all.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      userName: b.userName ?? "",
      userEmail: b.userEmail ?? "",
      athleteName: b.athleteName ?? "",
      sessionTitle: (b.sessionId ? sessionTitles[b.sessionId] : null) ?? (b.bookingType === "private" ? "Private Session" : "Unknown"),
      bookingType: b.bookingType ?? "group",
      sessionCount: b.sessionCount ?? 1,
      amountPaid: b.amountPaid ?? 0,
      trainerAmount: Math.round((b.amountPaid ?? 0) * 0.85),
      trainerPaid: b.trainerPaid,
      trainerPaidAt: b.trainerPaidAt,
    })));
  } catch (err) {
    console.error("[GET /api/trainer/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
