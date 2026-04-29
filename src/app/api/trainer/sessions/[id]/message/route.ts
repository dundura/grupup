import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <neil@anytime-soccer.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { subject, message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    // Verify trainer owns this session
    const [session] = await db.select().from(trainerSessions)
      .where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Get trainer name
    const client = await clerkClient();
    const trainer = await client.users.getUser(userId);
    const trainerName = `${trainer.firstName ?? ""} ${trainer.lastName ?? ""}`.trim() || "Your trainer";

    // Get all paid bookings for this session
    const sessionBookings = await db.select().from(bookings)
      .where(and(eq(bookings.sessionId, id), eq(bookings.status, "paid")));

    if (sessionBookings.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;
    const seenEmails = new Set<string>();

    for (const b of sessionBookings) {
      const email = b.userEmail ?? "";
      if (!email || seenEmails.has(email)) continue;
      seenEmails.add(email);
      const toName = b.userName || "there";

      await resend.emails.send({
        from: FROM,
        to: email,
        bcc: ADMIN_BCC,
        replyTo: trainer.emailAddresses?.[0]?.emailAddress ?? "neil@anytime-soccer.com",
        subject: subject?.trim() || `Message from ${trainerName} about ${session.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
            <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Message from ${trainerName}</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">Re: ${session.title}</p>
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
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("[POST /api/trainer/sessions/[id]/message]", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
