import { auth, clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Pencil } from "lucide-react";
import { db } from "@/db";
import { playerFollows } from "@/db/schema";
import { eq } from "drizzle-orm";
import FollowCardButton from "./FollowCardButton";

export const dynamic = "force-dynamic";

const COLORS = [
  "#0F3154", "#1a4a7a", "#1e3a5f", "#0d2d4a", "#163d6b",
  "#2d5986", "#1b4170", "#0e3560",
];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export default async function ConnectPage() {
  const { userId: viewerUserId } = await auth();

  // Single clerkClient instance for all Clerk calls on this page
  const client = await clerkClient();

  // Check if viewer is admin
  let isAdmin = false;
  if (viewerUserId) {
    try {
      const viewer = await client.users.getUser(viewerUserId);
      const email = viewer.emailAddresses?.[0]?.emailAddress ?? "";
      isAdmin = ADMIN_EMAILS.includes(email);
    } catch {}
  }

  // Viewer's current follows (to pre-populate follow button state)
  const viewerFollows = viewerUserId
    ? (await db.select({ targetClerkId: playerFollows.targetClerkId })
        .from(playerFollows).where(eq(playerFollows.followerClerkId, viewerUserId)))
        .map((r) => r.targetClerkId)
    : [];

  let approvedPlayers: {
    id: string; clerkId: string; name: string; photo: string; city: string; country: string;
    sports: string[]; level: string; league: string; bio: string;
    team: string; birthYear: string; gender: string;
    availableForFreePlay: boolean; openToTrain: boolean;
  }[] = [];

  try {
    const { data: clerkUsers } = await client.users.getUserList({ limit: 500 });

    for (const u of clerkUsers) {
      const meta = u.publicMetadata as {
        role?: string; isApproved?: boolean; isHidden?: boolean;
        city?: string; country?: string; sport?: string; playerSports?: string[]; level?: string;
        league?: string; bio?: string; photo?: string; team?: string; birthYear?: string;
        gender?: string; profileSlug?: string;
        availableForFreePlay?: boolean; openToTrain?: boolean;
        childProfiles?: Array<{
          id: string; slug: string; name: string; photo: string; sports: string[];
          level: string; league: string; team: string; birthYear: string; gender: string;
          bio: string; isHidden: boolean;
        }>;
      };

      if (!(meta.role === "player" || meta.role === "parent")) continue;

      // If user has child profiles, show each child as a card
      if (meta.childProfiles?.length) {
        for (const child of meta.childProfiles) {
          if (child.isHidden) continue;
          approvedPlayers.push({
            id: child.slug || `${u.id}-${child.id}`,
            clerkId: u.id,
            name: child.name || "Player",
            photo: child.photo || "",
            city: meta.city ?? "",
            country: meta.country ?? "",
            sports: child.sports ?? [],
            level: child.level ?? "",
            league: child.league ?? "",
            bio: child.bio ?? "",
            team: child.team ?? "",
            birthYear: child.birthYear ?? "",
            gender: child.gender ?? "",
            availableForFreePlay: meta.availableForFreePlay ?? false,
            openToTrain: meta.openToTrain ?? false,
          });
        }
      }

      // Also show the user's own profile card (unless hidden)
      if (!meta.isHidden) {
        const playerSports = meta.playerSports?.length ? meta.playerSports : (meta.sport ? [meta.sport] : []);
        approvedPlayers.push({
          id: meta.profileSlug ?? u.id,
          clerkId: u.id,
          name: (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) || (u.emailAddresses?.[0]?.emailAddress ?? "Player"),
          photo: meta.photo ?? u.imageUrl ?? "",
          city: meta.city ?? "",
          country: meta.country ?? "",
          sports: playerSports,
          level: meta.level ?? "",
          league: meta.league ?? "",
          bio: meta.bio ?? "",
          team: meta.team ?? "",
          birthYear: meta.birthYear ?? "",
          gender: meta.gender ?? "",
          availableForFreePlay: meta.availableForFreePlay ?? false,
          openToTrain: meta.openToTrain ?? false,
        });
      }
    }
  } catch (err) { console.error("[connect] failed to load players:", err); }

  return (
    <div>
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Connect</h1>
          <p className="text-muted-foreground">Find players looking for group training partners near you.</p>
        </div>
      </div>

      <div className="container py-10">
        {approvedPlayers.length === 0 ? (
          <div className="text-center max-w-md mx-auto py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6 bg-[#f0f4f9]">
              <Users className="h-8 w-8" style={{ color: "#0F3154" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">No players yet</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Be the first to join! Create an account and get approved to appear here.
            </p>
            <Link href="/sign-up"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#DC373E" }}>
              Create your profile
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-8">
              {approvedPlayers.length} player{approvedPlayers.length !== 1 ? "s" : ""} looking for training partners
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvedPlayers.map((p) => {
                const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const bg = avatarColor(p.name);
                const initialFollowing = viewerFollows.includes(p.clerkId);

                return (
                  <div key={p.id} className="relative pt-[80px]">
                    {/* Circular photo */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden"
                      style={{ backgroundColor: bg }}>
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="160px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)` }}>
                          <span className="text-5xl font-extrabold text-white/90 select-none">{initials}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin edit button */}
                    {isAdmin && (
                      <Link href={`/admin/edit/${p.clerkId}`}
                        className="absolute top-2 right-2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow transition-colors"
                        title="Edit profile">
                        <Pencil className="h-3.5 w-3.5" style={{ color: "#0F3154" }} />
                      </Link>
                    )}

                    {/* Dark navy top */}
                    <div className="rounded-t-2xl pt-[80px] pb-5 px-5 text-center" style={{ backgroundColor: "#0F3154" }}>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide mt-2 leading-tight">{p.name}</h3>
                      <div className="flex items-center justify-center flex-wrap gap-3 mt-3 text-white/70 text-xs">
                        {(p.city || p.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {[p.city, p.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {p.sports.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                          {p.gender && <span>{p.gender}</span>}
                      </div>
                      {(p.level || p.availableForFreePlay || p.openToTrain) && (
                        <div className="flex items-center justify-center flex-wrap gap-2 mt-3">
                          {p.level && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">
                              {p.level}
                            </span>
                          )}
                          {p.availableForFreePlay && (
                            <span className="px-2.5 py-1 rounded-full bg-[#DC373E]/25 text-[#FF9EA2] text-[11px] font-semibold animate-pulse">
                              Seeking Free Play
                            </span>
                          )}
                          {p.openToTrain && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/25 text-blue-300 text-[11px] font-semibold animate-pulse">
                              Seeking Training
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* White bottom */}
                    <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 px-5 py-4">
                      <div className="flex items-center justify-center gap-3 flex-wrap mb-4 text-xs">
                        {p.birthYear && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Born</span>
                            <span className="font-bold" style={{ color: "#0F3154" }}>{p.birthYear}</span>
                          </span>
                        )}
                        {(p.league || p.level) && (
                          <>
                            {p.birthYear && <span className="text-muted-foreground">·</span>}
                            <span className="font-bold" style={{ color: "#0F3154" }}>{p.league || p.level}</span>
                          </>
                        )}
                        {p.team && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="font-bold" style={{ color: "#0F3154" }}>{p.team}</span>
                          </>
                        )}
                      </div>
                      {p.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 text-left">{p.bio}</p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/connect/${p.id}`}
                          className="flex-1 block text-center py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: "#DC373E" }}>
                          View Profile
                        </Link>
                        <FollowCardButton
                          targetClerkId={p.clerkId}
                          initialFollowing={initialFollowing}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
