import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

export async function POST(req: NextRequest) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const admin = await client.users.getUser(adminId);
  const adminEmail = admin.emailAddresses?.[0]?.emailAddress ?? "";
  const adminMeta = admin.publicMetadata as { role?: string };
  if (!ADMIN_EMAILS.includes(adminEmail) && adminMeta.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, superPassword } = await req.json();

  const expectedPassword = process.env.ADMIN_SUPER_PASSWORD;
  if (!expectedPassword) return NextResponse.json({ error: "Super password not configured" }, { status: 500 });
  if (superPassword !== expectedPassword) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  const signInToken = await client.signInTokens.createSignInToken({
    userId: targetUserId,
    expiresInSeconds: 300,
  });

  return NextResponse.json({ token: signInToken.token });
}
