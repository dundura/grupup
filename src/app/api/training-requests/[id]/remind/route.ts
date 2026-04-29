import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequests, trainers, trainingRequestResponses } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "GrupUp <bookings@soccer-near-me.com>";
const ADMIN = "neil@anytime-soccer.com";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const requestId = parseInt(id);

    const [request] = await db.select().from(trainingRequests).where(eq(trainingRequests.id, requestId));
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.playerClerkId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const sendCount = (request as any).sendCount ?? 1;
    if (sendCount >= 2) {
      return NextResponse.json({ error: "Reminder limit reached" }, { status: 400 });
    }

    // Increment send count
    await db.update(trainingRequests)
      .set({ sendCount: sendCount + 1 } as any)
      .where(eq(trainingRequests.id, requestId));

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find trainers who haven't responded yet
    const responded = await db.select({ trainerClerkId: trainingRequestResponses.trainerClerkId })
      .from(trainingRequestResponses).where(eq(trainingRequestResponses.requestId, requestId));
    const respondedIds = new Set(responded.map((r) => r.trainerClerkId));

    const allTrainers = await db.select({ id: trainers.id, name: trainers.name, clerkId: trainers.clerkId, city: trainers.city, zipCode: trainers.zipCode })
      .from(trainers).where(eq(trainers.isArchived, false));

    const matching = allTrainers.filter((t) => {
      if (!t.clerkId || respondedIds.has(t.clerkId)) return false;
      const cityMatch = request.city && t.city && t.city.toLowerCase().includes(request.city.toLowerCase());
      const zipMatch = request.zipCode && t.zipCode && t.zipCode === request.zipCode;
      return cityMatch || zipMatch || (!request.city && !request.zipCode);
    });

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const acceptUrl = `https://www.grupup.app/trainer/requests/${requestId}/accept`;

    for (const trainer of matching) {
      if (!trainer.clerkId) continue;
      try {
        const trainerUser = await client.users.getUser(trainer.clerkId);
        const trainerEmail = trainerUser.emailAddresses?.[0]?.emailAddress ?? "";
        if (!trainerEmail) continue;
        await resend.emails.send({
          from: FROM,
          to: trainerEmail,
          bcc: ADMIN,
          replyTo: request.playerEmail,
          subject: `Reminder: ${request.playerName} is still looking for a trainer`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
              <div style="background:#0F3154;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <h1 style="color:white;margin:0;font-size:20px;">Reminder: Training Request Near You</h1>
                <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">${request.playerName} is still looking for a trainer</p>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:110px">Player</td><td style="padding:6px 0;font-size:14px">${request.playerName}</td></tr>
                ${request.sport ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Sport</td><td style="padding:6px 0;font-size:14px">${request.sport}</td></tr>` : ""}
                ${request.level ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Level</td><td style="padding:6px 0;font-size:14px">${request.level}</td></tr>` : ""}
                ${request.budget ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Budget</td><td style="padding:6px 0;font-size:14px;font-weight:600">${request.budget}/session</td></tr>` : ""}
              </table>
              <a href="${acceptUrl}" style="display:block;background:#DC373E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Accept & Create Booking
              </a>
            </div>
          `,
        });
      } catch {}
    }

    return NextResponse.json({ ok: true, notified: matching.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
