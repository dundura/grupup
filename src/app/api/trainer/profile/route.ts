import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    return NextResponse.json(trainer ?? null);
  } catch (err) {
    console.error("[GET /api/trainer/profile]", err);
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    const body = await req.json();

    // Check if profile already exists
    const [existing] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    if (existing) {
      // Update
      await db.update(trainers).set({
        name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || body.name,
        bio: body.bio,
        city: body.city,
        state: body.state ?? "",
        sport: body.sports?.[0] ?? body.sport,
        specialties: body.specialties ?? [],
        certifications: body.certifications ?? [],
        yearsExperience: parseInt(body.yearsExperience) || 0,
        hourlyRate: parseInt(body.hourlyRate) || 85,
        skillLevels: body.skillLevels ?? [],
        photo: user?.imageUrl ?? "",
      }).where(eq(trainers.clerkId, userId));
      return NextResponse.json({ id: existing.id });
    }

    // Create new
    const id = `trainer-${userId.slice(-8)}`;
    await db.insert(trainers).values({
      id,
      clerkId: userId,
      name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || body.name || "Trainer",
      photo: user?.imageUrl ?? "",
      bio: body.bio ?? "",
      city: body.city ?? "",
      state: body.state ?? "",
      sport: body.sports?.[0] ?? body.sport ?? "Soccer",
      specialties: body.specialties ?? [],
      certifications: body.certifications ?? [],
      yearsExperience: parseInt(body.yearsExperience) || 0,
      hourlyRate: parseInt(body.hourlyRate) || 85,
      skillLevels: body.skillLevels ?? [],
      rating: 5.0,
      reviewCount: 0,
      isApproved: true,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trainer/profile]", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
