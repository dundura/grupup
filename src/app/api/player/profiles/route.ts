import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profiles = await db.select().from(playerProfiles).where(eq(playerProfiles.clerkUserId, userId));
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, birthYear, sport, skillLevel, notes, isDefault } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // If setting as default, clear existing defaults
  if (isDefault) {
    await db.update(playerProfiles).set({ isDefault: false }).where(eq(playerProfiles.clerkUserId, userId));
  }

  // First profile is always default
  const existing = await db.select().from(playerProfiles).where(eq(playerProfiles.clerkUserId, userId));
  const [profile] = await db.insert(playerProfiles).values({
    clerkUserId: userId,
    name: name.trim(),
    birthYear: birthYear ? parseInt(birthYear) : null,
    sport: sport?.trim() || null,
    skillLevel: skillLevel?.trim() || null,
    notes: notes?.trim() || null,
    isDefault: isDefault || existing.length === 0,
  }).returning();

  return NextResponse.json(profile);
}
