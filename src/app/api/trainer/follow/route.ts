import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerFollows } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trainerClerkId } = await req.json();
  if (!trainerClerkId) return NextResponse.json({ error: "Missing trainerClerkId" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(trainerFollows)
    .where(and(eq(trainerFollows.followerClerkId, userId), eq(trainerFollows.trainerClerkId, trainerClerkId)));

  if (existing) {
    await db.delete(trainerFollows).where(eq(trainerFollows.id, existing.id));
    return NextResponse.json({ following: false });
  } else {
    await db.insert(trainerFollows).values({ followerClerkId: userId, trainerClerkId });
    return NextResponse.json({ following: true });
  }
}
