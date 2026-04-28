import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerFollows, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendFollowerSessionAlert } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: true }); // silently ok for guests

    const { id } = await params;

    // Get session info
    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, parseInt(id)));
    if (!session) return NextResponse.json({ ok: true });

    // Get player's name and approved followers
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

    if (!followerRows.length) return NextResponse.json({ ok: true });

    // Email each follower
    const followerIds = followerRows.map((r) => r.followerClerkId);
    for (const fid of followerIds) {
      try {
        const fu = await client.users.getUser(fid);
        const email = fu.emailAddresses?.[0]?.emailAddress ?? "";
        if (email) {
          await sendFollowerSessionAlert({
            toEmail: email,
            playerName,
            sessionTitle: session.title,
            sessionId: id,
            action: "interested",
            spotsLeft: session.spotsLeft,
            dayOfWeek: session.dayOfWeek ?? undefined,
            time: session.time ?? undefined,
            city: session.city ?? undefined,
          });
        }
      } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
