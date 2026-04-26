import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainers, trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.update(trainers).set({ isArchived: true }).where(eq(trainers.clerkId, userId));
    await db.update(trainerSessions).set({ isActive: false }).where(eq(trainerSessions.trainerClerkId, userId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/trainer/profile/archive]", err);
    return NextResponse.json({ error: "Failed to archive" }, { status: 500 });
  }
}
