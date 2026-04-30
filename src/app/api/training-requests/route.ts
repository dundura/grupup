import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { db } from "@/db";
import { trainers, trainingRequests, trainingRequestResponses } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN = "neil@anytime-soccer.com";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name, email, sport, level, city, zipCode, preferredDate, preferredTime, sessions, budget, message, trainingType, groupSize, turnstileToken } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    if (!await verifyTurnstile(turnstileToken)) {
      return NextResponse.json({ error: "Bot check failed" }, { status: 403 });
    }

    const [request] = await db.insert(trainingRequests).values({
      playerClerkId: userId ?? null,
      playerName: name,
      playerEmail: email,
      trainingType: trainingType || "individual",
      groupSize: groupSize || null,
      sport: sport || null,
      level: level || null,
      city: city || null,
      zipCode: zipCode || null,
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      sessions: sessions || null,
      budget: budget || null,
      message: message || null,
      status: "open",
    }).returning();

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, id: request.id });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find matching trainers by city or zip
    const allTrainers = await db.select({
      id: trainers.id,
      name: trainers.name,
      clerkId: trainers.clerkId,
      city: trainers.city,
      zipCode: trainers.zipCode,
      sport: trainers.sport,
      sports: trainers.sports,
    }).from(trainers).where(eq(trainers.isArchived, false));

    const matching = allTrainers.filter((t) => {
      const cityMatch = city && t.city && t.city.toLowerCase().includes(city.toLowerCase());
      const zipMatch = zipCode && t.zipCode && t.zipCode === zipCode;
      return cityMatch || zipMatch;
    });

    const acceptUrl = (id: number) => `https://www.grupup.app/trainer/requests/${id}/accept`;

    const rows = [
      { label: "Player", value: `${name} · ${email}` },
      sport ? { label: "Sport", value: sport } : null,
      level ? { label: "Level", value: level } : null,
      city ? { label: "Location", value: [city, zipCode].filter(Boolean).join(" ") } : null,
      preferredDate ? { label: "Preferred Date", value: preferredDate } : null,
      preferredTime ? { label: "Preferred Time", value: preferredTime } : null,
      sessions ? { label: "# Sessions", value: sessions } : null,
      budget ? { label: "Budget/session", value: budget } : null,
      message ? { label: "Notes", value: message } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    const tableHtml = rows.map((r) =>
      `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px">${r.label}</td><td style="padding:6px 0;font-size:14px">${r.value}</td></tr>`
    ).join("");

    const emailHtml = (trainerName: string) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">New Training Request Near You 🎯</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">A player in your area is looking for a trainer</p>
        </div>
        <p style="color:#374151;font-size:15px;">Hi ${trainerName},</p>
        <p style="color:#374151;font-size:15px;margin-bottom:20px;">A player near you is looking for training. Here are their details:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${tableHtml}</table>
        <a href="${acceptUrl(request.id)}" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:12px;">
          Accept & Create Booking
        </a>
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">First trainer to accept gets the booking.</p>
      </div>
    `;

    // Email each matching trainer
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    for (const trainer of matching) {
      if (!trainer.clerkId) continue;
      try {
        const trainerUser = await client.users.getUser(trainer.clerkId);
        const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
        if (trainerEmail) {
          await resend.emails.send({
            from: FROM,
            to: trainerEmail,
            bcc: ADMIN,
            replyTo: email,
            subject: `New training request near you — ${sport || "General training"}`,
            html: emailHtml(trainer.name),
          });
        }
      } catch {}
    }

    // If no local trainers found, email admin
    if (matching.length === 0) {
      await resend.emails.send({
        from: FROM,
        to: ADMIN,
        subject: `Training request with no matching trainers — ${city || zipCode}`,
        html: emailHtml("Admin"),
      });
    }

    // Confirm to player
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your training request has been sent!",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:20px;">Request sent! 🎉</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">
              ${matching.length > 0 ? `${matching.length} trainer${matching.length > 1 ? "s" : ""} in your area have been notified` : "We're finding trainers in your area"}
            </p>
          </div>
          <p style="color:#374151;font-size:15px;">Hi ${name},</p>
          <p style="color:#374151;font-size:15px;">Your training request has been sent to trainers near <strong>${city || zipCode || "you"}</strong>. When a trainer accepts, you'll receive a payment link to confirm your booking.</p>
          ${budget ? `<p style="color:#374151;font-size:15px;">Your proposed budget: <strong>${budget}/session</strong></p>` : ""}
          <a href="https://www.grupup.app/groups" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">
            Browse Sessions While You Wait
          </a>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, id: request.id, notified: matching.length });
  } catch (err) {
    console.error("[training-requests POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get trainer's city to find nearby requests
    const [trainer] = await db.select({ city: trainers.city, zipCode: trainers.zipCode })
      .from(trainers).where(eq(trainers.clerkId, userId));

    const all = await db.select().from(trainingRequests)
      .where(eq(trainingRequests.status, "open"));

    // Get requests this trainer has already responded to (dismissed or accepted)
    const responded = await db.select({ requestId: trainingRequestResponses.requestId })
      .from(trainingRequestResponses)
      .where(eq(trainingRequestResponses.trainerClerkId, userId));
    const respondedIds = new Set(responded.map((r) => r.requestId));

    // Filter by trainer's location and exclude already-responded
    const nearby = all.filter((r) => {
      if (respondedIds.has(r.id)) return false;
      if (!trainer) return true;
      const cityMatch = trainer.city && r.city && r.city.toLowerCase().includes(trainer.city.toLowerCase());
      const zipMatch = trainer.zipCode && r.zipCode && r.zipCode === trainer.zipCode;
      return cityMatch || zipMatch || (!r.city && !r.zipCode);
    });

    return NextResponse.json(nearby);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
