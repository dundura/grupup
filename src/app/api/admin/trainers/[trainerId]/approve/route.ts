import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const myEmail = me.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(myEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trainerId } = await params;
  const { approved } = await req.json();

  await db.update(trainers)
    .set({ isApproved: !!approved })
    .where(eq(trainers.id, trainerId));

  // Email trainer when approved
  if (approved && process.env.RESEND_API_KEY) {
    try {
      const [trainer] = await db.select().from(trainers).where(eq(trainers.id, trainerId));
      if (trainer?.clerkId) {
        const trainerUser = await client.users.getUser(trainer.clerkId);
        const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
        const trainerName = trainer.name || `${trainerUser.firstName ?? ""} ${trainerUser.lastName ?? ""}`.trim() || "Coach";
        if (trainerEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: FROM,
            to: trainerEmail,
            bcc: ADMIN_BCC,
            subject: "You're approved on GrupUp! 🎉",
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
                <div style="background:#0F3154;border-radius:12px;padding:24px;margin-bottom:24px;">
                  <h1 style="color:white;margin:0;font-size:24px;">You're approved, ${trainerName}! 🎉</h1>
                  <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:15px;">Welcome to the GrupUp trainer community.</p>
                </div>
                <p style="color:#374151;font-size:15px;">Your trainer profile is now live. Players in your area can find and book you.</p>
                <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
                  <p style="margin:0 0 10px;font-weight:700;color:#0F3154;font-size:15px;">Get started:</p>
                  <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
                    <li>Create your first group session</li>
                    <li>Set your availability and pricing</li>
                    <li>Share your profile link with players</li>
                  </ul>
                </div>
                <a href="https://www.grupup.app/trainer/new-session"
                  style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:12px;">
                  Create Your First Session
                </a>
                <a href="https://www.grupup.app/dashboard"
                  style="display:block;background:#0F3154;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                  Go to Dashboard
                </a>
              </div>
            `,
          });
        }
      }
    } catch (err) {
      console.error("[approve trainer] email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
