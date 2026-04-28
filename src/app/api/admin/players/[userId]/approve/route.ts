import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendPlayerApproved } from "@/lib/email";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const admin = await client.users.getUser(adminId);
  const adminEmail = admin.emailAddresses?.[0]?.emailAddress ?? "";
  const adminMeta = admin.publicMetadata as { role?: string };
  if (!ADMIN_EMAILS.includes(adminEmail) && adminMeta.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const { approved } = await req.json();

  const target = await client.users.getUser(userId);
  const existingMeta = target.publicMetadata as Record<string, unknown>;

  await client.users.updateUser(userId, {
    publicMetadata: { ...existingMeta, isApproved: approved },
  });

  if (approved) {
    const email = target.emailAddresses?.[0]?.emailAddress ?? "";
    const name = `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim() || email;
    if (email) {
      await sendPlayerApproved({ playerEmail: email, playerName: name || "there" });
    }
  }

  return NextResponse.json({ success: true });
}
