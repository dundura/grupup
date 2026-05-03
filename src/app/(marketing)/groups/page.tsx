"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, Sparkles, MapPin, Check, Star } from "lucide-react";
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
  const isAdmin = user?.emailAddresses?.some((e) => e.emailAddress === "neil@anytime-soccer.com") ?? false;
  const [allSessions, setAllSessions] = useState<GroupSession[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(
    initialSport ? initialSport.charAt(0).toUpperCase() + initialSport.slice(1) : "All Sports"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [upcomingPlans, setUpcomingPlans] = useState<UpcomingPlan[]>([]);
  const [interestedPlanIds, setInterestedPlanIds] = useState<Set<number>>(new Set());
  const [actingPlan, setActingPlan] = useState<number | null>(null);
  const [view, setView] = useState<"sessions" | "gauge">("sessions");

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

  async function toggleFeatured(e: React.MouseEvent, session: GroupSession) {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId === session.id) return;
    setTogglingId(session.id);
    const newVal = !session.isFeatured;
    try {
      await fetch("/api/admin/feature-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, featured: newVal }),
      });
      setAllSessions((prev) =>
        prev.map((s) => s.id === session.id ? { ...s, isFeatured: newVal } : s)
      );
    } finally {
      setTogglingId(null);
    }
  }

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

      {/* Results count + view toggle */}
      <div className="bg-white border-b py-3 px-4">
        <div className="container max-w-7xl flex items-center gap-3">
          {/* View dropdown */}
          <div className="flex rounded-lg border overflow-hidden text-sm font-semibold shrink-0">
            <button
              onClick={() => setView("sessions")}
              className="px-4 py-1.5 transition-colors"
              style={view === "sessions" ? { backgroundColor: "#0F3154", color: "white" } : { color: "#6b7280" }}>
              Active Sessions
            </button>
            <button
              onClick={() => setView("gauge")}
              className="px-4 py-1.5 transition-colors border-l flex items-center gap-1.5"
              style={view === "gauge" ? { backgroundColor: "#DC373E", color: "white" } : { color: "#6b7280" }}>
              Gauge Interest
              {upcomingPlans.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={view === "gauge" ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: "#fee2e2", color: "#DC373E" }}>
                  {upcomingPlans.length}
                </span>
              )}
            </button>
          </div>

          <span className="text-sm text-muted-foreground">
            {loading ? "…" : view === "sessions"
              ? <><strong>{filtered.length}</strong> session{filtered.length === 1 ? "" : "s"} found</>
              : <><strong>{upcomingPlans.length}</strong> plan{upcomingPlans.length === 1 ? "" : "s"}</>}
          </span>
          {hasFilters && view === "sessions" && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Session grid */}
      {view === "sessions" && (
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
              {filtered.map((session) => (
                <div key={session.id} className="relative">
                  <SessionCard session={session} />
                  {isAdmin && (
                    <button
                      onClick={(e) => toggleFeatured(e, session)}
                      disabled={togglingId === session.id}
                      title={session.isFeatured ? "Remove from homepage featured" : "Feature on homepage"}
                      className="absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full shadow-lg border transition-colors"
                      style={{
                        backgroundColor: session.isFeatured ? "#DC373E" : "white",
                        borderColor: session.isFeatured ? "#DC373E" : "#e2e8f0",
                      }}
                    >
                      <Star
                        className="h-4 w-4"
                        style={{ color: session.isFeatured ? "white" : "#94a3b8" }}
                        fill={session.isFeatured ? "white" : "none"}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gauge Interest section */}
      {view === "gauge" && (
        <div className="container max-w-7xl py-8 px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900">These are potential sessions — not yet confirmed.</p>
              <p className="text-sm text-amber-800 mt-0.5">
                Your trainer is considering offering these dates and would like to know if there's enough interest before committing. Tap <strong>I'm interested</strong> to let them know — the more interest, the more likely they'll launch it.
              </p>
            </div>
          </div>
          {upcomingPlans.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-amber-400" />
              <p className="font-semibold text-base mb-1">No plans posted yet</p>
              <p className="text-sm text-muted-foreground">Check back soon — trainers will post potential sessions here.</p>
            </div>
          ) : null}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {upcomingPlans.map((plan) => {
                const interested = interestedPlanIds.has(plan.id);
                const label = plan.dayOfWeek
                  ? `Every ${plan.dayOfWeek}${plan.time ? ` · ${fmt(plan.time)}` : ""}`
                  : plan.date
                    ? new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (plan.time ? ` · ${fmt(plan.time)}` : "")
                    : plan.time ? fmt(plan.time) : "Date TBD";
                return (
                  <div key={plan.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    {/* Trainer photo */}
                    <a href={`/groups/${plan.trainerId}`} className="block relative w-full aspect-[4/3] overflow-hidden bg-[#0F3154]">
                      {plan.trainerPhoto ? (
                        <Image src={plan.trainerPhoto} alt={plan.trainerName} fill className="object-cover object-top" sizes="400px" unoptimized />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-white/30">
                          {plan.trainerName[0]}
                        </span>
                      )}
                      {/* Gauge interest badge */}
                      <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>
                        ✦ Gauge Interest
                      </span>
                    </a>

                    {/* Content */}
                    <div className="px-4 pt-4 pb-4 flex flex-col flex-1 gap-2">
                      <a href={`/groups/${plan.trainerId}`} className="text-xs font-semibold text-muted-foreground hover:underline truncate">
                        {plan.trainerName}
                      </a>
                      <p className="font-bold text-base leading-tight line-clamp-1">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note || ""}
                      </p>
                      {plan.interestCount > 0 && (
                        <p className="text-[11px] text-muted-foreground">{plan.interestCount} interested</p>
                      )}

                      <a
                        href={`/groups/${plan.trainerId}`}
                        className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-colors text-center block"
                        style={{ backgroundColor: "#DC373E", color: "white" }}>
                        View upcoming events
                      </a>
                    </div>
                  </div>
                );
              })}
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
