import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, Users, Calendar, Dumbbell } from "lucide-react";

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
    sport: string; level: string; league: string; bio: string; team: string; birthYear: string;
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
          league?: string; bio?: string; photo?: string; team?: string; birthYear?: string;
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
          birthYear: meta.birthYear ?? "",
        };
      });
  } catch {
    // silently fail
  }

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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6"
              style={{ backgroundColor: "#f0f4f9" }}>
              <Users className="h-8 w-8" style={{ color: "#0F3154" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">No players yet</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Be the first to join! Create an account and get approved to appear here.
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
                return (
                  <Link key={p.id} href={`/connect/${p.id}`} className="block bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all">

                    {/* Avatar / photo header */}
                    <div className="relative h-36 overflow-hidden">
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill className="object-cover object-top"
                          sizes="(max-width: 768px) 100vw, 25vw" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}bb 100%)` }}>
                          <span className="text-5xl font-extrabold text-white/90 select-none">{initials}</span>
                        </div>
                      )}
                      {p.sport && (
                        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm"
                          style={{ color: "#0F3154" }}>
                          {p.sport}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-bold text-base leading-tight">{p.name}</h3>
                        {(p.city || p.country) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{[p.city, p.country].filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      {p.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{p.bio}</p>
                      )}

                      {/* Details row */}
                      {(p.team || p.league || p.level || p.birthYear) && (
                        <div className="space-y-1.5 pt-1 border-t border-gray-100">
                          {p.team && (
                            <div className="flex items-center gap-2 text-xs">
                              <Users className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{p.team}</span>
                            </div>
                          )}
                          {p.league && (
                            <div className="flex items-center gap-2 text-xs">
                              <Trophy className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{p.league}</span>
                            </div>
                          )}
                          {p.level && (
                            <div className="flex items-center gap-2 text-xs">
                              <Dumbbell className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{p.level}</span>
                            </div>
                          )}
                          {p.birthYear && (
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-medium">{p.birthYear}</span>
                            </div>
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
