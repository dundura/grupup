import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { userBlocks } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockedClerkId, action } = await req.json();
  if (!blockedClerkId || blockedClerkId === userId)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (action === "unblock") {
    await db.delete(userBlocks).where(
      and(eq(userBlocks.blockerClerkId, userId), eq(userBlocks.blockedClerkId, blockedClerkId))
    );
    return NextResponse.json({ blocked: false });
  }

  await db.insert(userBlocks).values({ blockerClerkId: userId, blockedClerkId }).onConflictDoNothing();
  return NextResponse.json({ blocked: true });
}
