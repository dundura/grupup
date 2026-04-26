import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const mySessions = await db
      .select()
      .from(trainerSessions)
      .where(eq(trainerSessions.trainerClerkId, userId));

    return NextResponse.json(mySessions);
  } catch (err) {
    console.error("[GET /api/trainer/sessions]", err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.publicMetadata as { role?: string };
    if (meta.role !== "trainer") {
      return NextResponse.json({ error: "Only trainers can create sessions" }, { status: 403 });
    }

    const body = await req.json();
    const spotsTotal = parseInt(body.spotsTotal);

    const [session] = await db.insert(trainerSessions).values({
      trainerClerkId: userId,
      title: body.title,
      sport: body.sport,
      sessionType: body.sessionType,
      city: body.city,
      zipCode: body.zipCode ?? "",
      venue: body.venue,
      dayOfWeek: body.dayOfWeek,
      time: body.time,
      duration: parseInt(body.duration) || 60,
      pricePerPlayer: parseInt(body.pricePerPlayer),
      spotsTotal,
      spotsLeft: spotsTotal,
      skillLevel: body.skillLevel,
      ageRange: body.ageRange,
      notes: body.notes,
      isActive: true,
    }).returning();

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trainer/sessions]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("DATABASE_URL")) {
      return NextResponse.json({ error: "Database not configured yet. Add DATABASE_URL to Vercel environment variables." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to create session. Please try again." }, { status: 500 });
  }
}
