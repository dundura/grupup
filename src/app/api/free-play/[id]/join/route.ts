import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { freePlayEvents, playerFollows } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendFollowerFreePlayAlert } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const eventId = parseInt(id);

    const [event] = await db.select().from(freePlayEvents).where(eq(freePlayEvents.id, eventId));
    if (!event || !event.isActive) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if ((event.playersConfirmed ?? 0) >= (event.playersNeeded ?? 10)) return NextResponse.json({ error: "Event is full" }, { status: 400 });

    // Increment confirmed count
    await db.update(freePlayEvents)
      .set({ playersConfirmed: sql`${freePlayEvents.playersConfirmed} + 1` })
      .where(eq(freePlayEvents.id, eventId));

    const spotsLeft = (event.playersNeeded ?? 10) - (event.playersConfirmed ?? 0) - 1;

    // Notify the joining player's followers
    try {
      const client = await clerkClient();
      const [player, followerRows] = await Promise.all([
        client.users.getUser(userId),
        db.select({ followerClerkId: playerFollows.followerClerkId })
          .from(playerFollows)
          .where(and(eq(playerFollows.targetClerkId, userId), eq(playerFollows.status, "approved"))),
      ]);
      const playerMeta = player.publicMetadata as { playerName?: string };
      const playerName = playerMeta.playerName?.trim()
        || `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()
        || "Someone";

      for (const { followerClerkId } of followerRows) {
        try {
          const fu = await client.users.getUser(followerClerkId);
          const email = fu.emailAddresses?.[0]?.emailAddress ?? "";
          if (email) {
            await sendFollowerFreePlayAlert({ toEmail: email, playerName, eventTitle: event.title, eventId, action: "joined", spotsLeft });
          }
        } catch {}
      }
    } catch {}

    return NextResponse.json({ ok: true, playersConfirmed: (event.playersConfirmed ?? 0) + 1 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
