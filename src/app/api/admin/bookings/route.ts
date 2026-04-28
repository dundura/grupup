import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, trainerSessions, trainers } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

async function isAdmin(userId: string) {
  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const email = me.emailAddresses?.[0]?.emailAddress ?? "";
  const meta = me.publicMetadata as { role?: string };
  return ADMIN_EMAILS.includes(email) || meta.role === "admin";
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "paid"))
      .orderBy(desc(bookings.createdAt));

    // Look up session titles
    const sessionIds = [...new Set(
      allBookings.map((b) => b.sessionId).filter(Boolean).map((id) => parseInt(id!)).filter((n) => !isNaN(n))
    )];
    const sessionMap: Record<number, { title: string; trainerClerkId: string }> = {};
    if (sessionIds.length) {
      const rows = await db.select({ id: trainerSessions.id, title: trainerSessions.title, trainerClerkId: trainerSessions.trainerClerkId })
        .from(trainerSessions)
        .where(inArray(trainerSessions.id, sessionIds));
      for (const r of rows) sessionMap[r.id] = { title: r.title, trainerClerkId: r.trainerClerkId };
    }

    // Look up trainer names
    const clerkIds = [...new Set([
      ...allBookings.map((b) => b.trainerClerkId).filter(Boolean) as string[],
      ...Object.values(sessionMap).map((s) => s.trainerClerkId).filter(Boolean),
    ])];
    const trainerMap: Record<string, string> = {};
    if (clerkIds.length) {
      const rows = await db.select({ clerkId: trainers.clerkId, name: trainers.name })
        .from(trainers)
        .where(inArray(trainers.clerkId, clerkIds));
      for (const r of rows) if (r.clerkId) trainerMap[r.clerkId] = r.name;
    }

    const result = allBookings.map((b) => {
      const sessionId = b.sessionId ? parseInt(b.sessionId) : null;
      const session = sessionId ? sessionMap[sessionId] : null;
      const trainerClerkId = b.trainerClerkId ?? session?.trainerClerkId ?? null;
      return {
        id: b.id,
        createdAt: b.createdAt,
        userName: b.userName ?? "",
        userEmail: b.userEmail ?? "",
        athleteName: b.athleteName ?? "",
        sessionTitle: session?.title ?? (b.bookingType === "private" ? "Private Session" : "Unknown Session"),
        bookingType: b.bookingType ?? "group",
        sessionCount: b.sessionCount ?? 1,
        amountPaid: b.amountPaid ?? 0,
        trainerAmount: Math.round((b.amountPaid ?? 0) * 0.85),
        trainerName: trainerClerkId ? (trainerMap[trainerClerkId] ?? "Unknown") : "Unknown",
        trainerPaid: b.trainerPaid,
        trainerPaidAt: b.trainerPaidAt,
        stripeSessionId: b.stripeSessionId ?? "",
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/admin/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
