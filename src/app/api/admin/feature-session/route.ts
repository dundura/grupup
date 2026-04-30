import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerSessions, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

// GET /api/admin/feature-session?key=grupup-admin-2026  → sends a sample email to neil
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
    to: ADMIN_BCC,
    subject: "[SAMPLE] Your session is featured on the GrupUp homepage! ⭐",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="background:#0F3154;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="color:rgba(255,255,255,0.7);margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Featured Session</p>
          <h1 style="color:white;margin:0;font-size:24px;line-height:1.3;">Your session is on the homepage! ⭐</h1>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Hi Coach Sarah, great news — we've featured your session on the <strong>GrupUp homepage</strong>. Families browsing the site will see it front and center in the Featured Group Sessions section.
        </p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Featured Session</p>
          <p style="margin:0;font-weight:700;color:#0F3154;font-size:17px;">Saturday Morning Soccer Clinic</p>
          <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">Cary, NC · Saturdays · 9:00 AM</p>
          <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">$35 / player · 4 of 8 spots left</p>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          This is a great opportunity to fill your spots — make sure your session details are up to date so parents can book with confidence.
        </p>
        <a href="https://www.grupup.app/groups"
          style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:24px 0 12px;">
          View Your Session
        </a>
        <p style="margin-top:28px;font-size:12px;color:#9ca3af;text-align:center;">
          [SAMPLE EMAIL] GrupUp · Questions? Reply to this email or contact neil@anytime-soccer.com
        </p>
      </div>
    `,
  });
  return NextResponse.json({ ok: true, sent: ADMIN_BCC });
}

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];
const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const myEmail = me.emailAddresses?.find((e) => e.id === me.primaryEmailAddressId)?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(myEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sessionId, featured } = await req.json();
  if (!sessionId || typeof featured !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.update(trainerSessions)
    .set({ isFeatured: featured })
    .where(eq(trainerSessions.id, Number(sessionId)));

  // Only send email when featuring (not un-featuring)
  if (featured && process.env.RESEND_API_KEY) {
    try {
      const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, Number(sessionId)));
      if (session?.trainerClerkId) {
        // Get trainer email from DB profile first, fall back to Clerk
        const [dbTrainer] = await db.select().from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));
        const trainerUser = await client.users.getUser(session.trainerClerkId);
        const trainerEmail = trainerUser.emailAddresses?.find((e) => e.id === trainerUser.primaryEmailAddressId)?.emailAddress ?? "";
        const trainerName = dbTrainer?.name || `${trainerUser.firstName ?? ""} ${trainerUser.lastName ?? ""}`.trim() || "Coach";
        const sessionUrl = `https://www.grupup.app/sessions/${session.id}`;

        if (trainerEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: FROM,
            to: trainerEmail,
            bcc: ADMIN_BCC,
            subject: `Your session is featured on the GrupUp homepage! ⭐`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">

                <div style="background:#0F3154;border-radius:12px;padding:24px;margin-bottom:24px;">
                  <p style="color:rgba(255,255,255,0.7);margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Featured Session</p>
                  <h1 style="color:white;margin:0;font-size:24px;line-height:1.3;">Your session is on the homepage! ⭐</h1>
                </div>

                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  Hi ${trainerName}, great news — we've featured your session on the <strong>GrupUp homepage</strong>. Families browsing the site will see it front and center in the Featured Group Sessions section.
                </p>

                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0;">
                  <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Featured Session</p>
                  <p style="margin:0;font-weight:700;color:#0F3154;font-size:17px;">${session.title}</p>
                  ${session.city ? `<p style="margin:6px 0 0;font-size:14px;color:#6b7280;">${session.city}${session.dayOfWeek ? ` · ${session.dayOfWeek}s` : ""}${session.time ? ` · ${session.time}` : ""}</p>` : ""}
                  <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">$${session.pricePerPlayer} / player · ${session.spotsLeft} of ${session.spotsTotal} spots left</p>
                </div>

                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  This is a great opportunity to fill your spots — make sure your session details are up to date so parents can book with confidence.
                </p>

                <a href="${sessionUrl}"
                  style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:24px 0 12px;">
                  View Your Session
                </a>

                <p style="margin-top:28px;font-size:12px;color:#9ca3af;text-align:center;">
                  GrupUp · Questions? Reply to this email or contact neil@anytime-soccer.com
                </p>
              </div>
            `,
          });
        }
      }
    } catch (err) {
      console.error("[feature-session] email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
