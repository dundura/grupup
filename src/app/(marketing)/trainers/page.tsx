"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, ChevronRight, SlidersHorizontal, X, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TrainerRow {
  id: string; name: string; photo: string; bio: string;
  city: string; state: string; rating: number; reviewCount: number;
  yearsExperience: number; specialties: string[]; certifications: string[];
  skillLevels: string[]; sports: string[]; sport: string;
  hourlyRate: number; hasActiveSessions: boolean;
}

const SPORTS = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const SPECIALTIES = ["Finishing", "Ball Mastery", "Ball Control", "Speed & Agility", "Goalkeeping", "Defending", "1v1", "Youth Development", "Technical Skills", "Passing", "Shooting"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
const PRICE = [
  { label: "Any price", max: Infinity },
  { label: "Under $50/hr", max: 50 },
  { label: "Under $75/hr", max: 75 },
  { label: "Under $100/hr", max: 100 },
];

export default function TrainersPage() {
  const [allTrainers, setAllTrainers] = useState<TrainerRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [cityFilter, setCityFilter]   = useState("");
  const [sportFilter, setSportFilter] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [priceMax, setPriceMax]       = useState(Infinity);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/trainers")
      .then((r) => r.json())
      .then((data) => { setAllTrainers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAllTrainers([]); setLoading(false); });
  }, []);

  const filtered = useMemo(() =>
    allTrainers.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.city?.toLowerCase().includes(q) &&
          !(t.sports ?? []).some((s) => s.toLowerCase().includes(q)) &&
          !(t.specialties ?? []).some((s) => s.toLowerCase().includes(q))) return false;
      }
      if (cityFilter.trim()) {
        const c = cityFilter.trim().toLowerCase();
        if (!t.city?.toLowerCase().includes(c) && !t.state?.toLowerCase().includes(c)) return false;
      }
      if (sportFilter.length > 0) {
        const trainerSports = [...(t.sports ?? []), t.sport].filter(Boolean);
        if (!sportFilter.some((s) => trainerSports.includes(s))) return false;
      }
      if (specialtyFilter.length > 0) {
        if (!specialtyFilter.some((s) => (t.specialties ?? []).includes(s))) return false;
      }
      if (levelFilter.length > 0) {
        if (!levelFilter.some((l) => (t.skillLevels ?? []).includes(l))) return false;
      }
      if (priceMax < Infinity && t.hourlyRate > priceMax) return false;
      return true;
    }),
    [allTrainers, search, cityFilter, sportFilter, specialtyFilter, levelFilter, priceMax]
  );

  const activeFilters = sportFilter.length + specialtyFilter.length + levelFilter.length +
    (priceMax < Infinity ? 1 : 0) + (cityFilter.trim() ? 1 : 0);

  function clearAll() {
    setSearch(""); setCityFilter(""); setSportFilter([]);
    setSpecialtyFilter([]); setLevelFilter([]); setPriceMax(Infinity);
  }
  function toggleSport(s: string)     { setSportFilter((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }
  function toggleSpecialty(s: string) { setSpecialtyFilter((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }
  function toggleLevel(l: string)     { setLevelFilter((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]); }

  const sidebar = (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
            placeholder="City or state" className="pl-8 text-sm h-9" />
        </div>
      </div>

      {/* Sport */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sport</p>
        <div className="space-y-1.5">
          {SPORTS.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sportFilter.includes(s)} onChange={() => toggleSport(s)}
                className="rounded border-gray-300 accent-[#0F3154] h-3.5 w-3.5" />
              <span className="text-sm" style={{ color: sportFilter.includes(s) ? "#0F3154" : undefined }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Specialty</p>
        <div className="space-y-1.5">
          {SPECIALTIES.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={specialtyFilter.includes(s)} onChange={() => toggleSpecialty(s)}
                className="rounded border-gray-300 accent-[#0F3154] h-3.5 w-3.5" />
              <span className="text-sm" style={{ color: specialtyFilter.includes(s) ? "#0F3154" : undefined }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skill level */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Player Level</p>
        <div className="space-y-1.5">
          {LEVELS.map((l) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={levelFilter.includes(l)} onChange={() => toggleLevel(l)}
                className="rounded border-gray-300 accent-[#0F3154] h-3.5 w-3.5" />
              <span className="text-sm" style={{ color: levelFilter.includes(l) ? "#0F3154" : undefined }}>{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Price (private rate)</p>
        <div className="space-y-1.5">
          {PRICE.map((p) => (
            <label key={p.label} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="price" checked={priceMax === p.max} onChange={() => setPriceMax(p.max)}
                className="accent-[#0F3154] h-3.5 w-3.5" />
              <span className="text-sm" style={{ color: priceMax === p.max ? "#0F3154" : undefined }}>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilters > 0 && (
        <button onClick={clearAll} className="text-xs font-semibold text-[#DC373E] hover:underline flex items-center gap-1">
          <X className="h-3 w-3" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top bar */}
      <div className="bg-white border-b">
        <div className="container py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search by name, city, or sport…"
                value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
            </div>
            <button className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium relative"
              onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: "#DC373E" }}>{activeFilters}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-20">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <p className="font-semibold text-sm">Filters</p>
                {activeFilters > 0 && (
                  <button onClick={clearAll} className="text-xs text-[#DC373E] font-semibold hover:underline">
                    Clear ({activeFilters})
                  </button>
                )}
              </div>
              {sidebar}
            </div>
          </aside>

          {/* Cards */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4">
              {loading ? "Loading trainers…" : (
                <><span className="font-semibold text-foreground">{filtered.length}</span> trainer{filtered.length === 1 ? "" : "s"} available{cityFilter ? ` near "${cityFilter}"` : ""}</>
              )}
            </p>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-white border animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border p-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold text-lg mb-1">No trainers found</p>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters.</p>
                <button onClick={clearAll} className="text-sm font-semibold text-[#DC373E] hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((t) => <TrainerCard key={t.id} trainer={t} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold">Filters</p>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {sidebar}
            <div className="pt-6">
              <button onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: "#DC373E" }}>
                Show {filtered.length} trainer{filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerCard({ trainer: t }: { trainer: TrainerRow }) {
  const sports = t.sports?.length ? t.sports : t.sport ? [t.sport] : [];
  const specialties = t.specialties ?? [];
  const primarySport = sports[0] ?? "";
  const tags = [...specialties].slice(0, 3);
  const bioText = t.bio?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
  const location = [t.city, t.state].filter(Boolean).join(", ");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Navy accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: "#0F3154" }} />

      <div className="p-5 flex gap-4">
        {/* Photo */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shrink-0 self-start mt-1">
          {t.photo ? (
            <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="80px" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#0F3154" }}>
              {t.name?.[0] ?? "?"}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">

            {/* Left: name + meta */}
            <div className="min-w-0">
              {/* Name + rating */}
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <Link href={`/groups/${t.id}`}
                  className="font-bold text-base hover:underline leading-tight"
                  style={{ color: "#0F3154" }}>
                  {t.name}
                </Link>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{t.rating?.toFixed(1) ?? "5.0"}</span>
                  {t.reviewCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-0.5">({t.reviewCount})</span>
                  )}
                </div>
              </div>

              {/* Verified badge */}
              <div className="flex items-center gap-1.5 text-xs text-green-700 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-semibold">Verified Trainer</span>
                {t.hasActiveSessions && (
                  <span className="ml-2 font-semibold" style={{ color: "#0F3154" }}>· Group sessions available</span>
                )}
              </div>

              {/* Sport + location */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-2.5">
                {primarySport && <span className="font-medium text-foreground">{primarySport}</span>}
                {location && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />{location}
                  </span>
                )}
                {t.yearsExperience > 0 && <span>{t.yearsExperience} yrs exp</span>}
              </div>

              {/* Bio */}
              {bioText && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">{bioText}</p>
              )}

              {/* Specialty tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: price + CTA */}
            <div className="shrink-0 flex flex-col items-end gap-2 self-start">
              {t.hourlyRate > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="text-2xl font-bold leading-tight" style={{ color: "#0F3154" }}>${t.hourlyRate}</p>
                  <p className="text-xs text-muted-foreground">per session</p>
                </div>
              )}
              <Link href={`/groups/${t.id}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#0F3154" }}>
                View Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
