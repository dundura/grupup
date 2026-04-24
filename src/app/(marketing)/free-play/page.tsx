"use client";

import { useState, useMemo } from "react";
import { Calendar, MapPin, Clock, Users, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { freePlayEvents } from "@/lib/mock-data";
import { FreePlayEvent } from "@/lib/types";

const SPORTS = ["All Sports", "Soccer", "Basketball"];
const AGE_GROUPS = ["All Ages", "Kids (8–12)", "Teens (13–17)", "Adults (18+)"];
const ALL_CITIES = ["All Cities", ...Array.from(new Set(freePlayEvents.map((e) => e.city))).sort()];

function matchesAge(ageRange: string, group: string) {
  if (group === "All Ages") return true;
  const r = ageRange.toLowerCase();
  if (group === "Kids (8–12)")    return r.includes("8") || r.includes("9") || r.includes("10") || r.includes("11") || r.includes("12") || r.includes("all");
  if (group === "Teens (13–17)")  return r.includes("13") || r.includes("14") || r.includes("15") || r.includes("16") || r.includes("17") || r.includes("all");
  if (group === "Adults (18+)")   return r.includes("18") || r.includes("20") || r.includes("25") || r.includes("30") || r.includes("adult") || r.includes("all");
  return true;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function SpotsBar({ confirmed, needed }: { confirmed: number; needed: number }) {
  const pct = Math.min((confirmed / needed) * 100, 100);
  const spotsLeft = needed - confirmed;
  const hot = spotsLeft <= 2;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{confirmed}/{needed} confirmed</span>
        <span className={hot ? "font-semibold" : "text-muted-foreground"} style={hot ? { color: "#DC373E" } : {}}>
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "Full"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: hot ? "#DC373E" : "#0F3154" }}
        />
      </div>
    </div>
  );
}

interface EventCardProps {
  event: FreePlayEvent;
  onJoin: () => void;
}

function EventCard({ event, onJoin }: EventCardProps) {
  const spotsLeft = event.playersNeeded - event.playersConfirmed;
  const isFull = spotsLeft <= 0;
  return (
    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
      <div className="h-1.5" style={{ backgroundColor: "#0F3154" }} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl">{event.sportEmoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{event.sport}</span>
            </div>
            <h3 className="font-bold text-base leading-snug">{event.title}</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex-shrink-0">
            {event.level}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {event.time} · {event.duration} min
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {event.venue}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Ages {event.ageRange}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Spots bar */}
        <SpotsBar confirmed={event.playersConfirmed} needed={event.playersNeeded} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t mt-auto">
          <span className="text-xs text-muted-foreground">Org: {event.organizer}</span>
          <Button
            size="sm"
            disabled={isFull}
            className="text-xs gap-1"
            style={!isFull ? { backgroundColor: "#DC373E", color: "#fff" } : {}}
            onClick={onJoin}
          >
            {isFull ? "Full" : <>Join <ChevronRight className="h-3 w-3" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function FreePlayPage() {
  const [sport, setSport] = useState("All Sports");
  const [ageGroup, setAgeGroup] = useState("All Ages");
  const [city, setCity] = useState("All Cities");
  const [events, setEvents] = useState<FreePlayEvent[]>(freePlayEvents);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (sport !== "All Sports" && e.sport !== sport) return false;
      if (!matchesAge(e.ageRange, ageGroup)) return false;
      if (city !== "All Cities" && e.city !== city) return false;
      return true;
    });
  }, [events, sport, ageGroup, city]);

  function handleJoin(id: string) {
    setJoined((prev) => new Set([...prev, id]));
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, playersConfirmed: Math.min(e.playersConfirmed + 1, e.playersNeeded) } : e
      )
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-12 md:py-16 border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">⚡</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Free Play</h1>
              </div>
              <p className="text-white/70 text-lg max-w-xl">
                Join pickup games and open runs near you — or post your own to get players together.
              </p>
            </div>
            <Button size="lg" className="gap-2 text-white flex-shrink-0" style={{ backgroundColor: "#DC373E" }} asChild>
              <Link href="/free-play/create">
                <Plus className="h-4 w-4" />
                Post Event
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Sport */}
          <div className="flex rounded-xl border overflow-hidden">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={sport === s ? { backgroundColor: "#0F3154", color: "#fff" } : { color: "#6B7280" }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Age */}
          <div className="flex rounded-xl border overflow-hidden">
            {AGE_GROUPS.map((a) => (
              <button
                key={a}
                onClick={() => setAgeGroup(a)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={ageGroup === a ? { backgroundColor: "#0F3154", color: "#fff" } : { color: "#6B7280" }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* City dropdown */}
          <select
            className="border rounded-xl px-4 py-2 text-sm bg-background font-medium"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {ALL_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} near you
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">⚽</span>
            <p className="text-lg font-semibold mb-1">No events found</p>
            <p className="text-sm text-muted-foreground mb-6">Be the first — post a free play event in your area.</p>
            <Button style={{ backgroundColor: "#DC373E", color: "#fff" }} asChild>
              <Link href="/free-play/create"><Plus className="h-4 w-4 mr-2" /> Post Event</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={() => handleJoin(event.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
