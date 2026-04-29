import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerFollows, trainers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sendTrainerNewFollower } from "@/lib/email";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

// Follow / unfollow
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
    return NextResponse.json({ following: false, status: null });
  }

  await db.insert(trainerFollows).values({ followerClerkId: userId, trainerClerkId, status: "pending" });

  // Notify trainer of follow request with full follower profile
  try {
    const client = await clerkClient();
    const [follower, trainerUser] = await Promise.all([
      client.users.getUser(userId),
      client.users.getUser(trainerClerkId),
    ]);
    const meta = follower.publicMetadata as {
      playerName?: string; sports?: string[]; skillLevel?: string;
      city?: string; bio?: string; slug?: string;
    };
    const followerName = meta.playerName?.trim()
      || `${follower.firstName ?? ""} ${follower.lastName ?? ""}`.trim()
      || "Someone";
    const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
    const [trainerProfile] = await db.select({ name: trainers.name }).from(trainers).where(eq(trainers.clerkId, trainerClerkId));
    const trainerName = trainerProfile?.name || `${trainerUser.firstName ?? ""} ${trainerUser.lastName ?? ""}`.trim() || "Trainer";

    if (trainerEmail) {
      await sendTrainerNewFollower({
        trainerEmail,
        trainerName,
        followerName,
        followerPhoto: follower.imageUrl ?? undefined,
        followerSports: meta.sports ?? [],
        followerLevel: meta.skillLevel ?? undefined,
        followerCity: meta.city ?? undefined,
        followerBio: meta.bio ?? undefined,
        followerProfileId: meta.slug ?? userId,
      });
    }
  } catch (err) {
    console.error("[follow] email error:", err);
  }

  return NextResponse.json({ following: true, status: "pending" });
}

// Approve or deny
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followId, action } = await req.json(); // action: "approved" | "denied"

  const [row] = await db.select().from(trainerFollows).where(
    and(eq(trainerFollows.id, followId), eq(trainerFollows.trainerClerkId, userId))
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "denied") {
    await db.delete(trainerFollows).where(eq(trainerFollows.id, followId));
    return NextResponse.json({ ok: true });
  }

  await db.update(trainerFollows).set({ status: "approved" }).where(eq(trainerFollows.id, followId));

  // Email follower that they were approved
  if (process.env.RESEND_API_KEY) {
    try {
      const client = await clerkClient();
      const [follower, trainerUser] = await Promise.all([
        client.users.getUser(row.followerClerkId),
        client.users.getUser(userId),
      ]);
      const followerEmail = follower.emailAddresses?.[0]?.emailAddress ?? "";
      const followerName = `${follower.firstName ?? ""} ${follower.lastName ?? ""}`.trim() || "there";
      const [trainerProfile] = await db.select({ name: trainers.name }).from(trainers).where(eq(trainers.clerkId, userId));
      const trainerName = trainerProfile?.name || `${trainerUser.firstName ?? ""} ${trainerUser.lastName ?? ""}`.trim() || "Your trainer";

      if (followerEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM,
          to: followerEmail,
          bcc: ADMIN_BCC,
          subject: `${trainerName} approved your follow request`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">You're now following ${trainerName}!</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">Your follow request was approved</p>
              </div>
              <p style="color: #374151; font-size: 15px;">Hi ${followerName},</p>
              <p style="color: #374151; font-size: 15px;">${trainerName} approved your request. You'll now get notified when they post new sessions.</p>
              <a href="https://www.grupup.app/groups"
                style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px;">
                Browse Sessions
              </a>
            </div>
          `,
        });
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
