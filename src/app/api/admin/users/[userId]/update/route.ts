import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers, playerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const admin = await client.users.getUser(adminId);
  const adminEmail = admin.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(adminEmail)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const body = await req.json();

  const target = await client.users.getUser(userId);
  const existingMeta = target.publicMetadata as Record<string, unknown>;

  // Fields allowed to be updated
  const metaUpdates: Record<string, unknown> = {};
  const allowedMetaFields = [
    "city", "country", "sport", "playerSports", "level", "league", "team",
    "bio", "birthYear", "gender", "videoLinks", "photo", "isApproved", "isHidden",
    "sports", "specialties", "certifications", "yearsExperience", "improvementAreas",
    "availableForFreePlay", "openToTrain", "position",
  ];
  for (const field of allowedMetaFields) {
    if (field in body) metaUpdates[field] = body[field];
  }

  await client.users.updateUser(userId, {
    publicMetadata: { ...existingMeta, ...metaUpdates },
    ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
    ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
  });

  const [trainerRow] = await db.select({ id: trainers.id }).from(trainers).where(eq(trainers.clerkId, userId));
  const role = (existingMeta.role ?? (trainerRow ? "trainer" : "player")) as string;

  if (role === "trainer") {
    const trainerFields: Record<string, unknown> = {};
    if (body.bio !== undefined) trainerFields.bio = body.bio;
    if (body.city !== undefined) trainerFields.city = body.city;
    if (body.sports !== undefined) trainerFields.sports = body.sports;
    if (body.specialties !== undefined) trainerFields.specialties = body.specialties;
    if (body.certifications !== undefined) trainerFields.certifications = body.certifications;
    if (body.yearsExperience !== undefined) trainerFields.yearsExperience = parseInt(body.yearsExperience) || 0;
    if (body.photo !== undefined) trainerFields.photo = body.photo;
    if (Object.keys(trainerFields).length) {
      await db.update(trainers).set(trainerFields as any).where(eq(trainers.clerkId, userId));
    }
  } else if (body.playerProfileId) {
    // Update player's DB profile with form data
    await db.update(playerProfiles).set({
      name: [body.firstName, body.lastName].filter(Boolean).join(" ") || undefined,
      city: body.city?.trim() || null,
      bio: body.bio?.trim() || null,
      sport: body.sport?.trim() || null,
      skillLevel: body.level?.trim() || null,
      birthYear: body.birthYear ? parseInt(body.birthYear) : null,
      photo: body.photo?.trim() || null,
      instagram: body.instagram?.trim().replace(/^@/, "") || null,
      tiktok: body.tiktok?.trim().replace(/^@/, "") || null,
      snapchat: body.snapchat?.trim().replace(/^@/, "") || null,
    }).where(eq(playerProfiles.id, parseInt(body.playerProfileId)));
  }

  return NextResponse.json({ success: true });
}
