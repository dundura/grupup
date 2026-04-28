import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

async function isAdmin(userId: string) {
  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const email = me.emailAddresses?.[0]?.emailAddress ?? "";
  const meta = me.publicMetadata as { role?: string };
  return ADMIN_EMAILS.includes(email) || meta.role === "admin";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const { trainerPaid } = await req.json();
    await db.update(bookings).set({
      trainerPaid: !!trainerPaid,
      trainerPaidAt: trainerPaid ? new Date() : null,
    }).where(eq(bookings.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/bookings/[id]]", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
