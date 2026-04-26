import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freePlayEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const events = await db
      .select()
      .from(freePlayEvents)
      .where(eq(freePlayEvents.isActive, true));

    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/free-play]", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const [event] = await db.insert(freePlayEvents).values({
      organizerClerkId: userId,
      organizerName: body.organizerName,
      sport: body.sport,
      sportEmoji: body.sportEmoji ?? "⚽",
      title: body.title,
      level: body.level,
      competitiveTier: body.competitiveTier,
      venue: body.venue,
      city: body.city,
      state: body.state ?? "NC",
      date: body.date,
      time: body.time,
      duration: body.duration ?? 90,
      playersConfirmed: 1,
      playersNeeded: body.playersNeeded ?? 10,
      ageRange: body.ageRange,
      description: body.description,
      isActive: true,
    }).returning();

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/free-play]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
