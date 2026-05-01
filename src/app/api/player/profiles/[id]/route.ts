import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, birthYear, sport, skillLevel, notes, isDefault, photo, city, bio, isPublic, instagram, tiktok, snapchat, focusAreas } = await req.json();

  if (isDefault) {
    await db.update(playerProfiles).set({ isDefault: false }).where(eq(playerProfiles.clerkUserId, userId));
  }

  const [updated] = await db.update(playerProfiles)
    .set({
      name: name?.trim(),
      birthYear: birthYear ? parseInt(birthYear) : null,
      sport: sport?.trim() || null,
      skillLevel: skillLevel?.trim() || null,
      notes: notes?.trim() || null,
      photo: photo?.trim() || null,
      city: city?.trim() || null,
      bio: bio?.trim() || null,
      isPublic: isPublic !== false,
      isDefault: isDefault ?? false,
      instagram: instagram?.trim().replace(/^@/, "") || null,
      tiktok: tiktok?.trim().replace(/^@/, "") || null,
      snapchat: snapchat?.trim().replace(/^@/, "") || null,
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
    })
    .where(and(eq(playerProfiles.id, parseInt(id)), eq(playerProfiles.clerkUserId, userId)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [deleted] = await db.delete(playerProfiles)
    .where(and(eq(playerProfiles.id, parseInt(id)), eq(playerProfiles.clerkUserId, userId)))
    .returning();

  if (deleted?.isDefault) {
    const remaining = await db.select().from(playerProfiles).where(eq(playerProfiles.clerkUserId, userId));
    if (remaining.length > 0) {
      await db.update(playerProfiles).set({ isDefault: true }).where(eq(playerProfiles.id, remaining[0].id));
    }
  }

  return NextResponse.json({ ok: true });
}
