import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(trainers).where(eq(trainers.isApproved, true));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/trainers]", err);
    return NextResponse.json([]);
  }
}
