import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [trainer] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    if (!trainer) return NextResponse.json(null);
    return NextResponse.json({ payoutMethod: trainer.payoutMethod, payoutHandle: trainer.payoutHandle });
  } catch (err) {
    console.error("[GET /api/trainer/payout]", err);
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payoutMethod, payoutHandle } = await req.json();
    await db.update(trainers)
      .set({ payoutMethod: payoutMethod ?? null, payoutHandle: payoutHandle ?? null })
      .where(eq(trainers.clerkId, userId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/trainer/payout]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
