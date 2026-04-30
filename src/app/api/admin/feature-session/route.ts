import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "neil@anytime-soccer.com";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
  if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { sessionId, featured } = await req.json();
  if (!sessionId || typeof featured !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.update(trainerSessions)
    .set({ isFeatured: featured })
    .where(eq(trainerSessions.id, Number(sessionId)));

  return NextResponse.json({ ok: true });
}
