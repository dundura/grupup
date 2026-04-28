import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers, trainerSessions, bookings } from "@/db/schema";
import { eq, count } from "drizzle-orm";
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
      trainerList.push({ ...base, role: "trainer" });
    } else {
      playerList.push({ ...base, role: "player" });
    }
  }

  trainerList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  playerList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  return <AdminClient trainers={trainerList} players={playerList} />;
}
