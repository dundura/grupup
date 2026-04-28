import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, Users, Calendar, Dumbbell, ChevronLeft, Clock, UserPlus } from "lucide-react";
import { db } from "@/db";
import { bookings, freePlayEvents, trainerSessions, playerFollows } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import FollowPlayerButton from "./FollowPlayerButton";
import MessageButton from "@/components/messaging/MessageButton";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: viewerUserId } = await auth();
  const { id } = await params;

  const client = await clerkClient();

  let target: Awaited<ReturnType<typeof client.users.getUser>>;
  let targetUserId: string;

  // Resolve: if it looks like a Clerk userId use directly, otherwise search by profileSlug
  if (id.startsWith("user_")) {
    try {
      target = await client.users.getUser(id);
      targetUserId = id;
    } catch { notFound(); }
  } else {
    const { data: allUsers } = await client.users.getUserList({ limit: 500 });
    const found = allUsers.find((u) => (u.publicMetadata as { profileSlug?: string }).profileSlug === id);
    if (!found) notFound();
    target = found;
    targetUserId = found.id;
  }

  const meta = target.publicMetadata as {
    role?: string; isApproved?: boolean; isHidden?: boolean; photo?: string;
    city?: string; country?: string; sport?: string; playerSports?: string[]; level?: string;
    league?: string; team?: string; bio?: string; birthYear?: string; gender?: string;
  };
  const playerSports = meta.playerSports?.length ? meta.playerSports : (meta.sport ? [meta.sport] : []);

  const isOwner = viewerUserId === targetUserId;
  const isPlayer = meta.role === "player" || meta.role === "parent";
  if (!isPlayer) notFound();
  if (!isOwner && (!meta.isApproved || meta.isHidden)) redirect("/connect");

  const name = (`${target.firstName ?? ""} ${target.lastName ?? ""}`.trim()) || (target.emailAddresses?.[0]?.emailAddress ?? "Player");
  const photo = meta.photo ?? target.imageUrl ?? "";

  // Fetch follower count and whether viewer follows this player
  const [followerRows, viewerFollowRow] = await Promise.all([
    db.select().from(playerFollows).where(eq(playerFollows.targetClerkId, targetUserId)),
    viewerUserId ? db.select().from(playerFollows).where(
      and(eq(playerFollows.followerClerkId, viewerUserId), eq(playerFollows.targetClerkId, targetUserId))
    ) : Promise.resolve([]),
  ]);
  const followerCount = followerRows.length;
  const isFollowing = viewerFollowRow.length > 0;

  // Upcoming booked sessions
  const playerBookings = await db.select().from(bookings)
    .where(and(eq(bookings.clerkUserId, targetUserId), eq(bookings.status, "paid")))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  const sessionIds = [...new Set(playerBookings.map((b) => b.sessionId).filter(Boolean))];
  const sessionMap: Record<string, { title: string; sport: string; city: string; dayOfWeek: string; time: string }> = {};
  if (sessionIds.length) {
    const rows = await db.select({
      id: trainerSessions.id, title: trainerSessions.title, sport: trainerSessions.sport,
      city: trainerSessions.city, dayOfWeek: trainerSessions.dayOfWeek, time: trainerSessions.time,
    }).from(trainerSessions);
    for (const r of rows) sessionMap[String(r.id)] = { title: r.title, sport: r.sport, city: r.city ?? "", dayOfWeek: r.dayOfWeek ?? "", time: r.time ?? "" };
  }

  // Free play events they've created or joined
  const playerFreePlay = await db.select().from(freePlayEvents)
    .where(and(eq(freePlayEvents.organizerClerkId, targetUserId), eq(freePlayEvents.isActive, true)))
    .orderBy(desc(freePlayEvents.createdAt))
    .limit(5);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/connect" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Connect
        </Link>

        {/* Pending banner */}
        {isOwner && !meta.isApproved && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile pending approval</p>
              <p className="text-xs text-amber-700">Only you can see this until an admin approves it.</p>
            </div>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5">
          {/* Header image */}
          <div className="relative h-40 overflow-hidden bg-[#0F3154]">
            {photo ? (
              <Image src={photo} alt={name} fill className="object-contain" sizes="672px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-end justify-center pb-0">
                {/* Silhouette SVG */}
                <svg viewBox="0 0 120 100" className="h-36 w-auto opacity-20" fill="white">
                  <circle cx="60" cy="28" r="20" />
                  <path d="M20 100 Q20 60 60 60 Q100 60 100 100Z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                {(meta.city || meta.country) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[meta.city, meta.country].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold text-foreground">{followerCount}</span> follower{followerCount !== 1 ? "s" : ""}
                </p>
              </div>
              {!isOwner && (
                <div className="flex items-center gap-2">
                  <FollowPlayerButton targetClerkId={targetUserId} initialFollowing={isFollowing} />
                  <MessageButton toClerkId={targetUserId} toName={name} />
                </div>
              )}
              {isOwner && (
                <Link href="/profile"
                  className="shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-[#f0f4f9]"
                  style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                  Edit profile
                </Link>
              )}
            </div>

            {meta.bio && (
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">{meta.bio}</p>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {playerSports.length > 0 && (
                <div className="bg-[#f8fafc] rounded-xl p-3 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sports</p>
                  <div className="flex flex-wrap gap-1">
                    {playerSports.map((s) => (
                      <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border" style={{ color: "#0F3154" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {meta.gender && (
                <div className="bg-[#f8fafc] rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Gender</p>
                  <p className="text-sm font-semibold">{meta.gender}</p>
                </div>
              )}
              {meta.level && (
                <div className="bg-[#f8fafc] rounded-xl p-3">
                  <Dumbbell className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{meta.level}</p>
                </div>
              )}
              {meta.birthYear && (
                <div className="bg-[#f8fafc] rounded-xl p-3">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{meta.birthYear}</p>
                </div>
              )}
            </div>

            {/* Team + League */}
            {(meta.team || meta.league) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {meta.team && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                    <Users className="h-3 w-3" /> {meta.team}
                  </span>
                )}
                {meta.league && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#fff3cd", color: "#92400e" }}>
                    <Trophy className="h-3 w-3" /> {meta.league}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming sessions */}
        {playerBookings.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Booked Sessions</h2>
            <div className="space-y-3">
              {playerBookings.map((b) => {
                const s = b.sessionId ? sessionMap[b.sessionId] : null;
                return (
                  <div key={b.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{s?.title ?? "Session"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[s?.dayOfWeek, s?.time, s?.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {s?.sport && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                        {s.sport}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Free play events */}
        {playerFreePlay.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Free Play</h2>
            <div className="space-y-3">
              {playerFreePlay.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[e.city, e.date, e.time].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                    {e.sport}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
