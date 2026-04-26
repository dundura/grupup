"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ageRanges = ["6–8", "8–10", "10–12", "12–14", "14–16", "16–18", "Adults (18+)", "All ages"];

const sessionTypes = [
  { value: "semi-private", label: "Semi-Private", desc: "2–3 players · $30/player", spots: 3 },
  { value: "small-group",  label: "Small Group",  desc: "4–6 players · $25/player", spots: 6 },
  { value: "clinic",       label: "Clinic",        desc: "7+ players · $20/player", spots: 10 },
  { value: "private",      label: "Private 1-on-1", desc: "1 player · you set the rate", spots: 1 },
];

const defaultPrices: Record<string, number> = {
  "semi-private": 30,
  "small-group":  25,
  "clinic":       20,
  "private":      85,
};

export default function NewSessionPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: "", sport: "", sessionType: "", city: "", venue: "",
    dayOfWeek: "", time: "", duration: "60", ageRange: "", skillLevel: "",
    spotsTotal: "6", pricePerPlayer: "25", notes: "",
  });

  function set(key: string, val: string) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "sessionType") {
        next.pricePerPlayer = String(defaultPrices[val] ?? 25);
        next.spotsTotal = String(sessionTypes.find((t) => t.value === val)?.spots ?? 6);
      }
      return next;
    });
  }

  const isValid = form.title.trim() && form.sport && form.sessionType && form.city && form.dayOfWeek && form.time;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !isSignedIn) return;
    setSaving(true);
    try {
      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setDone(true); }
      else { const d = await res.json(); alert(d.error ?? "Something went wrong"); }
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border shadow-sm p-10">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2">Session created!</h1>
          <p className="text-muted-foreground mb-8">Players will start finding your session on the browse page.</p>
          <div className="space-y-3">
            <Button className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={() => router.push("/dashboard")}>View my dashboard</Button>
            <Button variant="outline" className="w-full" onClick={() => { setDone(false); setForm({ title: "", sport: "", sessionType: "", city: "", venue: "", dayOfWeek: "", time: "", duration: "60", ageRange: "", skillLevel: "", spotsTotal: "6", pricePerPlayer: "25", notes: "" }); }}>Create another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a training session</h1>
          <p className="text-muted-foreground text-lg">Set up your session — players will find it and book directly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Session Title</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Tuesday Finishing Clinic – Cary" className="text-base" />
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Session Type</label>
            <div className="space-y-3">
              {sessionTypes.map((t) => (
                <button key={t.value} type="button" onClick={() => set("sessionType", t.value)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all"
                  style={form.sessionType === t.value ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}>
                  <div>
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sport</label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button key={s} type="button" onClick={() => set("sport", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.sport === s ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Skill Level</label>
              <div className="grid grid-cols-4 gap-2">
                {levels.map((l) => (
                  <button key={l} type="button" onClick={() => set("skillLevel", l)}
                    className="py-2 rounded-lg text-sm font-medium border transition-colors"
                    style={form.skillLevel === l ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Age Range</label>
              <div className="flex flex-wrap gap-2">
                {ageRanges.map((a) => (
                  <button key={a} type="button" onClick={() => set("ageRange", a)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.ageRange === a ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Schedule & Location</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Day of week</label>
                <select value={form.dayOfWeek} onChange={(e) => set("dayOfWeek", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select day</option>
                  {days.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Start time</label>
                <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">City</label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Cary, London, Lagos" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration (min)</label>
                <Input type="number" min="30" max="180" step="15" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Venue / field name</label>
              <Input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. WakeMed Soccer Park Field 3" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Spots & Pricing</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Total spots</label>
                <Input type="number" min="1" max="30" value={form.spotsTotal} onChange={(e) => set("spotsTotal", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price per player ($)</label>
                <Input type="number" min="5" step="5" value={form.pricePerPlayer} onChange={(e) => set("pricePerPlayer", e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You keep 85% · Grupup fee 15% · You earn <strong>${Math.round(parseInt(form.pricePerPlayer || "0") * 0.85)}/player</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Notes for players (optional)</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              placeholder="What to bring, parking info, what to expect..."
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <Button type="submit" size="lg" className="w-full text-base" disabled={!isValid || saving}
            style={{ backgroundColor: "#DC373E" }}>
            {saving ? "Creating session…" : "Publish session"}
          </Button>
        </form>
      </div>
    </div>
  );
}
