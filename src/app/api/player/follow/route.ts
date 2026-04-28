import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerFollows } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// POST: follow (creates pending) / unfollow
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetClerkId, action } = await req.json();
  if (!targetClerkId) return NextResponse.json({ error: "Missing targetClerkId" }, { status: 400 });
  if (targetClerkId === userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  if (action === "unfollow") {
    await db.delete(playerFollows).where(
      and(eq(playerFollows.followerClerkId, userId), eq(playerFollows.targetClerkId, targetClerkId))
    );
    return NextResponse.json({ status: "unfollowed" });
  }

  // Check if already exists
  const existing = await db.select().from(playerFollows).where(
    and(eq(playerFollows.followerClerkId, userId), eq(playerFollows.targetClerkId, targetClerkId))
  );
  if (existing.length) return NextResponse.json({ status: existing[0].status });

  await db.insert(playerFollows).values({ followerClerkId: userId, targetClerkId, status: "pending" });
  return NextResponse.json({ status: "pending" });
}

// PATCH: approve / reject follow request (called by the target player)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followerClerkId, action } = await req.json();
  if (!followerClerkId) return NextResponse.json({ error: "Missing followerClerkId" }, { status: 400 });

  if (action === "approve") {
    await db.update(playerFollows)
      .set({ status: "approved" })
      .where(and(eq(playerFollows.followerClerkId, followerClerkId), eq(playerFollows.targetClerkId, userId)));
    return NextResponse.json({ success: true });
  }

  // reject or delete
  await db.delete(playerFollows).where(
    and(eq(playerFollows.followerClerkId, followerClerkId), eq(playerFollows.targetClerkId, userId))
  );
  return NextResponse.json({ success: true });
}
