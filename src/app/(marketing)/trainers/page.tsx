"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/components/marketing/SessionCard";
import { groupSessions, cities } from "@/lib/mock-data";

const sports = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis"];
const sessionTypes = ["All Types", "Private", "Semi-Private", "Small Group", "Clinic"];
const skillLevels = ["Any Level", "Beginner", "Intermediate", "Advanced", "Elite"];
const days = ["Any Day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const typeValueMap: Record<string, string> = {
  "All Types": "",
  "Private": "private",
  "Semi-Private": "semi-private",
  "Small Group": "small-group",
  "Clinic": "clinic",
};

function SessionsPageInner() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "";
  const initialCity = searchParams.get("city") || "all";

  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(
    initialSport ? initialSport.charAt(0).toUpperCase() + initialSport.slice(1) : "All Sports"
  );
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDay, setSelectedDay] = useState("Any Day");
  const [selectedLevel, setSelectedLevel] = useState("Any Level");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return groupSessions.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.title.toLowerCase().includes(q) &&
          !s.focus.toLowerCase().includes(q) &&
          !s.trainer.name.toLowerCase().includes(q) &&
          !s.city.toLowerCase().includes(q) &&
          !s.sport.toLowerCase().includes(q)
        ) return false;
      }
      if (selectedSport !== "All Sports" && s.sport !== selectedSport) return false;
      if (selectedCity !== "all" && s.city !== selectedCity) return false;
      if (typeValueMap[selectedType] && s.sessionType !== typeValueMap[selectedType]) return false;
      if (selectedDay !== "Any Day" && s.dayOfWeek !== selectedDay) return false;
      if (selectedLevel !== "Any Level" && s.skillLevel !== selectedLevel) return false;
      return true;
    });
  }, [search, selectedSport, selectedCity, selectedDay, selectedLevel]);

  const hasFilters =
    selectedSport !== "All Sports" ||
    selectedCity !== "all" ||
    selectedType !== "All Types" ||
    selectedDay !== "Any Day" ||
    selectedLevel !== "Any Level";

  const resetFilters = () => {
    setSelectedSport("All Sports");
    setSelectedCity("all");
    setSelectedType("All Types");
    setSelectedDay("Any Day");
    setSelectedLevel("Any Level");
    setSearch("");
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Sport */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sport</p>
        <div className="space-y-1">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSport === s
                  ? "text-white"
                  : "text-foreground hover:bg-muted"
              }`}
              style={selectedSport === s ? { backgroundColor: "#0F3154" } : undefined}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Session Type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Session Type</p>
        <div className="space-y-1">
          {sessionTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === t ? "text-white" : "text-foreground hover:bg-muted"
              }`}
              style={selectedType === t ? { backgroundColor: "#0F3154" } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">City</p>
        <div className="space-y-1">
          {["All Cities", ...cities].map((c) => {
            const val = c === "All Cities" ? "all" : c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCity(val)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCity === val ? "text-white" : "text-foreground hover:bg-muted"
                }`}
                style={selectedCity === val ? { backgroundColor: "#0F3154" } : undefined}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Day of Week</p>
        <div className="space-y-1">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === d ? "text-white" : "text-foreground hover:bg-muted"
              }`}
              style={selectedDay === d ? { backgroundColor: "#0F3154" } : undefined}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Skill level */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Skill Level</p>
        <div className="space-y-1">
          {skillLevels.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLevel(l)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === l ? "text-white" : "text-foreground hover:bg-muted"
              }`}
              style={selectedLevel === l ? { backgroundColor: "#0F3154" } : undefined}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={resetFilters}
          className="text-sm text-[#DC373E] font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Find a Group Session</h1>
          <p className="text-muted-foreground mb-6">
            {filtered.length} session{filtered.length === 1 ? "" : "s"} available near you
          </p>

          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by sport, trainer, city, or focus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-card border rounded-2xl p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="bg-card border rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">⚽</div>
                <h3 className="text-xl font-bold mb-2">No sessions match your filters</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or clearing filters.</p>
                <Button onClick={resetFilters}>Clear all filters</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
              <Button size="lg" className="w-full mt-6" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} session{filtered.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
