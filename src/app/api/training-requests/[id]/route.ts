import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainingRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [request] = await db.select().from(trainingRequests).where(eq(trainingRequests.id, parseInt(id)));
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.playerClerkId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.delete(trainingRequests).where(and(eq(trainingRequests.id, parseInt(id)), eq(trainingRequests.playerClerkId, userId)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Player closes their own request
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json(); // "closed" or "open"

    const [request] = await db.select().from(trainingRequests).where(eq(trainingRequests.id, parseInt(id)));
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.playerClerkId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.update(trainingRequests).set({ status }).where(eq(trainingRequests.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
