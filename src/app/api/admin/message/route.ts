import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];
const FROM = "GrupUp <bookings@soccer-near-me.com>";

export async function POST(req: NextRequest) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const admin = await client.users.getUser(adminId);
  const adminEmail = admin.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(adminEmail)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { toUserId, subject, message } = await req.json();
  if (!toUserId || !message?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const target = await client.users.getUser(toUserId);
  const toEmail = target.emailAddresses?.[0]?.emailAddress ?? "";
  const toName = `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim() || "there";

  if (!toEmail) return NextResponse.json({ error: "No email for this user" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    bcc: "neil@anytime-soccer.com",
    replyTo: "neil@anytime-soccer.com",
    subject: subject?.trim() || "A message from the GrupUp team",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Message from GrupUp</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">The GrupUp team sent you a message</p>
        </div>
        <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Hi ${toName},</p>
        <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message.trim()}</p>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Reply directly to this email if you have any questions.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
