import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, subject, message } = await req.json();

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "GrupUp Contact <onboarding@resend.dev>",
    to: "info@anytime-soccer.com",
    replyTo: email,
    subject: subject ? `[Contact] ${subject}` : `[Contact] Message from ${firstName} ${lastName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">From grupup.app/contact</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #0F3154;">${email}</a></td></tr>
          ${subject ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject</td><td style="padding: 8px 0; font-size: 14px;">${subject}</td></tr>` : ""}
        </table>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Reply directly to this email to respond to ${firstName}.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
