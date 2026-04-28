import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { or, eq, and, desc } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(messages)
    .where(or(eq(messages.fromClerkId, userId), eq(messages.toClerkId, userId)))
    .orderBy(desc(messages.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toClerkId, body } = await req.json();
  if (!toClerkId || !body?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (toClerkId === userId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const [msg] = await db.insert(messages).values({ fromClerkId: userId, toClerkId, body: body.trim() }).returning();

  // Email notification
  if (process.env.RESEND_API_KEY) {
    try {
      const client = await clerkClient();
      const [sender, recipient] = await Promise.all([
        client.users.getUser(userId),
        client.users.getUser(toClerkId),
      ]);
      const senderName = `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim() || "Someone";
      const recipientEmail = recipient.emailAddresses?.[0]?.emailAddress ?? "";
      if (recipientEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM,
          to: recipientEmail,
          replyTo: sender.emailAddresses?.[0]?.emailAddress,
          subject: `${senderName} sent you a message on GrupUp`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
              <div style="background: #0F3154; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">New message 💬</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">From ${senderName} on GrupUp</p>
              </div>
              <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${body.trim()}</p>
              </div>
              <a href="https://www.grupup.app/messages"
                style="display: block; background: #0F3154; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Reply on GrupUp
              </a>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("Message email error:", e);
    }
  }

  return NextResponse.json(msg);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageIds } = await req.json();
  if (!messageIds?.length) return NextResponse.json({ success: true });

  await db.update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.toClerkId, userId)));

  return NextResponse.json({ success: true });
}
