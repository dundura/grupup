import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const myEmail = me.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(myEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trainerId } = await params;
  const { approved } = await req.json();

  await db.update(trainers)
    .set({ isApproved: !!approved })
    .where(eq(trainers.id, trainerId));

  return NextResponse.json({ ok: true });
}
