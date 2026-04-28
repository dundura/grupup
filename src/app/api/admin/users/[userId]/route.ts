import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const ADMIN_IDS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

async function isAdmin(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses?.[0]?.emailAddress ?? "";
  const meta = user.publicMetadata as { role?: string };
  return ADMIN_IDS.includes(email) || meta.role === "admin";
}

// PATCH — archive or unarchive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: adminId } = await auth();
  if (!adminId || !(await isAdmin(adminId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = await params;
  const { archived } = await req.json();
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { archived: !!archived },
  });
  return NextResponse.json({ ok: true });
}

// DELETE — permanently delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: adminId } = await auth();
  if (!adminId || !(await isAdmin(adminId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = await params;
  const client = await clerkClient();
  await client.users.deleteUser(userId);
  return NextResponse.json({ ok: true });
}
