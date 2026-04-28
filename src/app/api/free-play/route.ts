import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freePlayEvents, playerFollows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendFollowerFreePlayAlert } from "@/lib/email";

export async function GET() {
  try {
    const events = await db
      .select()
      .from(freePlayEvents)
      .where(eq(freePlayEvents.isActive, true));

    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/free-play]", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const [event] = await db.insert(freePlayEvents).values({
      organizerClerkId: userId,
      organizerName: body.organizerName,
      sport: body.sport,
      sportEmoji: body.sportEmoji ?? "⚽",
      title: body.title,
      level: body.level,
      competitiveTier: body.competitiveTier,
      venue: body.venue,
      city: body.city,
      state: body.state ?? "NC",
      date: body.date,
      time: body.time,
      duration: body.duration ?? 90,
      playersConfirmed: 1,
      playersNeeded: body.playersNeeded ?? 10,
      ageRange: body.ageRange,
      description: body.description,
      isActive: true,
    }).returning();

    // Notify the creator's followers
    try {
      const client = await clerkClient();
      const [creator, followerRows] = await Promise.all([
        client.users.getUser(userId),
        db.select({ followerClerkId: playerFollows.followerClerkId })
          .from(playerFollows)
          .where(and(eq(playerFollows.targetClerkId, userId), eq(playerFollows.status, "approved"))),
      ]);
      const creatorMeta = creator.publicMetadata as { playerName?: string };
      const creatorName = creatorMeta.playerName?.trim()
        || `${creator.firstName ?? ""} ${creator.lastName ?? ""}`.trim()
        || body.organizerName || "Someone";

      for (const { followerClerkId } of followerRows) {
        try {
          const fu = await client.users.getUser(followerClerkId);
          const email = fu.emailAddresses?.[0]?.emailAddress ?? "";
          if (email) {
            await sendFollowerFreePlayAlert({
              toEmail: email, playerName: creatorName,
              eventTitle: event.title, eventId: event.id,
              action: "created", spotsLeft: (body.playersNeeded ?? 10) - 1,
            });
          }
        } catch {}
      }
    } catch {}

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/free-play]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
