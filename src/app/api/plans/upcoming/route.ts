import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainerPlans, trainers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const plans = await db
      .select({
        id: trainerPlans.id,
        date: trainerPlans.date,
        dayOfWeek: trainerPlans.dayOfWeek,
        time: trainerPlans.time,
        sport: trainerPlans.sport,
        city: trainerPlans.city,
        note: trainerPlans.note,
        interestCount: trainerPlans.interestCount,
        trainerClerkId: trainerPlans.trainerClerkId,
        trainerId: trainers.id,
        trainerName: trainers.name,
        trainerPhoto: trainers.photo,
      })
      .from(trainerPlans)
      .innerJoin(trainers, eq(trainers.clerkId, trainerPlans.trainerClerkId))
      .where(and(eq(trainerPlans.isActive, true), eq(trainers.isApproved, true)))
      .orderBy(desc(trainerPlans.createdAt))
      .limit(12);

    return NextResponse.json(plans);
  } catch (err) {
    console.error("[GET /api/plans/upcoming]", err);
    return NextResponse.json([]);
  }
}
