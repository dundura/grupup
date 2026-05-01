import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { featuredPlayers } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const adminUser = await client.users.getUser(userId);
  const email = adminUser.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clerkUserId, featured, name, photo, city, sport, skillLevel, birthYear, team, bio } = await req.json();
  if (!clerkUserId) return NextResponse.json({ error: "clerkUserId required" }, { status: 400 });

  if (featured) {
    await db.insert(featuredPlayers).values({
      clerkUserId,
      name: name ?? "Player",
      photo: photo ?? null,
      city: city ?? null,
      sport: sport ?? null,
      skillLevel: skillLevel ?? null,
      birthYear: birthYear ? parseInt(birthYear) : null,
      team: team ?? null,
      bio: bio ?? null,
    }).onConflictDoUpdate({
      target: featuredPlayers.clerkUserId,
      set: { name: name ?? "Player", photo: photo ?? null, city: city ?? null, sport: sport ?? null, skillLevel: skillLevel ?? null, team: team ?? null, bio: bio ?? null },
    });
  } else {
    await db.delete(featuredPlayers).where(eq(featuredPlayers.clerkUserId, clerkUserId));
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const players = await db.select().from(featuredPlayers).orderBy(featuredPlayers.createdAt);
  return NextResponse.json(players);
}
