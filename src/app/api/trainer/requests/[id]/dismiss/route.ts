import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequestResponses } from "@/db/schema";
import { eq } from "drizzle-orm";

// Trainer dismisses a request (records it so they don't see it again, but doesn't close it for others)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await db.insert(trainingRequestResponses).values({
      requestId: parseInt(id),
      trainerClerkId: userId,
      status: "dismissed",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
