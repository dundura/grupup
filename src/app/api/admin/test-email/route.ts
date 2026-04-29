import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== "grupup-admin-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM,
    to: "neil@anytime-soccer.com",
    subject: "[SAMPLE] You're approved on GrupUp! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="background:#0F3154;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">You're approved, Coach! 🎉</h1>
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
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">This is a sample email — sent from the GrupUp admin test tool.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, sent: "neil@anytime-soccer.com" });
}
