import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerFollows } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sendFollowRequest, sendFollowApproved } from "@/lib/email";

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

  // Email notification to the target player
  try {
    const client = await clerkClient();
    const [sender, target] = await Promise.all([
      client.users.getUser(userId),
      client.users.getUser(targetClerkId),
    ]);
    const fromName = `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim() || "Someone";
    const toName = `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim() || "there";
    const toEmail = target.emailAddresses?.[0]?.emailAddress ?? "";
    const senderMeta = sender.publicMetadata as {
      photo?: string; playerSports?: string[]; sport?: string; level?: string;
      city?: string; country?: string; bio?: string; profileSlug?: string;
      playerName?: string;
    };
    const displayName = senderMeta.playerName?.trim() || fromName;
    const accountOwnerName = (senderMeta.playerName?.trim() && senderMeta.playerName.trim() !== fromName) ? fromName : undefined;
    if (toEmail) await sendFollowRequest({
      toEmail,
      toName,
      fromName: displayName,
      accountOwnerName,
      fromPhoto: senderMeta.photo ?? sender.imageUrl ?? "",
      fromSports: senderMeta.playerSports?.length ? senderMeta.playerSports : (senderMeta.sport ? [senderMeta.sport] : []),
      fromLevel: senderMeta.level,
      fromCity: senderMeta.city,
      fromCountry: senderMeta.country,
      fromBio: senderMeta.bio,
      fromProfileId: senderMeta.profileSlug ?? sender.id,
    });
  } catch {}

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

    // Email the follower to let them know they were approved
    try {
      const client = await clerkClient();
      const [approver, follower] = await Promise.all([
        client.users.getUser(userId),
        client.users.getUser(followerClerkId),
      ]);
      const approverName = `${approver.firstName ?? ""} ${approver.lastName ?? ""}`.trim() || "Someone";
      const followerEmail = follower.emailAddresses?.[0]?.emailAddress ?? "";
      const followerName = `${follower.firstName ?? ""} ${follower.lastName ?? ""}`.trim() || "there";
      const approverMeta = approver.publicMetadata as { photo?: string; profileSlug?: string };
      if (followerEmail) {
        await sendFollowApproved({
          toEmail: followerEmail,
          toName: followerName,
          approverName,
          approverPhoto: approverMeta.photo ?? approver.imageUrl ?? "",
          approverProfileId: approverMeta.profileSlug ?? userId,
        });
      }
    } catch {}

    return NextResponse.json({ success: true });
  }

  // reject or delete
  await db.delete(playerFollows).where(
    and(eq(playerFollows.followerClerkId, followerClerkId), eq(playerFollows.targetClerkId, userId))
  );
  return NextResponse.json({ success: true });
}
