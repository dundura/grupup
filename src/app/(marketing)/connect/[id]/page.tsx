import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, Clock } from "lucide-react";
import { db } from "@/db";
import { bookings, freePlayEvents, trainerSessions, playerFollows, userBlocks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import FollowPlayerButton from "./FollowPlayerButton";
import MessageButton from "@/components/messaging/MessageButton";
import BlockButton from "./BlockButton";

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
    videoLinks?: string[]; disableMessages?: boolean;
    availableForFreePlay?: boolean; openToTrain?: boolean;
    position?: string; improvementAreas?: string[];
    profilePhotos?: string[];
    socials?: { instagram?: string; tiktok?: string; twitter?: string; youtube?: string; facebook?: string; snapchat?: string };
  };
  const playerSports = meta.playerSports?.length ? meta.playerSports : (meta.sport ? [meta.sport] : []);

  const isOwner = viewerUserId === targetUserId;
  const isPlayer = meta.role === "player" || meta.role === "parent";
  if (!isPlayer) notFound();
  if (!isOwner && (!meta.isApproved || meta.isHidden)) redirect("/connect");

  const name = (`${target.firstName ?? ""} ${target.lastName ?? ""}`.trim()) || (target.emailAddresses?.[0]?.emailAddress ?? "Player");
  const photo = meta.photo ?? target.imageUrl ?? "";

  // Fetch follower count and whether viewer follows this player
  const [followerRows, viewerFollowRow, viewerBlockRow] = await Promise.all([
    db.select().from(playerFollows).where(and(eq(playerFollows.targetClerkId, targetUserId), eq(playerFollows.status, "approved"))),
    viewerUserId ? db.select().from(playerFollows).where(
      and(eq(playerFollows.followerClerkId, viewerUserId), eq(playerFollows.targetClerkId, targetUserId), eq(playerFollows.status, "approved"))
    ) : Promise.resolve([]),
    viewerUserId ? db.select().from(userBlocks).where(
      and(eq(userBlocks.blockerClerkId, viewerUserId), eq(userBlocks.blockedClerkId, targetUserId))
    ) : Promise.resolve([]),
  ]);
  const followerCount = followerRows.length;
  const isFollowing = viewerFollowRow.length > 0;
  const isBlocked = viewerBlockRow.length > 0;

  // Fetch Clerk profiles for followers (up to 12 for sidebar)
  const followerProfiles: { id: string; name: string; photo: string; slug: string }[] = [];
  if (followerRows.length > 0) {
    const followerClerkIds = followerRows.slice(0, 12).map((r) => r.followerClerkId);
    for (const fid of followerClerkIds) {
      try {
        const fu = await client.users.getUser(fid);
        const fmeta = fu.publicMetadata as { photo?: string; profileSlug?: string };
        followerProfiles.push({
          id: fid,
          name: `${fu.firstName ?? ""} ${fu.lastName ?? ""}`.trim() || "Player",
          photo: fmeta.photo ?? fu.imageUrl ?? "",
          slug: fmeta.profileSlug ?? fid,
        });
      } catch {}
    }
  }

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
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-2">
        <Link href="/connect" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Connect
        </Link>
        {isOwner && !meta.isApproved && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile pending approval</p>
              <p className="text-xs text-amber-700">Only you can see this until an admin approves it.</p>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-10 lg:flex lg:gap-8 lg:items-start lg:justify-between">
      <div className="flex-1 min-w-0">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5">
          <div className="sm:flex">

            {/* Photo — portrait on left */}
            <div className="relative sm:w-52 lg:w-64 sm:shrink-0 aspect-[3/4] sm:aspect-auto bg-[#0F3154]">
              {photo ? (
                <Image src={photo} alt={name} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 256px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-extrabold text-white/30">{name[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Info — right side */}
            <div className="flex-1 p-6 flex flex-col">

              {/* Name + action */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold leading-tight">{name}</h1>
                  {(meta.city || meta.country) && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[meta.city, meta.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="font-semibold text-foreground">{followerCount}</span> follower{followerCount !== 1 ? "s" : ""}
                  </p>
                </div>
                {isOwner && (
                  <Link href="/profile"
                    className="shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-[#f0f4f9]"
                    style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                    Edit
                  </Link>
                )}
              </div>

              {/* Sport / level / league / team tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {playerSports.map((s) => (
                  <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f9] border" style={{ color: "#0F3154" }}>{s}</span>
                ))}
                {meta.level && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>{meta.level}</span>
                )}
                {meta.league && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#fff3cd", color: "#92400e" }}>{meta.league}</span>
                )}
                {meta.team && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>{meta.team}</span>
                )}
                {meta.gender && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8fafc] border text-muted-foreground">{meta.gender}</span>
                )}
                {meta.birthYear && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8fafc] border text-muted-foreground">Born {meta.birthYear}</span>
                )}
              </div>

              {/* Availability */}
              {(meta.availableForFreePlay || meta.openToTrain) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {meta.availableForFreePlay && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold animate-pulse"
                      style={{ backgroundColor: "#fef2f2", color: "#DC373E", border: "1px solid #fca5a5" }}>
                      Seeking Free Play
                    </span>
                  )}
                  {meta.openToTrain && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold animate-pulse"
                      style={{ backgroundColor: "#eff6ff", color: "#3b82f6", border: "1px solid #93c5fd" }}>
                      Seeking Training
                    </span>
                  )}
                </div>
              )}

              {/* Bio / position / focus */}
              {(meta.bio || meta.position || (meta.improvementAreas?.length ?? 0) > 0) && (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden mb-4">
                  {meta.bio && (
                    <div className="flex gap-3 px-4 py-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5 font-medium">Looking for</span>
                      <p className="text-sm leading-relaxed text-foreground flex-1">{meta.bio}</p>
                    </div>
                  )}
                  {meta.position && (
                    <div className="flex gap-3 px-4 py-3 items-center">
                      <span className="text-xs text-muted-foreground w-24 shrink-0 font-medium">Position</span>
                      <p className="text-sm font-semibold" style={{ color: "#0F3154" }}>{meta.position}</p>
                    </div>
                  )}
                  {(meta.improvementAreas?.length ?? 0) > 0 && (
                    <div className="flex gap-3 px-4 py-3 items-start">
                      <span className="text-xs text-muted-foreground w-24 shrink-0 pt-1 font-medium">Focus</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {(meta.improvementAreas ?? []).map((area) => (
                          <span key={area} className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>{area}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Socials */}
              {meta.socials && Object.values(meta.socials).some(Boolean) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { key: "instagram", label: "Instagram", color: "#E1306C", icon: "📷" },
                    { key: "tiktok",    label: "TikTok",    color: "#000000", icon: "🎵" },
                    { key: "twitter",   label: "X",         color: "#1DA1F2", icon: "𝕏" },
                    { key: "youtube",   label: "YouTube",   color: "#FF0000", icon: "▶" },
                    { key: "facebook",  label: "Facebook",  color: "#1877F2", icon: "f" },
                    { key: "snapchat",  label: "Snapchat",  color: "#FFFC00", icon: "👻" },
                  ].map(({ key, label, color, icon }) => {
                    const url = (meta.socials as any)?.[key];
                    if (!url) return null;
                    const href = url.startsWith("http") ? url : `https://${url}`;
                    return (
                      <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: color === "#FFFC00" ? "#FFFC00" : `${color}18`, color: color === "#FFFC00" ? "#000" : color, border: `1px solid ${color}30` }}>
                        <span>{icon}</span> {label}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Follow / message actions — pinned to bottom */}
              {!isOwner && (
                <div className="flex items-center gap-2 flex-wrap mt-auto pt-2">
                  <FollowPlayerButton targetClerkId={targetUserId} initialFollowing={isFollowing} />
                  {isFollowing && <MessageButton toClerkId={targetUserId} toName={name} />}
                  <BlockButton targetClerkId={targetUserId} targetName={name} initialBlocked={isBlocked} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Highlight photos */}
        {(meta.profilePhotos ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(meta.profilePhotos ?? []).map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="200px" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlight videos */}
        {meta.videoLinks && meta.videoLinks.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Highlight Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meta.videoLinks.map((url, i) => {
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                if (ytMatch) {
                  return (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden">
                      <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                    </div>
                  );
                }
                if (vimeoMatch) {
                  return (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden">
                      <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="w-full h-full" />
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>
        )}

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
      </div>{/* end main column */}

        {/* Followers sidebar */}
        {followerProfiles.length > 0 && (
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border shadow-sm p-4 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Followers <span style={{ color: "#0F3154" }}>({followerCount})</span>
              </h2>
              <div className="space-y-3">
                {followerProfiles.map((f) => (
                  <Link key={f.id} href={`/connect/${f.slug}`}
                    className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                      {f.photo ? (
                        <Image src={f.photo} alt={f.name} fill className="object-cover" sizes="36px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                          {f.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium group-hover:text-[#0F3154] transition-colors truncate">{f.name}</span>
                  </Link>
                ))}
                {followerCount > 12 && (
                  <p className="text-xs text-muted-foreground pt-1">+{followerCount - 12} more</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
