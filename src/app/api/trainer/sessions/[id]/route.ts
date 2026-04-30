import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSessions, bookings } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? "";
    return ADMIN_EMAILS.includes(email);
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const admin = await isAdmin(userId);

    const [session] = admin
      ? await db.select().from(trainerSessions).where(eq(trainerSessions.id, parseInt(id)))
      : await db.select().from(trainerSessions).where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));

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

    const admin = await isAdmin(userId);

    const body = await req.json();
    const newSpotsTotal = parseInt(body.spotsTotal) || 6;

    const [{ value: bookedCount }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(eq(bookings.sessionId, id), eq(bookings.status, "paid")));
    const newSpotsLeft = Math.max(0, newSpotsTotal - (bookedCount ?? 0));

    const whereClause = admin
      ? eq(trainerSessions.id, parseInt(id))
      : and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId));

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
      pricePerPlayer: parseInt(body.pricePerPlayer) || 30,
      spotsTotal: newSpotsTotal,
      spotsLeft: newSpotsLeft,
      skillLevel: Array.isArray(body.skillLevels) ? body.skillLevels.join(", ") : (body.skillLevel ?? ""),
      ageRange: Array.isArray(body.ageRanges) ? body.ageRanges.join(", ") : (body.ageRange ?? ""),
      sessionPhoto: body.sessionPhoto ?? null,
      notes: body.notes ?? "",
      instructions: body.instructions ?? "",
      videoUrl: body.videoUrl ?? "",
      firstClassFree: body.firstClassFree ?? false,
      recurring: body.recurring ?? false,
      recurringWeeks: body.recurringWeeks ? parseInt(body.recurringWeeks) : null,
      questionnaire: body.questionnaire ?? null,
      discountPct: body.discountPct ? parseInt(body.discountPct) : 0,
      discountLabel: body.discountLabel ?? "",
      startDate: body.startDate ?? null,
      isPlan: body.isPlan ?? false,
      allowLateBooking: body.allowLateBooking !== false,
      waitlistEnabled: body.waitlistEnabled ?? false,
      sessionDates: body.isPlan && Array.isArray(body.planSessions) && body.planSessions.length > 0
        ? body.planSessions.map((s: { date: string }) => s.date).filter(Boolean)
        : Array.isArray(body.recurringDates) && body.recurringDates.length > 0
          ? body.recurringDates
          : [],
    }).where(whereClause!);
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
