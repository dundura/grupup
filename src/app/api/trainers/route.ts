import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { and } = await import("drizzle-orm");
    const rows = await db.select().from(trainers).where(
      and(eq(trainers.isApproved, true), eq(trainers.isArchived, false))
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/trainers]", err);
    return NextResponse.json([]);
  }
}
