"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const INTERVAL = 5000;
const ADMIN_EMAIL = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

interface PlayerProfile {
  id: number;
  clerkUserId: string;
  name: string;
  photo: string | null;
  city: string | null;
  sport: string | null;
  skillLevel: string | null;
  birthYear: number | null;
  team?: string | null;
  bio?: string | null;
}

const COLORS = ["#0F3154", "#1a4a7a", "#163d6b", "#0d2d4a"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function FeaturedPlayersCarousel() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [active, setActive] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const isAdmin = ADMIN_EMAIL.some((e) => user?.emailAddresses?.some((a) => a.emailAddress === e));

  const load = useCallback(async () => {
    try {
      const featured = await fetch("/api/admin/feature-player").then((r) => r.json());
      if (Array.isArray(featured) && featured.length > 0) {
        setProfiles(featured);
      } else {
        const all = await fetch("/api/players/connect").then((r) => r.json());
        if (Array.isArray(all)) setProfiles(all);
      }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const go = useCallback((next: number) => {
    if (profiles.length === 0) return;
    setActive((next + profiles.length) % profiles.length);
  }, [profiles.length]);

  useEffect(() => {
    if (profiles.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % profiles.length), INTERVAL);
    return () => clearInterval(id);
  }, [profiles.length]);

  async function toggleFeatured(e: React.MouseEvent, p: PlayerProfile) {
    e.preventDefault();
    if (togglingId === p.id) return;
    setTogglingId(p.id);
    await fetch("/api/admin/feature-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId: p.clerkUserId, featured: false }),
    });
    load();
    setTogglingId(null);
  }

  if (profiles.length === 0) return null;

  const CARD_W = 260;
  const GAP = 16;

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container max-w-5xl">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#DC373E" }}>
              Players on GrupUp
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Follow players,{" "}
              <span style={{ color: "#0F3154" }}>train together</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Follow local players to join training sessions, find training partners, and build your network.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => go(active - 1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(active + 1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "#0F3154" }}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <Link href="/connect"
              className="ml-1 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#DC373E" }}>
              Browse All
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded-full mb-6 overflow-hidden bg-gray-100">
          <div key={active} className="h-full rounded-full"
            style={{ backgroundColor: "#DC373E", animation: `grow ${INTERVAL}ms linear forwards` }} />
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ gap: GAP, transform: `translateX(calc(-${active} * ${CARD_W + GAP}px))` }}
          >
            {profiles.map((p, i) => {
              const isActive = i === active;
              return (
                <div
                  key={p.id}
                  className="relative shrink-0 transition-all duration-500"
                  style={{ width: CARD_W, opacity: isActive ? 1 : 0.5, transform: isActive ? "scale(1)" : "scale(0.96)" }}
                >
                  <Link href={`/connect/${p.clerkUserId}`} className="block bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Photo */}
                    <div className="relative h-52 w-full" style={{ backgroundColor: avatarColor(p.name) }}>
                      {p.photo ? (
                        <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-extrabold text-white/30">{p.name[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-bold text-sm leading-snug truncate" style={{ color: "#0F3154" }}>{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {p.sport && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>{p.sport}</span>}
                        {p.skillLevel && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>{p.skillLevel}</span>}
                        {p.birthYear && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 border text-muted-foreground">{new Date().getFullYear() - p.birthYear}y</span>}
                      </div>
                      {p.team && <p className="text-[10px] text-muted-foreground mt-1 truncate">{p.team}</p>}
                      {p.bio && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.bio.length > 60 ? p.bio.slice(0, 60) + "…" : p.bio}</p>}
                      {p.city && !p.bio && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />{p.city}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Admin — click to remove from carousel */}
                  {isAdmin && (
                    <button
                      onClick={(e) => toggleFeatured(e, p)}
                      disabled={togglingId === p.id}
                      title="Remove from carousel"
                      className="absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full shadow-lg border transition-colors"
                      style={{ backgroundColor: "#DC373E", borderColor: "#DC373E" }}
                    >
                      <Star className="h-4 w-4" style={{ color: "white" }} fill="white" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {profiles.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === active ? 28 : 10, height: 10, backgroundColor: i === active ? "#DC373E" : "#CBD5E1" }} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes grow { from { width: 0% } to { width: 100% } }
      `}</style>
    </section>
  );
}
