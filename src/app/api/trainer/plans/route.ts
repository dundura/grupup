import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerPlans, trainerPlanInterests, trainers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await db.select().from(trainerPlans)
      .where(and(eq(trainerPlans.trainerClerkId, userId), eq(trainerPlans.isActive, true)))
      .orderBy(desc(trainerPlans.createdAt));

    const interests = await db.select().from(trainerPlanInterests)
      .where(eq(trainerPlanInterests.trainerClerkId, userId))
      .orderBy(desc(trainerPlanInterests.createdAt));

    return NextResponse.json({ plans, interests });
  } catch (err) {
    console.error("[GET /api/trainer/plans]", err);
    return NextResponse.json({ plans: [], interests: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const [plan] = await db.insert(trainerPlans).values({
      trainerClerkId: userId,
      date: body.date || null,
      dayOfWeek: body.dayOfWeek || null,
      time: body.time || null,
      sport: body.sport || null,
      city: body.city || null,
      note: body.note || null,
    }).returning();

    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trainer/plans]", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
