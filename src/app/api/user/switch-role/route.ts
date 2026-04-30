import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json();
  if (!["player", "trainer", "parent"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = user.publicMetadata as Record<string, unknown>;

  await client.users.updateUser(userId, {
    publicMetadata: { ...existing, role },
  });

  return NextResponse.json({ ok: true, role });
}
