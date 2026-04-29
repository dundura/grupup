import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerFollows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select({ followerClerkId: trainerFollows.followerClerkId })
      .from(trainerFollows)
      .where(eq(trainerFollows.trainerClerkId, userId));

    const client = await clerkClient();
    const followers = await Promise.all(rows.map(async ({ followerClerkId }) => {
      try {
        const u = await client.users.getUser(followerClerkId);
        return {
          clerkId: followerClerkId,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unknown",
          email: u.emailAddresses?.[0]?.emailAddress ?? "",
          photo: u.imageUrl ?? "",
        };
      } catch { return null; }
    }));

    return NextResponse.json(followers.filter(Boolean));
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const client = await clerkClient();
    const trainer = await client.users.getUser(userId);
    const trainerName = `${trainer.firstName ?? ""} ${trainer.lastName ?? ""}`.trim() || "Your trainer";

    const rows = await db.select({ followerClerkId: trainerFollows.followerClerkId })
      .from(trainerFollows)
      .where(eq(trainerFollows.trainerClerkId, userId));

    if (rows.length === 0) return NextResponse.json({ ok: true, sent: 0 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;

    for (const { followerClerkId } of rows) {
      try {
        const fu = await client.users.getUser(followerClerkId);
        const email = fu.emailAddresses?.[0]?.emailAddress ?? "";
        if (!email) continue;
        const toName = `${fu.firstName ?? ""} ${fu.lastName ?? ""}`.trim() || "there";

        await resend.emails.send({
          from: FROM,
          to: email,
          bcc: ADMIN_BCC,
          replyTo: trainer.emailAddresses?.[0]?.emailAddress ?? "neil@anytime-soccer.com",
          subject: subject?.trim() || `Message from ${trainerName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Message from ${trainerName}</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">A trainer you follow sent you a message</p>
              </div>
              <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Hi ${toName},</p>
              <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 16px 0;">
                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message.trim()}</p>
              </div>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Reply directly to this email to reach your trainer.</p>
            </div>
          `,
        });
        sent++;
      } catch {}
    }

    return NextResponse.json({ ok: true, sent });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
