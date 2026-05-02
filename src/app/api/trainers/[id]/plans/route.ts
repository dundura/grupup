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
        await resend.emails.send({
          from: "GrupUp <bookings@soccer-near-me.com>",
          to: playerEmail ? [playerEmail] : [],
          bcc: "neil@anytime-soccer.com",
          subject: `${playerName ?? "Someone"} is interested in your planned session`,
          html: `<p><strong>${playerName ?? "A player"}</strong> expressed interest in one of your planned sessions on GrupUp.</p>
          <p><a href="https://www.grupup.app/trainer/plans">View your plans dashboard</a></p>`,
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
