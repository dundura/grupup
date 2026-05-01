import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerClients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const body = await req.json();
  const { name, email, phone, sport, level, groupTag, team, position, notes } = body;

  const [updated] = await db.update(trainerClients)
    .set({
      name: name?.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      sport: sport?.trim() || null,
      level: level?.trim() || null,
      groupTag: groupTag?.trim() || null,
      team: team?.trim() || null,
      position: position?.trim() || null,
      notes: notes?.trim() || null,
    })
    .where(and(eq(trainerClients.id, id), eq(trainerClients.trainerClerkId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  await db.delete(trainerClients)
    .where(and(eq(trainerClients.id, id), eq(trainerClients.trainerClerkId, userId)));

  return NextResponse.json({ ok: true });
}
