import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessionWaitlist, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const sessionId = parseInt(id);
    const { subject, message, emails } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const [session] = await db.select().from(trainerSessions)
      .where(and(eq(trainerSessions.id, sessionId), eq(trainerSessions.trainerClerkId, userId)));
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let waitlistEntries = await db.select().from(sessionWaitlist).where(eq(sessionWaitlist.sessionId, sessionId));
    if (Array.isArray(emails) && emails.length > 0) {
      waitlistEntries = waitlistEntries.filter((w) => emails.includes(w.userEmail));
    }
    if (!waitlistEntries.length) return NextResponse.json({ ok: true, sent: 0 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;
    for (const entry of waitlistEntries) {
      try {
        await resend.emails.send({
          from: FROM,
          to: entry.userEmail,
          subject: subject?.trim() || `Update: ${session.title}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
            <p style="color:#374151;font-size:15px;">${message.replace(/\n/g, "<br/>")}</p>
            <p style="color:#9ca3af;font-size:13px;margin-top:24px;">— GrupUp</p>
          </div>`,
        });
        sent++;
      } catch {}
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("[POST message-waitlist]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
