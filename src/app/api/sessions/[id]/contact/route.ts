import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSessions, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { name, email, message, sessionTitle } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [session] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionId));
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(session.trainerClerkId);
    const trainerEmail = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";

    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));
    const trainerName = trainer?.name ?? "Trainer";

    if (!trainerEmail) {
      return NextResponse.json({ error: "Could not find trainer email" }, { status: 500 });
    }

    await resend.emails.send({
      from: "GrupUp <contact@soccer-near-me.com>",
      to: trainerEmail,
      bcc: "neil@anytime-soccer.com",
      replyTo: email,
      subject: `Question about your session: ${sessionTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F3154;">New message from a player</h2>
          <p><strong>Session:</strong> ${sessionTitle}</p>
          <p><strong>From:</strong> ${name} (${email})</p>
          <div style="background: #f7f8fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/sessions/[id]/contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
