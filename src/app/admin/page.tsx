import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers, trainerSessions, bookings } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  const myEmail = me.emailAddresses?.[0]?.emailAddress ?? "";
  const myMeta = me.publicMetadata as { role?: string };
  if (!ADMIN_EMAILS.includes(myEmail) && myMeta.role !== "admin") redirect("/");

  // Fetch all Clerk users
  const { data: clerkUsers } = await client.users.getUserList({ limit: 500 });

  // Fetch trainer DB profiles
  const trainerProfiles = await db.select().from(trainers);
  const trainerClerkIds = new Set(trainerProfiles.map((t) => t.clerkId).filter(Boolean));

  // Session counts per trainer
  const sessionRows = await db.select({ trainerClerkId: trainerSessions.trainerClerkId })
    .from(trainerSessions).where(eq(trainerSessions.isActive, true));
  const sessionCounts: Record<string, number> = {};
  for (const r of sessionRows) {
    sessionCounts[r.trainerClerkId] = (sessionCounts[r.trainerClerkId] ?? 0) + 1;
  }

  // Booking counts per user
  const bookingRows = await db.select({ clerkUserId: bookings.clerkUserId })
    .from(bookings).where(eq(bookings.status, "paid"));
  const bookingCounts: Record<string, number> = {};
  for (const r of bookingRows) {
    bookingCounts[r.clerkUserId] = (bookingCounts[r.clerkUserId] ?? 0) + 1;
  }

  const trainerList = [];
  const playerList = [];

  for (const u of clerkUsers) {
    const email = u.emailAddresses?.[0]?.emailAddress ?? "";
    const meta = u.publicMetadata as { role?: string; archived?: boolean };
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || email;
    const base = {
      id: u.id,
      name,
      email,
      photo: u.imageUrl ?? "",
      joinedAt: new Date(u.createdAt).toISOString(),
      archived: meta.archived ?? false,
      sessionCount: sessionCounts[u.id] ?? 0,
      bookingCount: bookingCounts[u.id] ?? 0,
    };

    if (meta.role === "trainer" || trainerClerkIds.has(u.id)) {
      const dbProfile = trainerProfiles.find((t) => t.clerkId === u.id);
      trainerList.push({ ...base, role: "trainer", trainerId: dbProfile?.id ?? null, isApproved: dbProfile?.isApproved ?? false });
    } else {
      playerList.push({ ...base, role: "player" });
    }
  }

  trainerList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  playerList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  // Fetch paid bookings with session + trainer info
  const allBookings = await db.select().from(bookings).where(eq(bookings.status, "paid")).orderBy(desc(bookings.createdAt));
  const sessionIds = [...new Set(allBookings.map((b) => b.sessionId).filter(Boolean).map((id) => parseInt(id!)).filter((n) => !isNaN(n)))];
  const sessionMap: Record<number, { title: string; trainerClerkId: string }> = {};
  if (sessionIds.length) {
    const rows = await db.select({ id: trainerSessions.id, title: trainerSessions.title, trainerClerkId: trainerSessions.trainerClerkId }).from(trainerSessions).where(inArray(trainerSessions.id, sessionIds));
    for (const r of rows) sessionMap[r.id] = { title: r.title, trainerClerkId: r.trainerClerkId };
  }
  const bookingTrainerClerkIds = [...new Set([...allBookings.map((b) => b.trainerClerkId).filter(Boolean) as string[], ...Object.values(sessionMap).map((s) => s.trainerClerkId).filter(Boolean)])];
  const trainerNameMap: Record<string, string> = {};
  if (bookingTrainerClerkIds.length) {
    const rows = await db.select({ clerkId: trainers.clerkId, name: trainers.name }).from(trainers).where(inArray(trainers.clerkId, bookingTrainerClerkIds));
    for (const r of rows) if (r.clerkId) trainerNameMap[r.clerkId] = r.name;
  }
  const bookingList = allBookings.map((b) => {
    const sid = b.sessionId ? parseInt(b.sessionId) : null;
    const session = sid ? sessionMap[sid] : null;
    const trainerClerkId = b.trainerClerkId ?? session?.trainerClerkId ?? null;
    return {
      id: b.id,
      createdAt: b.createdAt?.toISOString() ?? "",
      userName: b.userName ?? "",
      userEmail: b.userEmail ?? "",
      athleteName: b.athleteName ?? "",
      sessionTitle: session?.title ?? (b.bookingType === "private" ? "Private Session" : "Unknown"),
      bookingType: b.bookingType ?? "group",
      sessionCount: b.sessionCount ?? 1,
      amountPaid: b.amountPaid ?? 0,
      trainerAmount: Math.round((b.amountPaid ?? 0) * 0.85),
      trainerName: trainerClerkId ? (trainerNameMap[trainerClerkId] ?? "Unknown") : "Unknown",
      trainerPaid: b.trainerPaid,
      trainerPaidAt: b.trainerPaidAt?.toISOString() ?? null,
    };
  });

  // Fetch all sessions with booking counts
  const allSessions = await db.select().from(trainerSessions).orderBy(desc(trainerSessions.createdAt));

  // Booking counts per session
  const paidBookings = await db.select({ sessionId: bookings.sessionId }).from(bookings).where(eq(bookings.status, "paid"));
  const bookingsPerSession: Record<string, number> = {};
  for (const b of paidBookings) {
    if (b.sessionId) bookingsPerSession[b.sessionId] = (bookingsPerSession[b.sessionId] ?? 0) + 1;
  }

  // Trainer names for sessions
  const sessionTrainerIds = [...new Set(allSessions.map((s) => s.trainerClerkId).filter(Boolean))];
  const sessionTrainerMap: Record<string, string> = {};
  if (sessionTrainerIds.length) {
    const rows = await db.select({ clerkId: trainers.clerkId, name: trainers.name }).from(trainers).where(inArray(trainers.clerkId, sessionTrainerIds));
    for (const r of rows) if (r.clerkId) sessionTrainerMap[r.clerkId] = r.name;
  }

  const sessionList = allSessions.map((s) => ({
    id: s.id,
    title: s.title,
    trainerName: sessionTrainerMap[s.trainerClerkId] ?? "Unknown",
    trainerClerkId: s.trainerClerkId,
    sessionType: s.sessionType ?? "group",
    pricePerPlayer: s.pricePerPlayer,
    spotsTotal: s.spotsTotal,
    spotsLeft: s.spotsLeft,
    bookingCount: bookingsPerSession[String(s.id)] ?? 0,
    isActive: s.isActive ?? false,
    createdAt: s.createdAt?.toISOString() ?? "",
    city: s.city ?? "",
    sport: s.sport ?? "",
  }));

  return <AdminClient trainers={trainerList} players={playerList} bookings={bookingList} sessions={sessionList} />;
}
