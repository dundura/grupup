import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerFollows, trainers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sendTrainerNewFollower } from "@/lib/email";

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
  }

  await db.insert(trainerFollows).values({ followerClerkId: userId, trainerClerkId });

  // Send follow notification to trainer (fire-and-forget)
  try {
    const client = await clerkClient();
    const [follower, trainerUser] = await Promise.all([
      client.users.getUser(userId),
      client.users.getUser(trainerClerkId),
    ]);
    const followerName = `${follower.firstName ?? ""} ${follower.lastName ?? ""}`.trim() || "Someone";
    const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
    const [trainerProfile] = await db.select({ name: trainers.name }).from(trainers).where(eq(trainers.clerkId, trainerClerkId));
    const trainerName = trainerProfile?.name ?? trainerUser.firstName ?? "Trainer";

    if (trainerEmail) {
      await sendTrainerNewFollower({ trainerEmail, trainerName, followerName });
    }
  } catch (err) {
    console.error("[follow] email error:", err);
  }

  return NextResponse.json({ following: true });
}
