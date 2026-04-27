"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/components/marketing/SessionCard";
import type { GroupSession } from "@/lib/types";

const sports = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const sessionTypes = ["All Types", "Private", "Semi-Private", "Small Group", "Clinic"];
const skillLevels = ["Any Level", "Beginner", "Intermediate", "Advanced", "Elite"];
const days = ["Any Day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const typeValueMap: Record<string, string> = {
  "All Types": "", "Private": "private", "Semi-Private": "semi-private",
  "Small Group": "small-group", "Clinic": "clinic",
};

function SessionsPageInner() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "";

  const [allSessions, setAllSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(
    initialSport ? initialSport.charAt(0).toUpperCase() + initialSport.slice(1) : "All Sports"
  );
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedState, setSelectedState]     = useState("All States");
  const [selectedCity, setSelectedCity]       = useState("All Cities");
  const [selectedType, setSelectedType]       = useState("All Types");
  const [selectedDay, setSelectedDay]         = useState("Any Day");
  const [selectedLevel, setSelectedLevel]     = useState("Any Level");
  const [filtersOpen, setFiltersOpen]         = useState(false);
  const [sessionTypeOpen, setSessionTypeOpen] = useState(false);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setAllSessions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAllSessions([]); setLoading(false); });
  }, []);

  // Build cascading location options from real data
  const countries = useMemo(() =>
    ["All Countries", ...Array.from(new Set(allSessions.map((s) => (s as any).country).filter(Boolean))).sort()],
    [allSessions]
  );
  const states = useMemo(() => {
    const filtered = selectedCountry === "All Countries"
      ? allSessions
      : allSessions.filter((s) => (s as any).country === selectedCountry);
    return ["All States", ...Array.from(new Set(filtered.map((s) => s.state).filter(Boolean))).sort()];
  }, [allSessions, selectedCountry]);

  const cities = useMemo(() => {
    const filtered = allSessions.filter((s) => {
      if (selectedCountry !== "All Countries" && (s as any).country !== selectedCountry) return false;
      if (selectedState !== "All States" && s.state !== selectedState) return false;
      return true;
    });
    return ["All Cities", ...Array.from(new Set(filtered.map((s) => s.city).filter(Boolean))).sort()];
  }, [allSessions, selectedCountry, selectedState]);

  const filtered = useMemo(() => {
    return allSessions.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !(s.focus ?? "").toLowerCase().includes(q) &&
          !s.trainer.name.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) &&
          !s.sport.toLowerCase().includes(q)) return false;
      }
      if (selectedSport !== "All Sports" && s.sport !== selectedSport) return false;
      if (selectedCountry !== "All Countries" && (s as any).country !== selectedCountry) return false;
      if (selectedState !== "All States" && s.state !== selectedState) return false;
      if (selectedCity !== "All Cities" && s.city !== selectedCity) return false;
      if (typeValueMap[selectedType] && s.sessionType !== typeValueMap[selectedType]) return false;
      if (selectedDay !== "Any Day" && s.dayOfWeek !== selectedDay) return false;
      if (selectedLevel !== "Any Level" && s.skillLevel !== selectedLevel) return false;
      return true;
    });
  }, [allSessions, search, selectedSport, selectedCountry, selectedState, selectedCity, selectedType, selectedDay, selectedLevel]);

  const hasFilters = selectedSport !== "All Sports" || selectedCountry !== "All Countries" ||
    selectedState !== "All States" || selectedCity !== "All Cities" ||
    selectedType !== "All Types" || selectedDay !== "Any Day" || selectedLevel !== "Any Level";

  function resetFilters() {
    setSelectedSport("All Sports"); setSelectedCountry("All Countries");
    setSelectedState("All States"); setSelectedCity("All Cities");
    setSelectedType("All Types"); setSelectedDay("Any Day");
    setSelectedLevel("Any Level"); setSearch("");
  }

  function onCountryChange(c: string) {
    setSelectedCountry(c); setSelectedState("All States"); setSelectedCity("All Cities");
  }
  function onStateChange(s: string) {
    setSelectedState(s); setSelectedCity("All Cities");
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Session Type — collapsed by default */}
      <div>
        <button
          type="button"
          onClick={() => setSessionTypeOpen((v) => !v)}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Session Type
          <span className="text-base leading-none">{sessionTypeOpen ? "−" : "+"}</span>
        </button>
        {sessionTypeOpen && (
          <div className="space-y-1">
            {sessionTypes.map((t) => (
              <button key={t} onClick={() => setSelectedType(t)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === t ? "text-white" : "text-foreground hover:bg-muted"}`}
                style={selectedType === t ? { backgroundColor: "#0F3154" } : undefined}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Location — cascading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
        <div className="space-y-2">
          <select value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
          {selectedCountry !== "All Countries" && (
            <select value={selectedState} onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
          {selectedState !== "All States" && (
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Skill Level</p>
        <div className="space-y-1">
          {skillLevels.map((l) => (
            <button key={l} onClick={() => setSelectedLevel(l)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLevel === l ? "text-white" : "text-foreground hover:bg-muted"}`}
              style={selectedLevel === l ? { backgroundColor: "#0F3154" } : undefined}>{l}</button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={resetFilters} className="text-sm text-[#DC373E] font-medium hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  const activeFilterCount =
    (selectedSport !== "All Sports" ? 1 : 0) +
    (selectedType !== "All Types" ? 1 : 0) +
    (selectedLevel !== "Any Level" ? 1 : 0) +
    (selectedCountry !== "All Countries" ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Search bar */}
      <div className="bg-white border-b py-6 px-4">
        <div className="container max-w-7xl">
          <h1 className="text-2xl font-bold mb-5">Find a Group Session</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search by sport, trainer, city, or focus…"
                value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white h-11" />
            </div>
            <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring h-11">
              {sports.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="px-6 h-11 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
              style={{ backgroundColor: "#0F3154" }}>
              <Search className="h-4 w-4 inline mr-2" />Find Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="bg-white border-b py-3 px-4">
        <div className="container max-w-7xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Session type pill */}
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border rounded-full px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
              style={selectedType !== "All Types" ? { borderColor: "#0F3154", color: "#0F3154" } : undefined}>
              {sessionTypes.map((t) => <option key={t}>{t}</option>)}
            </select>

            {/* Skill level pill */}
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs border rounded-full px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
              style={selectedLevel !== "Any Level" ? { borderColor: "#0F3154", color: "#0F3154" } : undefined}>
              {skillLevels.map((l) => <option key={l}>{l}</option>)}
            </select>

            {/* Location pill */}
            <select value={selectedCountry} onChange={(e) => { onCountryChange(e.target.value); }}
              className="text-xs border rounded-full px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
              style={selectedCountry !== "All Countries" ? { borderColor: "#0F3154", color: "#0F3154" } : undefined}>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <span className="text-sm text-muted-foreground whitespace-nowrap ml-auto">
            {loading ? "…" : <><strong>{filtered.length}</strong> session{filtered.length === 1 ? "" : "s"} found</>}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="container max-w-7xl py-8 px-4">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-6">
              {hasFilters ? "Try adjusting your filters." : "Be the first trainer to post a session."}
            </p>
            {hasFilters && <Button onClick={resetFilters}>Clear all filters</Button>}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((session) => <SessionCard key={session.id} session={session} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading...</div>}>
      <SessionsPageInner />
    </Suspense>
  );
}
