import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, trainers } from "@/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport");
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const day = searchParams.get("day");
  const level = searchParams.get("level");

  try {
    const rows = await db
      .select({
        session: sessions,
        trainer: {
          id: trainers.id,
          name: trainers.name,
          photo: trainers.photo,
          rating: trainers.rating,
        },
      })
      .from(sessions)
      .leftJoin(trainers, eq(sessions.trainerId, trainers.id))
      .where(eq(sessions.isActive, true));

    const result = rows.map(({ session, trainer }) => ({
      id: session.id,
      title: session.title,
      sport: session.sport,
      sportEmoji: session.sportEmoji,
      focus: session.focus,
      sessionType: session.sessionType,
      city: session.city,
      state: session.state,
      venue: session.venue,
      dayOfWeek: session.dayOfWeek,
      time: session.time,
      duration: session.duration,
      date: session.date,
      totalSpots: session.totalSpots,
      spotsLeft: session.spotsLeft,
      pricePerPlayer: session.pricePerPlayer,
      skillLevel: session.skillLevel,
      ageRange: session.ageRange,
      recurring: session.recurring,
      specialOffer: session.specialOfferLabel
        ? { label: session.specialOfferLabel, discountPct: session.specialOfferDiscountPct ?? 0 }
        : undefined,
      trainer: trainer ?? { id: "", name: "Unknown Trainer", photo: "", rating: 5.0 },
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/sessions]", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = `s-${Date.now()}`;
    await db.insert(sessions).values({
      id,
      trainerId: body.trainerId,
      title: body.title,
      sport: body.sport,
      sportEmoji: body.sportEmoji ?? "⚽",
      focus: body.focus,
      sessionType: body.sessionType,
      city: body.city,
      state: body.state ?? "NC",
      venue: body.venue,
      dayOfWeek: body.dayOfWeek,
      time: body.time,
      duration: body.duration ?? 60,
      date: body.date,
      totalSpots: body.spotsTotal,
      spotsLeft: body.spotsTotal,
      pricePerPlayer: body.pricePerPlayer,
      skillLevel: body.skillLevel,
      ageRange: body.ageRange,
      recurring: body.recurring ?? false,
      isActive: true,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
