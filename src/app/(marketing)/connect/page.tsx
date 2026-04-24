"use client";

import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/marketing/PlayerCard";
import { playerProfiles } from "@/lib/mock-data";
import { COMPETITIVE_TIERS } from "@/lib/types";
import Link from "next/link";

const ALL_SPORTS = ["All Sports", "Soccer", "Basketball"];
const ALL_CITIES = ["All Cities", ...Array.from(new Set(playerProfiles.map((p) => p.city))).sort()];

export default function ConnectPage() {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All Sports");
  const [tier, setTier] = useState("All Tiers");
  const [city, setCity] = useState("All Cities");

  const filtered = useMemo(() => {
    return playerProfiles.filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.firstName.toLowerCase().includes(q) && !p.lastName.toLowerCase().includes(q) && !p.team.toLowerCase().includes(q)) return false;
      if (sport !== "All Sports" && p.sport !== sport) return false;
      if (tier !== "All Tiers" && p.competitiveTier !== tier) return false;
      if (city !== "All Cities" && p.city !== city) return false;
      return true;
    });
  }, [search, sport, tier, city]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="py-12 md:py-16 border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-7 w-7 text-white/70" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Connect</h1>
          </div>
          <p className="text-white/70 text-lg max-w-xl">
            Find players at your level. Follow them, coordinate group sessions, and build your training crew.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or team…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-56 flex-shrink-0 space-y-6">
            {/* Sport */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sport</p>
              <div className="flex flex-col gap-1">
                {ALL_SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      sport === s
                        ? "font-semibold text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                    }`}
                    style={sport === s ? { backgroundColor: "#0F3154" } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Competitive tier */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Level</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setTier("All Tiers")}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    tier === "All Tiers"
                      ? "font-semibold text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                  style={tier === "All Tiers" ? { backgroundColor: "#0F3154" } : {}}
                >
                  All Levels
                </button>
                {COMPETITIVE_TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      tier === t
                        ? "font-semibold text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                    }`}
                    style={tier === t ? { backgroundColor: "#0F3154" } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">City</p>
              <div className="flex flex-col gap-1">
                {ALL_CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      city === c
                        ? "font-semibold text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                    }`}
                    style={city === c ? { backgroundColor: "#0F3154" } : {}}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border rounded-xl p-4 bg-card">
              <p className="text-sm font-semibold mb-1">Not listed yet?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Create your player profile so others can find and follow you.
              </p>
              <Button size="sm" asChild className="w-full text-white" style={{ backgroundColor: "#DC373E" }}>
                <Link href="/profile/create">Post your profile</Link>
              </Button>
            </div>
          </aside>

          {/* Player grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filtered.length} player{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-semibold mb-1">No players found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
