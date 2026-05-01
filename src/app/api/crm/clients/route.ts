import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerClients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await db.select().from(trainerClients)
    .where(eq(trainerClients.trainerClerkId, userId))
    .orderBy(desc(trainerClients.createdAt));

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, sport, level, groupTag, team, position, notes } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const [client] = await db.insert(trainerClients).values({
    trainerClerkId: userId,
    name: name.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    sport: sport?.trim() || null,
    level: level?.trim() || null,
    groupTag: groupTag?.trim() || null,
    team: team?.trim() || null,
    position: position?.trim() || null,
    notes: notes?.trim() || null,
  }).returning();

  return NextResponse.json(client);
}
