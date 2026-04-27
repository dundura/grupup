import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, trainers, trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const trainerRows = (await db.select().from(trainerSessions).where(eq(trainerSessions.isActive, true)))
      .filter((s) => s.sessionType !== "private");
    if (trainerRows.length === 0) return NextResponse.json([]);

    const clerkIds = [...new Set(trainerRows.map((s) => s.trainerClerkId))];

    // Fetch trainer DB profiles (has the uploaded S3 photo + name)
    const trainerProfiles = await db
      .select()
      .from(trainers)
      .then((rows) => {
        const map: Record<string, typeof rows[number]> = {};
        for (const r of rows) { if (r.clerkId) map[r.clerkId] = r; }
        return map;
      });

    // Fall back to Clerk for name/photo if DB profile not yet created
    const client = await clerkClient();
    const clerkUsers: Record<string, { name: string; photo: string }> = {};
    for (const id of clerkIds) {
      if (!trainerProfiles[id]) {
        try {
          const u = await client.users.getUser(id);
          clerkUsers[id] = {
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Trainer",
            photo: u.imageUrl ?? "",
          };
        } catch {}
      }
    }

    const result = trainerRows.map((s) => {
      const dbProfile = trainerProfiles[s.trainerClerkId];
      const clerkFallback = clerkUsers[s.trainerClerkId];
      return {
        id: String(s.id),
        title: s.title,
        sport: s.sport,
        sportEmoji: "⚽",
        focus: "",
        sessionType: s.sessionType,
        city: s.city ?? "",
        state: "",
        venue: s.venue ?? "",
        dayOfWeek: s.dayOfWeek ?? "",
        time: s.time ?? "",
        duration: s.duration ?? 60,
        date: "",
        totalSpots: s.spotsTotal,
        spotsLeft: s.spotsLeft,
        pricePerPlayer: s.pricePerPlayer,
        skillLevel: s.skillLevel ?? "",
        ageRange: s.ageRange ?? "",
        recurring: false,
        specialOffer: undefined,
        trainer: {
          id: s.trainerClerkId,
          name: dbProfile?.name ?? clerkFallback?.name ?? "Trainer",
          photo: dbProfile?.photo || clerkFallback?.photo || "",
          rating: dbProfile?.rating ?? 5.0,
        },
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/sessions]", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
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
      state: body.state ?? "",
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
