"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/components/marketing/SessionCard";
import type { GroupSession } from "@/lib/types";

const sports = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];

function SessionsPageInner() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "";

  const [allSessions, setAllSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(
    initialSport ? initialSport.charAt(0).toUpperCase() + initialSport.slice(1) : "All Sports"
  );

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setAllSessions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAllSessions([]); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return allSessions.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.title.toLowerCase().includes(q) &&
          !s.trainer.name.toLowerCase().includes(q) &&
          !s.city.toLowerCase().includes(q) &&
          !(s as any).zipCode?.toLowerCase().includes(q) &&
          !s.sport.toLowerCase().includes(q)) return false;
      }
      if (selectedSport !== "All Sports" && s.sport !== selectedSport) return false;
      return true;
    });
  }, [allSessions, search, selectedSport]);

  const hasFilters = selectedSport !== "All Sports" || search !== "";

  function resetFilters() {
    setSelectedSport("All Sports");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Search bar */}
      <div className="bg-white border-b py-6 px-4">
        <div className="container max-w-7xl">
          <h1 className="text-2xl font-bold mb-5">Find a Group Session</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search by city or zip code…"
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

      {/* Results count + clear */}
      <div className="bg-white border-b py-3 px-4">
        <div className="container max-w-7xl flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {loading ? "…" : <><strong>{filtered.length}</strong> session{filtered.length === 1 ? "" : "s"} found</>}
          </span>
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
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
