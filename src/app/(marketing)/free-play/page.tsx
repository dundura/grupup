"use client";

import { useState, useMemo } from "react";
import { Calendar, MapPin, Clock, Users, Plus, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// ── Create Event Modal ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  sport: "Soccer",
  venue: "",
  city: "",
  date: "",
  time: "",
  duration: "90",
  playersNeeded: "10",
  ageRange: "",
  level: "Intermediate",
  description: "",
};

function CreateEventModal({ onClose, onSave }: { onClose: () => void; onSave: (e: FreePlayEvent) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.venue || !form.city || !form.date || !form.time) {
      setError("Please fill in all required fields.");
      return;
    }
    const event: FreePlayEvent = {
      id: `fp-user-${Date.now()}`,
      sport: form.sport,
      sportEmoji: form.sport === "Basketball" ? "🏀" : "⚽",
      title: form.title,
      level: form.level,
      competitiveTier: "Recreational",
      venue: form.venue,
      city: form.city,
      state: "NC",
      date: form.date,
      time: form.time,
      duration: parseInt(form.duration) || 90,
      playersConfirmed: 1,
      playersNeeded: parseInt(form.playersNeeded) || 10,
      ageRange: form.ageRange || "All ages",
      description: form.description,
      organizer: "You",
    };
    onSave(event);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Create a Free Play Event</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="text-sm font-medium block mb-1">Event title *</label>
            <Input placeholder="e.g. Saturday Pickup at Pullen Park" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Sport *</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                value={form.sport}
                onChange={(e) => set("sport", e.target.value)}
              >
                <option>Soccer</option>
                <option>Basketball</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Level</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Venue / Location *</label>
            <Input placeholder="e.g. Pullen Park Soccer Field" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">City *</label>
              <Input placeholder="Raleigh" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Age range</label>
              <Input placeholder="e.g. 12–18" value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Date *</label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Time *</label>
              <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Duration (min)</label>
              <Input type="number" min={30} max={300} step={15} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Players needed</label>
              <Input type="number" min={2} max={50} value={form.playersNeeded} onChange={(e) => set("playersNeeded", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none"
              rows={3}
              placeholder="Tell players what to expect…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 text-white" style={{ backgroundColor: "#DC373E" }}>
              Post Event
            </Button>
          </div>
        </form>
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
  const [showCreate, setShowCreate] = useState(false);
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

  function handleSave(event: FreePlayEvent) {
    setEvents((prev) => [event, ...prev]);
    setShowCreate(false);
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
            <Button
              size="lg"
              className="gap-2 text-white flex-shrink-0"
              style={{ backgroundColor: "#DC373E" }}
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              Post Event
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
            <Button style={{ backgroundColor: "#DC373E", color: "#fff" }} onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Post Event
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

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onSave={handleSave} />
      )}
    </div>
  );
}
