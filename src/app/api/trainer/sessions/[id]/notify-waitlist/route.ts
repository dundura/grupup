import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessionWaitlist, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const sessionId = parseInt(id);

    const [session] = await db.select().from(trainerSessions)
      .where(and(eq(trainerSessions.id, sessionId), eq(trainerSessions.trainerClerkId, userId)));
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const waitlistEntries = await db.select().from(sessionWaitlist).where(eq(sessionWaitlist.sessionId, sessionId));
    if (!waitlistEntries.length) return NextResponse.json({ ok: true, sent: 0 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const price = session.discountPct && session.discountPct > 0
      ? Math.round(session.pricePerPlayer * (1 - session.discountPct / 100))
      : session.pricePerPlayer;

    let sent = 0;
    for (const entry of waitlistEntries) {
      try {
        await resend.emails.send({
          from: FROM,
          to: entry.userEmail,
          bcc: ADMIN_BCC,
          subject: `Spots are open! Book your place in ${session.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Spots are now open! 🎉</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">${session.title}</p>
              </div>
              <p style="color: #374151; font-size: 15px;">Hi ${entry.userName || "there"},</p>
              <p style="color: #374151; font-size: 15px;">Great news — <strong>${session.title}</strong> is now open for booking. Secure your spot before it fills up!</p>
              <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 6px; font-size: 14px; color: #0F3154;"><strong>Price:</strong> $${price}/player</p>
                ${session.city ? `<p style="margin: 0 0 6px; font-size: 14px; color: #374151;">📍 ${session.city}</p>` : ""}
                ${session.dayOfWeek && session.time ? `<p style="margin: 0; font-size: 14px; color: #374151;">📅 ${session.dayOfWeek}s at ${session.time}</p>` : ""}
              </div>
              <a href="https://www.grupup.app/sessions/${sessionId}/book"
                style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 16px;">
                Book My Spot Now →
              </a>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Spots are limited — book now to secure your place.</p>
            </div>
          `,
        });
        sent++;
      } catch {}
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("[POST notify-waitlist]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
