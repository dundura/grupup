import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_EMAIL = "neil@anytime-soccer.com";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { name, email, message } = await req.json();

    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, parseInt(id)));
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const sessionDates: string[] = Array.isArray((session as any).sessionDates) ? (session as any).sessionDates : [];
    const today = new Date().toISOString().split("T")[0];
    const remaining = sessionDates.filter((d) => d >= today).length;
    const total = sessionDates.length;

    // Get trainer email
    let trainerEmail = "";
    try {
      const client = await clerkClient();
      const trainer = await client.users.getUser(session.trainerClerkId);
      trainerEmail = trainer.emailAddresses?.[0]?.emailAddress ?? "";
    } catch {}

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `Late join request: ${session.title}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="color: #0F3154; margin: 0 0 8px;">Late Join Request</h1>
        <p style="color: #374151;"><strong>${name || "A player"}</strong> wants to join <strong>${session.title}</strong> which has already started.</p>
        <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px; font-size: 14px;"><strong>Sessions remaining:</strong> ${remaining} of ${total}</p>
          ${email ? `<p style="margin: 0 0 6px; font-size: 14px;"><strong>Email:</strong> ${email}</p>` : ""}
          ${message ? `<p style="margin: 0; font-size: 14px;"><strong>Message:</strong> ${message}</p>` : ""}
        </div>
        <p style="color: #6b7280; font-size: 13px;">Pro-rated price would be applied if late booking is enabled for this session.</p>
      </div>
    `;

    const recipients = [ADMIN_EMAIL];
    if (trainerEmail && trainerEmail !== ADMIN_EMAIL) recipients.push(trainerEmail);

    await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: email || ADMIN_EMAIL,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST late-booking-request]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
