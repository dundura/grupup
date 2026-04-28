import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [trainer] = await db.select().from(trainers).where(eq(trainers.id, id));
    if (!trainer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(trainer);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load trainer" }, { status: 500 });
  }
}
