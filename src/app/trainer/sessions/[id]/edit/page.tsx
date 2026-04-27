"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ageRanges = ["6–8", "8–10", "10–12", "12–14", "14–16", "16–18", "Adults (18+)", "All ages"];
const sessionTypes = [
  { value: "semi-private", label: "Semi-Private", desc: "2–3 players" },
  { value: "small-group",  label: "Small Group",  desc: "4–6 players" },
  { value: "clinic",       label: "Clinic",        desc: "7+ players" },
];

function baseHourlyRate(spots: number): number {
  if (spots <= 3) return 30;
  if (spots <= 6) return 25;
  return 20;
}
function calcPrice(spots: number, durationMin: number): number {
  return Math.max(5, Math.round(baseHourlyRate(spots) * durationMin / 60));
}

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", sport: "", sessionType: "", city: "", zipCode: "", venue: "",
    dayOfWeek: "", time: "", duration: "60", ageRange: "", skillLevel: "",
    spotsTotal: "6", pricePerPlayer: "25", notes: "", instructions: "",
    videoUrl: "", firstClassFree: false,
  });

  useEffect(() => {
    fetch(`/api/trainer/sessions/${id}`)
      .then((r) => r.json())
      .then((s) => {
        if (s.error) { setError(s.error); setLoading(false); return; }
        setForm({
          title: s.title ?? "",
          sport: s.sport ?? "",
          sessionType: s.sessionType ?? "",
          city: s.city ?? "",
          zipCode: s.zipCode ?? "",
          venue: s.venue ?? "",
          dayOfWeek: s.dayOfWeek ?? "",
          time: s.time ?? "",
          duration: String(s.duration ?? 60),
          ageRange: s.ageRange ?? "",
          skillLevel: s.skillLevel ?? "",
          spotsTotal: String(s.spotsTotal ?? 6),
          pricePerPlayer: String(s.pricePerPlayer ?? 25),
          notes: s.notes ?? "",
          instructions: (s as any).instructions ?? "",
          videoUrl: (s as any).videoUrl ?? "",
          firstClassFree: (s as any).firstClassFree ?? false,
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load session"); setLoading(false); });
  }, [id]);

  function set(key: string, val: string) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "spotsTotal") {
        next.pricePerPlayer = String(calcPrice(parseInt(val) || 1, parseInt(f.duration) || 60));
      }
      if (key === "duration") {
        next.pricePerPlayer = String(calcPrice(parseInt(f.spotsTotal) || 1, parseInt(val) || 60));
      }
      return next;
    });
  }

  const missing = [
    !form.title.trim()  && "Session title",
    !form.sessionType   && "Session type",
    !form.sport         && "Sport",
    !form.city.trim()   && "City",
    !form.dayOfWeek     && "Day of week",
    !form.time          && "Start time",
  ].filter(Boolean) as string[];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (missing.length > 0 || !isSignedIn) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/trainer/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { router.push("/dashboard"); }
      else { const d = await res.json(); setError(d.error ?? "Something went wrong"); }
    } finally { setSaving(false); }
  }

  if (loading) return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (error) return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Edit Session</h1>
          <p className="text-muted-foreground">Update your session details below.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Session Title</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Tuesday Finishing Clinic – Cary" className="text-base" />
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Session Type</label>
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
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Spots & Price</label>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Total spots available <span className="text-foreground font-bold">{form.spotsTotal}</span>
              </label>
              <input type="range" min="1" max="20" value={form.spotsTotal}
                onChange={(e) => set("spotsTotal", e.target.value)}
                className="w-full accent-[#0F3154]" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span><span>20</span>
              </div>
            </div>
            {(() => {
              const spots = parseInt(form.spotsTotal) || 1;
              const duration = parseInt(form.duration) || 60;
              const perSession = parseInt(form.pricePerPlayer) || 0;
              const hourlyRate = baseHourlyRate(spots);
              const trainerEarns = Math.round(perSession * 0.85);
              const totalIfFull = trainerEarns * spots;
              return (
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f0f4f9" }}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Base rate: ${hourlyRate}/player/hr × {duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players pay</span>
                    <span className="font-semibold">${perSession}/player</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You earn (85%)</span>
                    <span className="font-bold" style={{ color: "#0F3154" }}>${trainerEarns}/player</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">If session fills ({spots} spots)</span>
                    <span className="font-bold" style={{ color: "#0F3154" }}>${totalIfFull} total</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 block">About this session <span style={{ color: "#DC373E" }}>*</span></label>
              <p className="text-xs text-muted-foreground mb-2">Describe what players will work on.</p>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                placeholder="e.g. This session focuses on ball mastery and finishing in small groups..."
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Instructions <span style={{ color: "#DC373E" }}>*</span></label>
              <p className="text-xs text-muted-foreground mb-2">What should players bring, wear, or know before arriving?</p>
              <textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} rows={3}
                placeholder="e.g. Arrive 10 minutes before the session. Bring water and wear appropriate gear..."
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Session Video <span className="font-normal normal-case text-xs">(optional)</span></label>
            <p className="text-xs text-muted-foreground">Paste a YouTube or Vimeo link to show a preview video on your session page.</p>
            <Input value={(form as any).videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="text-sm" />
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(form as any).firstClassFree}
                onChange={(e) => setForm((f) => ({ ...f, firstClassFree: e.target.checked }))}
                className="mt-0.5 h-4 w-4 accent-[#0F3154]"
              />
              <div>
                <p className="font-semibold text-sm">Offer first class free</p>
                <p className="text-xs text-muted-foreground mt-0.5">Players will see a "First class free" callout and can message you to claim it.</p>
              </div>
            </label>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard")}>Cancel</Button>
            <Button type="submit" size="lg" className="flex-1" disabled={missing.length > 0 || saving}
              style={{ backgroundColor: "#DC373E" }}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
          {missing.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">Still needed: {missing.join(", ")}</p>
          )}
        </form>
      </div>
    </div>
  );
}
