import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerPlans, trainerPlanInterests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    await db.update(trainerPlans).set({ isActive: false })
      .where(and(eq(trainerPlans.id, parseInt(id)), eq(trainerPlans.trainerClerkId, userId)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/trainer/plans/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Approve or reject a player suggestion
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { action } = await req.json(); // "approve" | "reject"

    const [interest] = await db.select().from(trainerPlanInterests)
      .where(and(eq(trainerPlanInterests.id, parseInt(id)), eq(trainerPlanInterests.trainerClerkId, userId)));

    if (!interest) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "approve") {
      // Create a new plan from the suggestion
      const [plan] = await db.insert(trainerPlans).values({
        trainerClerkId: userId,
        date: interest.suggestedDate || null,
        time: interest.suggestedTime || null,
        sport: null,
        city: null,
        note: interest.message || null,
      }).returning();

      await db.update(trainerPlanInterests).set({ status: "approved", planId: plan.id })
        .where(eq(trainerPlanInterests.id, parseInt(id)));

      return NextResponse.json({ ok: true, plan });
    } else {
      await db.update(trainerPlanInterests).set({ status: "rejected" })
        .where(eq(trainerPlanInterests.id, parseInt(id)));
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("[PATCH /api/trainer/plans/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
