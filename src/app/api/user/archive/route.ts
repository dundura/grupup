import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { archive } = await req.json();

    await db.update(trainers)
      .set({ isArchived: !!archive })
      .where(eq(trainers.clerkId, userId));

    return NextResponse.json({ ok: true, archived: !!archive });
  } catch (err) {
    console.error("[POST /api/user/archive]", err);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
