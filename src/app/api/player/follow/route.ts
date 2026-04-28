import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerFollows } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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
    return NextResponse.json({ following: false });
  }

  const existing = await db.select().from(playerFollows).where(
    and(eq(playerFollows.followerClerkId, userId), eq(playerFollows.targetClerkId, targetClerkId))
  );
  if (!existing.length) {
    await db.insert(playerFollows).values({ followerClerkId: userId, targetClerkId });
  }
  return NextResponse.json({ following: true });
}
