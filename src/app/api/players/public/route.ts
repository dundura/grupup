import { NextResponse } from "next/server";
import { db } from "@/db";
import { playerProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const profiles = await db.select({
    id: playerProfiles.id,
    name: playerProfiles.name,
    photo: playerProfiles.photo,
    city: playerProfiles.city,
    sport: playerProfiles.sport,
    skillLevel: playerProfiles.skillLevel,
    birthYear: playerProfiles.birthYear,
    bio: playerProfiles.bio,
    isFeatured: playerProfiles.isFeatured,
  })
    .from(playerProfiles)
    .where(eq(playerProfiles.isPublic, true))
    .orderBy(desc(playerProfiles.isFeatured), desc(playerProfiles.createdAt))
    .limit(30);

  return NextResponse.json(profiles);
}
