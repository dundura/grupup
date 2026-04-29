import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers, trainingRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN = "neil@anytime-soccer.com";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    const body = await req.json();
    const { name, email, sport, level, preferredDate, preferredTime, sessions, budget, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const [trainer] = await db.select().from(trainers).where(eq(trainers.id, id));
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    // Save request to DB
    const [request] = await db.insert(trainingRequests).values({
      playerClerkId: userId ?? null,
      playerName: name,
      playerEmail: email,
      sport: sport || null,
      level: level || null,
      city: trainer.city ?? null,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      sessions: sessions || null,
      budget: budget || null,
      message: message || null,
      status: "open",
    }).returning();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get trainer's email from Clerk
    let trainerEmail = "";
    if (trainer.clerkId) {
      try {
        const client = await clerkClient();
        const trainerUser = await client.users.getUser(trainer.clerkId);
        trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
      } catch {}
    }

    const rows = [
      { label: "From", value: `${name} · <a href="mailto:${email}" style="color:#0F3154">${email}</a>` },
      sport ? { label: "Sport", value: sport } : null,
      level ? { label: "Level", value: level } : null,
      preferredDate ? { label: "Preferred Date", value: preferredDate } : null,
      preferredTime ? { label: "Preferred Time", value: preferredTime } : null,
      sessions ? { label: "# Sessions", value: sessions } : null,
      budget ? { label: "Budget/session", value: budget } : null,
      message ? { label: "Notes", value: message } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    const tableRows = rows.map((r) =>
      `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:110px">${r.label}</td><td style="padding:6px 0;font-size:14px">${r.value}</td></tr>`
    ).join("");

    const acceptUrl = `https://www.grupup.app/trainer/requests/${request.id}/accept`;

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">New Session Request 🎯</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">A player wants to train with you</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${tableRows}</table>
        <a href="${acceptUrl}" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:12px;">
          Accept & Create Booking
        </a>
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Or reply directly to this email to discuss details.</p>
      </div>
    `;

    // Email trainer
    if (trainerEmail) {
      await resend.emails.send({
        from: FROM,
        to: trainerEmail,
        bcc: ADMIN,
        replyTo: email,
        subject: `New session request from ${name}`,
        html: emailHtml,
      });
    } else {
      // Fall back to admin only
      await resend.emails.send({
        from: FROM,
        to: ADMIN,
        replyTo: email,
        subject: `New session request for ${trainer.name} from ${name}`,
        html: emailHtml,
      });
    }

    // Confirmation to player
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Session request sent — ${trainer.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:20px;">Request sent!</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">We'll follow up within 24 hours</p>
          </div>
          <p style="color:#374151;font-size:15px;">Hi ${name},</p>
          <p style="color:#374151;font-size:15px;">Your request to train with <strong>${trainer.name}</strong> has been sent.
          ${budget ? `You proposed <strong>${budget}/session</strong>.` : ""} We'll be in touch within 24 hours.</p>
          <a href="https://www.grupup.app/groups" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">
            Browse Other Sessions
          </a>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[request-session]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
