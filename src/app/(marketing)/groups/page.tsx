"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, Sparkles, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/components/marketing/SessionCard";
import type { GroupSession } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface UpcomingPlan {
  id: number; date?: string; dayOfWeek?: string; time?: string;
  sport?: string; city?: string; note?: string; interestCount: number;
  trainerId: string; trainerName: string; trainerPhoto?: string;
}

const sports = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];

function SessionsPageInner() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "";

  const { user } = useUser();
  const [allSessions, setAllSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(
    initialSport ? initialSport.charAt(0).toUpperCase() + initialSport.slice(1) : "All Sports"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [upcomingPlans, setUpcomingPlans] = useState<UpcomingPlan[]>([]);
  const [interestedPlanIds, setInterestedPlanIds] = useState<Set<number>>(new Set());
  const [actingPlan, setActingPlan] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setAllSessions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAllSessions([]); setLoading(false); });
    fetch("/api/plans/upcoming")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUpcomingPlans(data); })
      .catch(() => {});
  }, []);

  async function expressInterest(plan: UpcomingPlan) {
    if (actingPlan === plan.id) return;
    setActingPlan(plan.id);
    const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
    await fetch(`/api/trainers/${plan.trainerId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "interest", planId: plan.id, playerName: name, playerEmail: email }),
    });
    setInterestedPlanIds((s) => new Set([...s, plan.id]));
    setUpcomingPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, interestCount: p.interestCount + 1 } : p));
    setActingPlan(null);
  }

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
      <div className="bg-white border-b px-4">
        <div className="container max-w-7xl">

          {/* Mobile: compact header row */}
          <div className="sm:hidden flex items-center justify-between py-4">
            <h1 className="text-lg font-bold">Find a Session</h1>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border transition-colors"
              style={{ color: "#0F3154", borderColor: "#0F3154" }}>
              <SlidersHorizontal className="h-4 w-4" />
              {hasFilters ? "Filters (on)" : "Filters"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Desktop: always visible; Mobile: collapsible */}
          <div className={`${filtersOpen ? "block" : "hidden"} sm:block pb-6 sm:pt-6`}>
            <h1 className="text-2xl font-bold mb-5 hidden sm:block">Find a Group Session</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Search by city, zip code, or trainer…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); }}
                  className="pl-9 bg-white h-11" />
              </div>
              <select value={selectedSport}
                onChange={(e) => { setSelectedSport(e.target.value); setFiltersOpen(false); }}
                className="px-3 py-2 rounded-lg border border-input text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring h-11">
                {sports.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button
                onClick={() => setFiltersOpen(false)}
                className="px-6 h-11 rounded-xl text-white font-semibold text-sm whitespace-nowrap"
                style={{ backgroundColor: "#0F3154" }}>
                <Search className="h-4 w-4 inline mr-2" />Find Sessions
              </button>
            </div>
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

      {/* Coming Soon section */}
      {upcomingPlans.length > 0 && (
        <div className="border-t bg-white py-10 px-4">
          <div className="container max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="text-lg font-bold">Coming Soon</h2>
                  <p className="text-sm text-muted-foreground">Trainers planning upcoming sessions — express interest to get notified first.</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {upcomingPlans.map((plan) => {
                const interested = interestedPlanIds.has(plan.id);
                const label = plan.dayOfWeek
                  ? `Every ${plan.dayOfWeek}${plan.time ? ` · ${fmt(plan.time)}` : ""}`
                  : plan.date
                    ? new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (plan.time ? ` · ${fmt(plan.time)}` : "")
                    : plan.time ? fmt(plan.time) : "Date TBD";
                return (
                  <div key={plan.id} className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: "#f1f5f9" }}>
                    {/* Trainer row */}
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 bg-[#0F3154]">
                        {plan.trainerPhoto ? (
                          <Image src={plan.trainerPhoto} alt={plan.trainerName} fill className="object-cover" sizes="32px" unoptimized />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                            {plan.trainerName[0]}
                          </span>
                        )}
                      </div>
                      <a href={`/groups/${plan.trainerId}`} className="text-sm font-semibold hover:underline truncate" style={{ color: "#0F3154" }}>
                        {plan.trainerName}
                      </a>
                    </div>
                    {/* Date label */}
                    <div>
                      <p className="font-bold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note || ""}
                      </p>
                      {plan.interestCount > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">{plan.interestCount} interested</p>
                      )}
                    </div>
                    {/* Action */}
                    <button
                      onClick={() => expressInterest(plan)}
                      disabled={interested || actingPlan === plan.id}
                      className="mt-auto w-full py-2 rounded-xl text-sm font-semibold transition-colors"
                      style={interested
                        ? { backgroundColor: "#0F3154", color: "white" }
                        : { backgroundColor: "#DC373E", color: "white" }}>
                      {interested ? <span className="flex items-center justify-center gap-1.5"><Check className="h-3.5 w-3.5" /> Interested</span> : "I'm interested"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading...</div>}>
      <SessionsPageInner />
    </Suspense>
  );
}
