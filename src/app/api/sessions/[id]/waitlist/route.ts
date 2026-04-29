import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessionWaitlist, trainerSessions, trainerFollows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN_BCC = "neil@anytime-soccer.com";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entries = await db.select().from(sessionWaitlist).where(eq(sessionWaitlist.sessionId, parseInt(id)));
  return NextResponse.json(entries);
}

// Join waitlist
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { name, email } = await req.json();
    if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const sessionId = parseInt(id);
    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionId));
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check not already on waitlist
    const [existing] = await db.select().from(sessionWaitlist)
      .where(and(eq(sessionWaitlist.sessionId, sessionId), eq(sessionWaitlist.userEmail, email.toLowerCase())));
    if (existing) return NextResponse.json({ ok: true, alreadyJoined: true });

    await db.insert(sessionWaitlist).values({
      sessionId,
      clerkUserId: userId ?? null,
      userName: name?.trim() || null,
      userEmail: email.toLowerCase().trim(),
    });

    // Return success immediately — emails fire after
    const sessionUrl = `https://grupup.app/sessions/${sessionId}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // 1. Confirm to player
      try {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: `You're on the waitlist: ${session.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">You're on the waitlist!</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">${session.title}</p>
              </div>
              <p style="color: #374151; font-size: 15px;">Hi ${name || "there"},</p>
              <p style="color: #374151; font-size: 15px;">You've been added to the waitlist for <strong>${session.title}</strong>. When the trainer opens booking, you'll get an email with a direct link to reserve your spot.</p>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Want to leave the waitlist? Reply to this email.</p>
            </div>
          `,
        });
      } catch (e) { console.error("[waitlist] player email failed", e); }

      // 2. Notify trainer
      try {
        const client = await clerkClient();
        const trainerClerk = await client.users.getUser(session.trainerClerkId);
        const trainerEmail = trainerClerk.emailAddresses?.[0]?.emailAddress;
        if (trainerEmail) {
          await resend.emails.send({
            from: FROM,
            to: trainerEmail,
            bcc: ADMIN_BCC,
            subject: `New waitlist signup: ${session.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
                <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">New waitlist signup</h1>
                  <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">${session.title}</p>
                </div>
                <p style="color: #374151; font-size: 15px;"><strong>${name || email}</strong> just joined the waitlist for <strong>${session.title}</strong>.</p>
                <p style="color: #374151; font-size: 15px;">When you're ready, open booking and they'll be notified automatically.</p>
                <a href="${sessionUrl}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#DC373E;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">View session</a>
              </div>
            `,
          });
        }
      } catch (e) { console.error("[waitlist] trainer email failed", e); }

      // 3. Notify trainer's followers
      try {
        const client = await clerkClient();
        const follows = await db.select().from(trainerFollows)
          .where(eq(trainerFollows.trainerClerkId, session.trainerClerkId));
        for (const follow of follows) {
          try {
            const followerUser = await client.users.getUser(follow.followerClerkId);
            const followerEmail = followerUser.emailAddresses?.[0]?.emailAddress;
            const followerName = followerUser.firstName ?? "there";
            if (followerEmail && followerEmail !== email) {
              await resend.emails.send({
                from: FROM,
                to: followerEmail,
                subject: `Someone joined the waitlist: ${session.title}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
                    <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                      <h1 style="color: white; margin: 0; font-size: 20px;">This session is filling up</h1>
                      <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">${session.title}</p>
                    </div>
                    <p style="color: #374151; font-size: 15px;">Hi ${followerName},</p>
                    <p style="color: #374151; font-size: 15px;">Someone just joined the waitlist for <strong>${session.title}</strong> — a session from a trainer you follow. Don't miss out.</p>
                    <a href="${sessionUrl}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#DC373E;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Join the waitlist</a>
                  </div>
                `,
              });
            }
          } catch { /* skip individual follower failures */ }
        }
      } catch (e) { console.error("[waitlist] follower emails failed", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST waitlist]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Leave waitlist
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    await db.delete(sessionWaitlist)
      .where(and(eq(sessionWaitlist.sessionId, parseInt(id)), eq(sessionWaitlist.userEmail, email.toLowerCase())));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
