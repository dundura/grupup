"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const SPORTS = ["All Sports", "Soccer", "Basketball"];
const AGE_GROUPS = ["All Ages", "Kids (8–12)", "Teens (13–17)", "Adults (18+)"];

interface FreePlayRow {
  id: number;
  sport: string;
  sportEmoji: string;
  title: string;
  level: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  duration: number;
  playersConfirmed: number;
  playersNeeded: number;
  ageRange: string;
  description: string;
  organizerName: string;
}

function matchesAge(ageRange: string | null, group: string) {
  if (group === "All Ages" || !ageRange) return true;
  const r = ageRange.toLowerCase();
  if (group === "Kids (8–12)")   return r.includes("8") || r.includes("10") || r.includes("12") || r.includes("all");
  if (group === "Teens (13–17)") return r.includes("13") || r.includes("15") || r.includes("17") || r.includes("all");
  if (group === "Adults (18+)")  return r.includes("18") || r.includes("adult") || r.includes("all");
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
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: hot ? "#DC373E" : "#0F3154" }} />
      </div>
    </div>
  );
}

function EventCard({ event, onJoin }: { event: FreePlayRow; onJoin: () => void }) {
  const spotsLeft = event.playersNeeded - event.playersConfirmed;
  const isFull = spotsLeft <= 0;
  return (
    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
      <div className="h-1.5" style={{ backgroundColor: "#0F3154" }} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl">{event.sportEmoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{event.sport}</span>
            </div>
            <h3 className="font-bold text-base leading-snug">{event.title}</h3>
          </div>
          {event.level && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex-shrink-0">
              {event.level}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{formatDate(event.date)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{event.time} · {event.duration}min</span>
          <span className="flex items-center gap-1.5 col-span-2"><MapPin className="h-3 w-3" />{event.venue}, {event.city}</span>
        </div>
        {event.description && <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>}
        <div className="mt-auto pt-2 space-y-3">
          <SpotsBar confirmed={event.playersConfirmed} needed={event.playersNeeded} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Organized by {event.organizerName}</span>
            <Button size="sm" disabled={isFull} onClick={onJoin}
              style={!isFull ? { backgroundColor: "#DC373E" } : undefined}>
              <Users className="h-3.5 w-3.5 mr-1.5" />
              {isFull ? "Full" : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FreePlayPage() {
  const { isSignedIn } = useAuth();
  const [events, setEvents] = useState<FreePlayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("All Sports");
  const [ageGroup, setAgeGroup] = useState("All Ages");
  const [city, setCity] = useState("All Cities");

  useEffect(() => {
    fetch("/api/free-play")
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allCities = useMemo(() => ["All Cities", ...Array.from(new Set(events.map((e) => e.city).filter(Boolean))).sort()], [events]);

  const filtered = useMemo(() =>
    events.filter((e) => {
      if (sport !== "All Sports" && e.sport !== sport) return false;
      if (city !== "All Cities" && e.city !== city) return false;
      if (!matchesAge(e.ageRange, ageGroup)) return false;
      return true;
    }),
    [events, sport, city, ageGroup]
  );

  function handleJoin(eventId: number) {
    if (!isSignedIn) { window.location.href = "/sign-in"; return; }
    setEvents((prev) =>
      prev.map((e) => e.id === eventId && e.playersConfirmed < e.playersNeeded
        ? { ...e, playersConfirmed: e.playersConfirmed + 1 }
        : e
      )
    );
  }

  return (
    <div>
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Find Free Play</h1>
              <p className="text-muted-foreground">
                {loading ? "Loading events…" : `${filtered.length} pickup game${filtered.length === 1 ? "" : "s"} happening near you`}
              </p>
            </div>
            <Button style={{ backgroundColor: "#DC373E" }} asChild>
              <Link href="/free-play/create"><Plus className="h-4 w-4 mr-1.5" /> Host a game</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {SPORTS.map((s) => (
              <button key={s} onClick={() => setSport(s)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={sport === s ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0" }}>
                {s}
              </button>
            ))}
            <div className="w-px bg-border mx-1" />
            {AGE_GROUPS.map((a) => (
              <button key={a} onClick={() => setAgeGroup(a)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={ageGroup === a ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0" }}>
                {a}
              </button>
            ))}
            <div className="w-px bg-border mx-1" />
            {allCities.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={city === c ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2">No pickup games right now</h3>
            <p className="text-muted-foreground mb-6">Be the first — host a game and get players to show up.</p>
            <Button style={{ backgroundColor: "#DC373E" }} asChild>
              <Link href="/free-play/create">Host a game</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((e) => <EventCard key={e.id} event={e} onJoin={() => handleJoin(e.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
