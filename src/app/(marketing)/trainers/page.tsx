"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, Users, Calendar, ChevronDown, X, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TrainerRow {
  id: string; name: string; photo: string; bio: string;
  city: string; state: string; rating: number; reviewCount: number;
  yearsExperience: number; specialties: string[]; certifications: string[];
  skillLevels: string[]; sports: string[]; sport: string;
  hourlyRate: number; hasActiveSessions: boolean;
}

const SPORTS = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];

export default function TrainersPage() {
  const [allTrainers, setAllTrainers] = useState<TrainerRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [locationInput, setLocation]  = useState("");
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [groupOnly, setGroupOnly]     = useState(false);
  const [sortBy, setSortBy]           = useState<"best" | "price-low" | "price-high" | "rating">("best");
  const [moreOpen, setMoreOpen]       = useState(false);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/trainers")
      .then((r) => r.json())
      .then((data) => { setAllTrainers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAllTrainers([]); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = allTrainers.filter((t) => {
      if (locationInput.trim()) {
        const q = locationInput.trim().toLowerCase();
        const cityMatch = t.city?.toLowerCase().includes(q) || t.state?.toLowerCase().includes(q);
        // Also match zip if stored (future)
        if (!cityMatch) return false;
      }
      if (sportFilter !== "All Sports") {
        const trainerSports = [...(t.sports ?? []), t.sport].filter(Boolean);
        if (!trainerSports.includes(sportFilter)) return false;
      }
      if (groupOnly && !t.hasActiveSessions) return false;
      if (levelFilter.length > 0 && !(levelFilter.some((l) => (t.skillLevels ?? []).includes(l)))) return false;
      return true;
    });

    if (sortBy === "price-low")  list = [...list].sort((a, b) => a.hourlyRate - b.hourlyRate);
    if (sortBy === "price-high") list = [...list].sort((a, b) => b.hourlyRate - a.hourlyRate);
    if (sortBy === "rating")     list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [allTrainers, locationInput, sportFilter, groupOnly, sortBy, levelFilter]);

  const activePillCount = (groupOnly ? 1 : 0) + levelFilter.length;

  function clearAll() {
    setLocation(""); setSportFilter("All Sports");
    setGroupOnly(false); setLevelFilter([]);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* ── Search bar ── */}
      <div className="bg-white border-b py-6 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-2xl font-bold mb-5">Find a Trainer</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationInput}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or ZIP code"
                className="pl-9 bg-white h-11"
              />
            </div>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring h-11">
              {SPORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button
              className="px-6 h-11 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
              style={{ backgroundColor: "#0F3154" }}>
              <Search className="h-4 w-4 inline mr-2" />Search Trainers
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter pills + sort ── */}
      <div className="bg-white border-b py-3 px-4">
        <div className="container max-w-4xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setGroupOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${groupOnly ? "text-white border-transparent" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
              style={groupOnly ? { backgroundColor: "#0F3154" } : undefined}>
              <Users className="h-3.5 w-3.5" /> Group Sessions
            </button>

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:border-gray-400">
                More Filters {activePillCount > 0 && <span className="ml-1 text-[10px] font-bold bg-[#0F3154] text-white rounded-full h-4 w-4 inline-flex items-center justify-center">{activePillCount}</span>}
                <ChevronDown className={`h-3.5 w-3.5 ml-0.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border shadow-lg p-4 z-30 w-56">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Player Level</p>
                  {["Beginner", "Intermediate", "Advanced", "Elite"].map((l) => (
                    <label key={l} className="flex items-center gap-2 py-1.5 cursor-pointer text-sm">
                      <input type="checkbox" className="accent-[#0F3154]"
                        checked={levelFilter.includes(l)}
                        onChange={() => setLevelFilter((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l])} />
                      {l}
                    </label>
                  ))}
                  {(activePillCount > 0) && (
                    <button onClick={() => { setGroupOnly(false); setLevelFilter([]); setMoreOpen(false); }}
                      className="text-xs text-red-600 font-medium mt-2 hover:underline">Clear</button>
                  )}
                </div>
              )}
            </div>

            {activePillCount > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {loading ? "…" : <><strong>{filtered.length}</strong> trainer{filtered.length === 1 ? "" : "s"} found</>}
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none">
              <option value="best">Best Match</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="container max-w-4xl py-8 px-4">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-lg mb-1">No trainers found</p>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters.</p>
            <button onClick={clearAll} className="text-sm font-semibold text-[#DC373E] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => <TrainerCard key={t.id} trainer={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function tierLabel(exp: number): string {
  if (exp >= 7) return "GOLD";
  if (exp >= 3) return "SILVER";
  return "TRAINER";
}
function tierStyle(exp: number) {
  if (exp >= 7) return { bg: "#FEF3C7", color: "#92400E" };
  if (exp >= 3) return { bg: "#F1F5F9", color: "#475569" };
  return           { bg: "#EFF6FF", color: "#1D4ED8" };
}

function TrainerCard({ trainer: t }: { trainer: TrainerRow }) {
  const sports     = t.sports?.length ? t.sports : t.sport ? [t.sport] : [];
  const allSports  = sports.join(", ");
  const specialties = (t.specialties ?? []).slice(0, 3);
  const bioText    = t.bio?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
  const location   = [t.city, t.state].filter(Boolean).join(", ");
  const tier       = tierStyle(t.yearsExperience ?? 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">

      {/* Photo section with navy header + overlapping circular photo */}
      <div className="relative bg-white" style={{ paddingTop: "64px" }}>
        {/* Navy bar */}
        <div className="absolute top-0 left-0 right-0 h-16 rounded-t-2xl" style={{ backgroundColor: "#0F3154" }}>
          {/* Group badge in header */}
          {t.hasActiveSessions && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
              Group Sessions
            </span>
          )}
        </div>
        {/* Circular photo overlapping */}
        <div className="absolute left-4 top-4 z-10">
          <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
            {t.photo ? (
              <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="80px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: "#0F3154" }}>
                {t.name?.[0] ?? "?"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/groups/${t.id}`}
            className="font-bold text-base leading-snug hover:underline"
            style={{ color: "#0F3154" }}>
            {t.name}
          </Link>
          <div className="flex items-center gap-0.5 shrink-0 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{t.rating?.toFixed(1) ?? "5.0"}</span>
          </div>
        </div>

        {/* Tier + verified */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wider"
            style={{ backgroundColor: tier.bg, color: tier.color }}>
            {tierLabel(t.yearsExperience ?? 0)}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-green-700 font-medium">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        </div>

        {/* Bio */}
        {bioText && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{bioText}</p>
        )}

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground mb-3">
          {allSports && (
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {allSports}{t.skillLevels?.length ? ` · ${(t.skillLevels ?? []).join(", ")}` : ""}
            </p>
          )}
          {location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Trains in {location}
            </p>
          )}
          {t.yearsExperience > 0 && (
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {t.yearsExperience} years experience
            </p>
          )}
        </div>

        {/* Specialty tags */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: "#CBD5E1", color: "#334155", backgroundColor: "#F8FAFC" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {t.hourlyRate > 0 ? (
            <div>
              <span className="text-lg font-extrabold" style={{ color: "#0F3154" }}>${t.hourlyRate}</span>
              <span className="text-xs text-muted-foreground ml-1">/ session</span>
            </div>
          ) : <div />}
          <Link href={`/groups/${t.id}`}
            className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0F3154" }}>
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
