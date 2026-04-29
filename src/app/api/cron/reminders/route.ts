import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, trainerSessions, trainers, sessionReminders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";

function parseTime(timeStr: string): { h: number; m: number } | null {
  if (!timeStr) return null;
  const s = timeStr.trim();
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = (match[3] ?? "").toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return { h, m };
}

const DOW: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

// Returns next occurrence date string "YYYY-MM-DD" for a given day of week + time
// relative to a reference Date, or null if can't determine
function nextOccurrence(dayOfWeek: string, timeStr: string, from: Date): Date | null {
  const t = parseTime(timeStr);
  if (!t) return null;
  const targetDay = DOW[dayOfWeek.toLowerCase()];
  if (targetDay === undefined) return null;

  const d = new Date(from);
  d.setHours(t.h, t.m, 0, 0);
  const curDay = d.getDay();
  let diff = targetDay - curDay;
  if (diff < 0 || (diff === 0 && d <= from)) diff += 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization header with CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) return NextResponse.json({ skipped: "no resend key" });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = new Date();
  const windowStart = new Date(now.getTime() + 4.5 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  const activeSessions = await db.select().from(trainerSessions).where(eq(trainerSessions.isActive, true));
  let sent = 0;

  for (const session of activeSessions) {
    // Determine upcoming session occurrences in the window
    const occurrences: { date: Date; key: string }[] = [];

    // Session series with explicit dates
    const dates = (session.sessionDates ?? []) as Array<{ date: string; time: string }>;
    if (dates.length > 0) {
      for (const d of dates) {
        const t = parseTime(d.time || session.time || "");
        if (!t) continue;
        const dt = new Date(`${d.date}T00:00:00`);
        dt.setHours(t.h, t.m, 0, 0);
        if (dt >= windowStart && dt <= windowEnd) {
          occurrences.push({ date: dt, key: d.date });
        }
      }
    } else if (session.dayOfWeek && session.time) {
      // Recurring by day of week
      const next = nextOccurrence(session.dayOfWeek, session.time, now);
      if (next && next >= windowStart && next <= windowEnd) {
        const key = next.toISOString().split("T")[0];
        occurrences.push({ date: next, key });
      }
    }

    if (occurrences.length === 0) continue;

    // Get all paid bookings for this session
    const sessionBookings = await db.select().from(bookings).where(
      and(eq(bookings.sessionId, String(session.id)), eq(bookings.status, "paid"))
    );

    const [trainerProfile] = await db.select({ name: trainers.name }).from(trainers)
      .where(eq(trainers.clerkId, session.trainerClerkId));
    const trainerName = trainerProfile?.name ?? "your trainer";

    for (const occ of occurrences) {
      for (const booking of sessionBookings) {
        if (!booking.userEmail) continue;

        // Check if already sent for this occurrence
        const [alreadySent] = await db.select({ id: sessionReminders.id }).from(sessionReminders).where(
          and(
            eq(sessionReminders.bookingId, booking.id),
            eq(sessionReminders.sessionDate, occ.key)
          )
        );
        if (alreadySent) continue;

        const dateLabel = occ.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const timeLabel = session.time ?? "";

        try {
          await resend.emails.send({
            from: FROM,
            to: booking.userEmail,
            subject: `Reminder: ${session.title} starts in 5 hours`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
                <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">Your session starts in 5 hours ⏰</h1>
                  <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">${session.title}</p>
                </div>
                <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
                  <p style="margin: 0 0 8px; font-size: 14px; color: #374151;">📅 <strong>${dateLabel}</strong></p>
                  ${timeLabel ? `<p style="margin: 0 0 8px; font-size: 14px; color: #374151;">🕐 <strong>${timeLabel}</strong></p>` : ""}
                  ${session.venue ? `<p style="margin: 0 0 8px; font-size: 14px; color: #374151;">📍 <strong>${session.venue}${session.city ? `, ${session.city}` : ""}</strong></p>` : session.city ? `<p style="margin: 0 0 8px; font-size: 14px; color: #374151;">📍 <strong>${session.city}</strong></p>` : ""}
                  ${session.duration ? `<p style="margin: 0; font-size: 14px; color: #374151;">⏱ <strong>${session.duration} minutes</strong></p>` : ""}
                </div>
                <p style="color: #374151; font-size: 14px; margin: 0 0 20px;">
                  Your coach <strong>${trainerName}</strong> is looking forward to seeing you. Arrive a few minutes early, bring water, and wear appropriate gear.
                </p>
                ${booking.athleteName ? `<p style="color: #6b7280; font-size: 13px; margin: 0 0 20px;">Athlete: <strong>${booking.athleteName}</strong></p>` : ""}
                <a href="https://www.grupup.app/dashboard"
                  style="display: block; background: #DC373E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  View My Bookings
                </a>
              </div>
            `,
          });

          await db.insert(sessionReminders).values({
            bookingId: booking.id,
            sessionDate: occ.key,
          });
          sent++;
        } catch (err) {
          console.error("[reminders] email failed:", booking.userEmail, err);
        }
      }
    }
  }

  console.log(`[reminders] sent ${sent} reminder(s)`);
  return NextResponse.json({ ok: true, sent });
}
