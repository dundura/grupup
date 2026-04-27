import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [session] = await db.select().from(trainerSessions)
      .where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    await db.update(trainerSessions).set({
      title: body.title,
      sport: body.sport,
      sessionType: body.sessionType,
      city: body.city ?? "",
      zipCode: body.zipCode ?? "",
      venue: body.venue ?? "",
      dayOfWeek: body.dayOfWeek ?? "",
      time: body.time ?? "",
      duration: parseInt(body.duration) || 60,
      pricePerPlayer: parseInt(body.pricePerPlayer) || 25,
      spotsTotal: parseInt(body.spotsTotal) || 6,
      skillLevel: body.skillLevel ?? "",
      ageRange: body.ageRange ?? "",
      notes: body.notes ?? "",
      instructions: body.instructions ?? "",
      firstClassFree: body.firstClassFree ?? false,
    }).where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/trainer/sessions/[id]]", err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db
      .delete(trainerSessions)
      .where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/trainer/sessions/[id]]", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
