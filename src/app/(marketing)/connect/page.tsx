import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, Users } from "lucide-react";

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

export default async function ConnectPage() {
  let approvedPlayers: {
    id: string; name: string; photo: string; city: string; country: string;
    sport: string; level: string; league: string; bio: string; team: string;
  }[] = [];

  try {
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({ limit: 500 });

    approvedPlayers = clerkUsers
      .filter((u) => {
        const meta = u.publicMetadata as { role?: string; isApproved?: boolean; isHidden?: boolean };
        return (meta.role === "player" || meta.role === "parent") && meta.isApproved && !meta.isHidden;
      })
      .map((u) => {
        const meta = u.publicMetadata as {
          city?: string; country?: string; sport?: string; level?: string;
          league?: string; bio?: string; photo?: string; team?: string;
        };
        return {
          id: u.id,
          name: (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) || (u.emailAddresses?.[0]?.emailAddress ?? "Player"),
          photo: meta.photo ?? u.imageUrl ?? "",
          city: meta.city ?? "",
          country: meta.country ?? "",
          sport: meta.sport ?? "",
          level: meta.level ?? "",
          league: meta.league ?? "",
          bio: meta.bio ?? "",
          team: meta.team ?? "",
        };
      });
  } catch {
    // silently fail — show empty state
  }

  return (
    <div>
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Connect</h1>
          <p className="text-muted-foreground">
            Find players looking for group training partners near you.
          </p>
        </div>
      </div>

      <div className="container py-10">
        {approvedPlayers.length === 0 ? (
          <div className="text-center max-w-md mx-auto py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6"
              style={{ backgroundColor: "#f0f4f9" }}>
              <Users className="h-8 w-8" style={{ color: "#0F3154" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">No players yet</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Be the first to join! Create an account and get approved to appear here and find training partners.
            </p>
            <Link href="/sign-up"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#DC373E" }}>
              Create your profile
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {approvedPlayers.length} player{approvedPlayers.length !== 1 ? "s" : ""} looking for training partners
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {approvedPlayers.map((p) => {
                const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const bg = avatarColor(p.name);
                const tags = [p.team, p.league, p.level, p.sport].filter(Boolean);
                return (
                  <Link key={p.id} href={`/connect/${p.id}`}
                    className="group block bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all">

                    {/* Photo / avatar header */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)` }}>
                          <span className="text-5xl font-extrabold text-white/90 select-none">{initials}</span>
                        </div>
                      )}
                      {/* Sport pill top-right */}
                      {p.sport && (
                        <div className="absolute top-3 right-3 bg-background/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold">
                          {p.sport}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg leading-tight mb-1">{p.name}</h3>

                      {(p.city || p.country) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{[p.city, p.country].filter(Boolean).join(", ")}</span>
                        </div>
                      )}

                      {p.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                          {p.bio}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.team && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                              <Users className="h-3 w-3" /> {p.team}
                            </span>
                          )}
                          {p.league && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: "#fff3cd", color: "#92400e" }}>
                              <Trophy className="h-3 w-3" /> {p.league}
                            </span>
                          )}
                          {p.level && !p.league && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                              {p.level}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
