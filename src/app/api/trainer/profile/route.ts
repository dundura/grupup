import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        phone: body.phone ?? "",
        bio: body.bio,
        city: body.city,
        state: body.state ?? "",
        zipCode: body.zipCode ?? "",
        sport: body.sports?.[0] ?? body.sport,
        sports: body.sports ?? [],
        specialties: body.specialties ?? [],
        certifications: body.certifications ?? [],
        yearsExperience: parseInt(body.yearsExperience) || 0,
        hourlyRate: parseInt(body.hourlyRate) || 85,
        skillLevels: body.skillLevels ?? [],
        photo: body.photo || user?.imageUrl || "",
      }).where(eq(trainers.clerkId, userId));
      return NextResponse.json({ id: existing.id });
    }

    // Create new — use name-based slug
    const nameSlug = (`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "trainer")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = `${nameSlug}-${userId.slice(-4)}`;
    await db.insert(trainers).values({
      id,
      clerkId: userId,
      name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || body.name || "Trainer",
      phone: body.phone ?? "",
      photo: body.photo || user?.imageUrl || "",
      bio: body.bio ?? "",
      city: body.city ?? "",
      state: body.state ?? "",
      zipCode: body.zipCode ?? "",
      sport: body.sports?.[0] ?? body.sport ?? "Soccer",
      sports: body.sports ?? [],
      specialties: body.specialties ?? [],
      certifications: body.certifications ?? [],
      yearsExperience: parseInt(body.yearsExperience) || 0,
      hourlyRate: parseInt(body.hourlyRate) || 85,
      skillLevels: body.skillLevels ?? [],
      rating: 5.0,
      reviewCount: 0,
      isApproved: false,
    });

    // Notify Neil of new trainer application
    const trainerName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Unknown";
    const trainerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
    try {
      await resend.emails.send({
        from: "GrupUp <contact@soccer-near-me.com>",
        to: "neil@anytime-soccer.com",
        subject: `New trainer application: ${trainerName}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
            <h2 style="color:#0F3154;">New Trainer Application</h2>
            <p><strong>Name:</strong> ${trainerName}</p>
            <p><strong>Email:</strong> ${trainerEmail}</p>
            <p><strong>Phone:</strong> ${body.phone || "—"}</p>
            <p><strong>City:</strong> ${body.city || "—"}, ${body.state || ""}</p>
            <p><strong>Sports:</strong> ${(body.sports ?? []).join(", ") || "—"}</p>
            <p style="margin-top:20px;">
              <a href="https://grupup.app/admin" style="background:#DC373E;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Review in Admin</a>
            </p>
          </div>
        `,
      });
    } catch {}

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trainer/profile]", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
