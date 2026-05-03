import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerPlans, trainerPlanInterests, trainers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET public plans for a trainer (by trainer table id)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [trainer] = await db.select({ clerkId: trainers.clerkId, name: trainers.name })
      .from(trainers).where(eq(trainers.id, id));
    if (!trainer?.clerkId) return NextResponse.json([]);

    const plans = await db.select().from(trainerPlans)
      .where(and(eq(trainerPlans.trainerClerkId, trainer.clerkId), eq(trainerPlans.isActive, true)))
      .orderBy(desc(trainerPlans.createdAt));

    const { userId } = await auth();
    // Attach whether current user already expressed interest
    let myInterests: number[] = [];
    if (userId) {
      const rows = await db.select({ planId: trainerPlanInterests.planId })
        .from(trainerPlanInterests)
        .where(and(
          eq(trainerPlanInterests.trainerClerkId, trainer.clerkId),
          eq(trainerPlanInterests.playerClerkId, userId),
          eq(trainerPlanInterests.type, "interest"),
        ));
      myInterests = rows.map((r) => r.planId!).filter(Boolean);
    }

    return NextResponse.json({ plans, myInterests, trainerName: trainer.name, trainerClerkId: trainer.clerkId });
  } catch (err) {
    console.error("[GET /api/trainers/[id]/plans]", err);
    return NextResponse.json([]);
  }
}

// POST — express interest or write-in suggestion
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [trainer] = await db.select({ clerkId: trainers.clerkId, name: trainers.name })
      .from(trainers).where(eq(trainers.id, id));
    if (!trainer?.clerkId) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const { userId } = await auth();
    const body = await req.json();
    const { type, planId, playerName, playerEmail, suggestedDate, suggestedTime, message, childName, childAge, parentPhone } = body;

    if (type === "interest") {
      // Check not already interested
      const [existing] = await db.select().from(trainerPlanInterests)
        .where(and(
          eq(trainerPlanInterests.planId, planId),
          eq(trainerPlanInterests.playerClerkId, userId ?? ""),
          eq(trainerPlanInterests.type, "interest"),
        ));
      if (existing) return NextResponse.json({ ok: true, alreadyInterested: true });

      await db.insert(trainerPlanInterests).values({
        planId,
        trainerClerkId: trainer.clerkId,
        playerClerkId: userId || null,
        playerName: playerName || "Player",
        playerEmail: playerEmail || "",
        type: "interest",
        status: "pending",
        childName: childName || null,
        childAge: childAge ? parseInt(childAge) : null,
        parentPhone: parentPhone || null,
      });

      // Bump interest count
      const [plan] = await db.select({ interestCount: trainerPlans.interestCount })
        .from(trainerPlans).where(eq(trainerPlans.id, planId));
      await db.update(trainerPlans).set({ interestCount: (plan?.interestCount ?? 0) + 1 })
        .where(eq(trainerPlans.id, planId));

      // Notify trainer
      try {
        const name = playerName ?? "A player";
        await resend.emails.send({
          from: "GrupUp <bookings@soccer-near-me.com>",
          to: playerEmail ? [playerEmail] : [],
          bcc: "neil@anytime-soccer.com",
          subject: `${name} is interested in your planned session`,
          html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#0F3154;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">GrupUp</p>
            </td></tr>
          </table>

          <!-- Body -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:32px;">

              <!-- Avatar + name -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="width:48px;height:48px;background:#DC373E;border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:20px;font-weight:800;line-height:48px;">${name[0].toUpperCase()}</span>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <p style="margin:0;font-size:17px;font-weight:700;color:#0F3154;">${name}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">expressed interest in your planned session</p>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr><td style="background:#f8faff;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                    A player on GrupUp has seen your upcoming session idea and wants to join when you're ready to launch it.
                  </p>
                </td></tr>
              </table>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#DC373E;border-radius:50px;">
                    <a href="https://www.grupup.app/trainer/plans"
                      style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:50px;">
                      View your plans dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td></tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:20px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">You're receiving this because you have an active trainer profile on GrupUp.</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
      } catch {}
    } else {
      // Write-in suggestion
      await db.insert(trainerPlanInterests).values({
        planId: null,
        trainerClerkId: trainer.clerkId,
        playerClerkId: userId || null,
        playerName: playerName || "Player",
        playerEmail: playerEmail || "",
        type: "suggestion",
        suggestedDate: suggestedDate || null,
        suggestedTime: suggestedTime || null,
        message: message || null,
        status: "pending",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/trainers/[id]/plans]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE — remove interest for a plan
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    const { planId } = await req.json();

    const [trainer] = await db.select({ clerkId: trainers.clerkId })
      .from(trainers).where(eq(trainers.id, id));
    if (!trainer?.clerkId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (userId) {
      await db.delete(trainerPlanInterests).where(
        and(
          eq(trainerPlanInterests.planId, planId),
          eq(trainerPlanInterests.playerClerkId, userId),
          eq(trainerPlanInterests.type, "interest"),
        )
      );
    }

    // Decrement interest count
    const [plan] = await db.select({ interestCount: trainerPlans.interestCount })
      .from(trainerPlans).where(eq(trainerPlans.id, planId));
    const newCount = Math.max(0, (plan?.interestCount ?? 1) - 1);
    await db.update(trainerPlans).set({ interestCount: newCount }).where(eq(trainerPlans.id, planId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/trainers/[id]/plans]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
