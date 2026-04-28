import { auth, clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { Users, MapPin, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

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
          league?: string; bio?: string; photo?: string;
        };
        return {
          id: u.id,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.emailAddresses?.[0]?.emailAddress ?? "Player",
          photo: meta.photo ?? u.imageUrl ?? "",
          city: meta.city ?? "",
          country: meta.country ?? "",
          sport: meta.sport ?? "",
          level: meta.level ?? "",
          league: meta.league ?? "",
          bio: meta.bio ?? "",
          team: (meta as any).team ?? "",
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
            Find players and parents looking for group training partners near you.
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
              Be the first to join! Create a free account and get approved to appear here and find training partners.
            </p>
            <Link href="/sign-up"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#DC373E" }}>
              Create your profile
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{approvedPlayers.length} player{approvedPlayers.length !== 1 ? "s" : ""} looking for training partners</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {approvedPlayers.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="48px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                          style={{ backgroundColor: "#0F3154" }}>
                          {p.name?.[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.name}</p>
                      {(p.city || p.country) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{[p.city, p.country].filter(Boolean).join(", ")}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {p.bio && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {p.sport && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                        {p.sport}
                      </span>
                    )}
                    {p.level && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                        {p.level}
                      </span>
                    )}
                    {p.team && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                        {p.team}
                      </span>
                    )}
                    {p.league && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: "#fff3cd", color: "#92400e" }}>
                        <Trophy className="h-3 w-3" /> {p.league}
                      </span>
                    )}
                  </div>
                  <Link href={`/connect/${p.id}`}
                    className="mt-2 block w-full text-center py-2 rounded-xl border text-xs font-semibold transition-colors hover:bg-[#f0f4f9]"
                    style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                    View profile
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
