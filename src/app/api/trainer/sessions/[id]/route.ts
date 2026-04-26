import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db
      .delete(trainerSessions)
      .where(and(eq(trainerSessions.id, parseInt(id)), eq(trainerSessions.trainerClerkId, userId)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/trainer/sessions/[id]]", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
