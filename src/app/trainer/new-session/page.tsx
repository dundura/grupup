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
    title: "", sport: "", sessionType: "", city: "", zipCode: "", venue: "",
    dayOfWeek: "", time: "", duration: "60", ageRange: "", skillLevel: "",
    spotsTotal: "6", pricePerPlayer: "25", notes: "", recurring: false,
    isPlan: false, planWeeks: "4",
    planSessions: [] as { date: string; time: string }[],
  });

  function buildPlanSessions(weeks: number, startDate?: string, startTime?: string): { date: string; time: string }[] {
    const base = startDate ? new Date(startDate) : new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i * 7);
      return {
        date: d.toISOString().split("T")[0],
        time: startTime ?? "",
      };
    });
  }

  function baseHourlyRate(spots: number): number {
    if (spots === 1) return 85;
    if (spots <= 3) return 30;
    if (spots <= 6) return 25;
    return 20;
  }

  function planDiscount(weeks: number): number {
    if (weeks >= 8) return 20;
    if (weeks >= 6) return 15;
    if (weeks >= 4) return 10;
    return 5;
  }

  function calcPrice(spots: number, durationMin: number): number {
    return Math.max(5, Math.round(baseHourlyRate(spots) * durationMin / 60));
  }

  function set(key: string, val: string) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "sessionType") {
        next.pricePerPlayer = String(defaultPrices[val] ?? 25);
        next.spotsTotal = String(sessionTypes.find((t) => t.value === val)?.spots ?? 6);
      }
      if (key === "spotsTotal") {
        const spots = parseInt(val) || 1;
        const duration = parseInt(f.duration) || 60;
        next.pricePerPlayer = String(calcPrice(spots, duration));
      }
      if (key === "duration") {
        const spots = parseInt(f.spotsTotal) || 1;
        const duration = parseInt(val) || 60;
        next.pricePerPlayer = String(calcPrice(spots, duration));
      }
      return next;
    });
  }

  const missing = [
    !form.title.trim()   && "Session title",
    !form.sessionType    && "Session type",
    !form.sport          && "Sport",
    !form.city.trim()    && "City",
    !form.dayOfWeek      && "Day of week",
    !form.time           && "Start time",
  ].filter(Boolean) as string[];

  const isValid = missing.length === 0;

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
            <Button variant="outline" className="w-full" onClick={() => { setDone(false); setForm({ title: "", sport: "", sessionType: "", city: "", zipCode: "", venue: "", dayOfWeek: "", time: "", duration: "60", ageRange: "", skillLevel: "", spotsTotal: "6", pricePerPlayer: "25", notes: "", recurring: false, isPlan: false, planWeeks: "4", planSessions: [] }); }}>Create another</Button>
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

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Session Type</label>
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

            {/* Recurring toggle — shown under session type, hidden when plan */}
            {form.sessionType && !form.isPlan && (
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, recurring: !f.recurring }))}
                  className="flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all"
                  style={form.recurring ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm">Recurring session</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {form.recurring && form.dayOfWeek
                        ? `Repeats every ${form.dayOfWeek} at ${form.time || "the same time"}`
                        : "Runs every week on the selected day"}
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.recurring ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.recurring ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>
            )}

            {/* Training Plan toggle */}
            {form.sessionType && (
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    isPlan: !f.isPlan,
                    recurring: false,
                    planSessions: !f.isPlan
                      ? buildPlanSessions(parseInt(f.planWeeks) || 4, undefined, f.time)
                      : f.planSessions,
                  }))}
                  className="flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all"
                  style={form.isPlan
                    ? { borderColor: "#DC373E", backgroundColor: "#fff5f5" }
                    : { borderColor: "#e2e8f0" }}
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm">Make this a Training Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Player pays upfront for multiple weeks · discount applied automatically
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${form.isPlan ? "bg-[#DC373E]" : "bg-gray-200"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPlan ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>

                {form.isPlan && (
                  <div className="mt-3 space-y-3">
                    <label className="text-sm font-medium block">Number of sessions</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5, 6, 7, 8].map((w) => {
                        const disc = planDiscount(w);
                        return (
                          <button key={w} type="button"
                            onClick={() => setForm((f) => ({
                              ...f,
                              planWeeks: String(w),
                              planSessions: buildPlanSessions(w, f.planSessions[0]?.date, f.planSessions[0]?.time || f.time),
                            }))}
                            className="flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all"
                            style={form.planWeeks === String(w)
                              ? { borderColor: "#DC373E", backgroundColor: "#fff5f5" }
                              : { borderColor: "#e2e8f0" }}>
                            <span className="font-bold text-sm">{w}</span>
                            <span className="text-xs font-semibold" style={{ color: "#DC373E" }}>{disc}% off</span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Schedule & Location (moved above Sport) ── */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Schedule & Location</label>

            {form.isPlan ? (
              /* Plan mode: bulk time + per-session date pickers */
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Dates default to weekly — change any session freely.
                </p>

                {/* Apply one time to all sessions */}
                <div className="flex items-end gap-3 rounded-xl border border-dashed p-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Set time for all sessions</label>
                    <Input type="time" value={form.time}
                      onChange={(e) => set("time", e.target.value)} />
                  </div>
                  <button type="button"
                    className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-[#0F3154] hover:text-white"
                    style={{ borderColor: "#0F3154", color: "#0F3154" }}
                    onClick={() => setForm((f) => ({
                      ...f,
                      planSessions: f.planSessions.map((s) => ({ ...s, time: f.time })),
                    }))}>
                    Apply to all
                  </button>
                </div>

                {Array.from({ length: parseInt(form.planWeeks) || 4 }, (_, i) => {
                  const s = form.planSessions[i] ?? { date: "", time: form.time };
                  return (
                    <div key={i} className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Session {i + 1}</label>
                        <Input type="date" value={s.date}
                          onChange={(e) => setForm((f) => {
                            const sessions = [...f.planSessions];
                            sessions[i] = { ...sessions[i], date: e.target.value };
                            return { ...f, planSessions: sessions };
                          })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Time</label>
                        <Input type="time" value={s.time}
                          onChange={(e) => setForm((f) => {
                            const sessions = [...f.planSessions];
                            sessions[i] = { ...sessions[i], time: e.target.value };
                            return { ...f, planSessions: sessions };
                          })} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Standard mode: day of week + time */
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
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">City</label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Cary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Zip / Postal Code</label>
                <Input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="e.g. 27513" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Duration</label>
              <select value={form.duration} onChange={(e) => set("duration", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="60">1 hr</option>
                <option value="90">1 hr 30 min</option>
                <option value="120">2 hr</option>
                <option value="150">2 hr 30 min</option>
                <option value="180">3 hr</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Venue / field name</label>
              <Input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. WakeMed Soccer Park Field 3" />
            </div>
          </div>

          {/* ── Sport / Skill / Age ── */}
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sport</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {sports.map((s) => (
                  <button key={s} type="button" onClick={() => set("sport", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.sport === s ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
                {form.sport && !sports.includes(form.sport) && (
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0F3154" }}>
                    {form.sport}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Don't see yours? Type it here…"
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) { set("sport", val); (e.target as HTMLInputElement).value = ""; }
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val) { set("sport", val); e.target.value = ""; }
                  }}
                />
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
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Spots</label>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Total spots available <span className="text-foreground font-bold">{form.spotsTotal}</span>
              </label>
              <input type="range" min="1" max="20" value={form.spotsTotal}
                onChange={(e) => set("spotsTotal", e.target.value)}
                className="w-full accent-[#0F3154]" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 (private)</span>
                <span>20 (clinic)</span>
              </div>
            </div>

            {(() => {
              const spots = parseInt(form.spotsTotal) || 1;
              const duration = parseInt(form.duration) || 60;
              const price = parseInt(form.pricePerPlayer) || 0;
              const hourlyRate = baseHourlyRate(spots);
              const trainerEarns = Math.round(price * 0.85);
              const totalIfFull = trainerEarns * spots;
              return (
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f0f4f9" }}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Base rate: ${hourlyRate}/player/hr × {duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players pay</span>
                    <span className="font-semibold">${price}/player</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You earn (85%)</span>
                    <span className="font-bold" style={{ color: "#0F3154" }}>${trainerEarns}/player</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">If session fills ({spots} spots)</span>
                    <span className="font-bold" style={{ color: "#0F3154" }}>${totalIfFull} total</span>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-1 border border-amber-200">
                    ⚠️ You must honor this price and run the session even if not all spots fill.
                  </p>
                </div>
              );
            })()}
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
          {missing.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Still needed: {missing.join(", ")}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
