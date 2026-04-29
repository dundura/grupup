"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useAuth } from "@clerk/nextjs";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Question = { id: string; type: "text" | "choice"; label: string; required: boolean; options: string[] };
type Questionnaire = { title: string; questions: Question[] } | null;

function newQuestion(): Question {
  return { id: Math.random().toString(36).slice(2), type: "text", label: "", required: false, options: [""] };
}

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility", "Multi-sport"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ageRanges = ["6–8", "8–10", "10–12", "12–14", "14–16", "16–18", "Adults (18+)", "All ages"];
const sessionTypes = [
  { value: "semi-private", label: "Semi-Private", desc: "2–3 players" },
  { value: "small-group",  label: "Small Group",  desc: "4–6 players" },
  { value: "clinic",       label: "Clinic",        desc: "7+ players" },
];

function baseHourlyRate(spots: number): number {
  if (spots <= 3) return 35;
  if (spots <= 6) return 30;
  return 22;
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
  const [saved, setSaved] = useState(false);
  const [priceLocked] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(null);
  const [form, setForm] = useState({
    title: "", sport: "", sessionType: "", city: "", zipCode: "", venue: "",
    dayOfWeek: "", time: "", duration: "60", ageRanges: [] as string[], skillLevels: [] as string[],
    spotsTotal: "6", pricePerPlayer: "30", notes: "", instructions: "",
    sessionPhoto: "", videoUrl: "", firstClassFree: false,
    recurring: false, recurringWeeks: "",
    isPlan: false, planWeeks: "4",
    planSessions: [] as { date: string; time: string }[],
    discountPct: 0, discountLabel: "",
    startDate: "",
    recurringDates: [] as { date: string; time: string }[],
    allowLateBooking: true,
    waitlistEnabled: false,
  });

  function generateRecurringDates(start: string, weeks: number, defaultTime = ""): { date: string; time: string }[] {
    if (!start || weeks <= 0) return [];
    const base = new Date(start + "T12:00:00");
    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i * 7);
      return { date: d.toISOString().split("T")[0], time: defaultTime };
    });
  }

  function addNextRecurringDate(existing: { date: string; time: string }[], defaultTime: string): { date: string; time: string }[] {
    const last = existing[existing.length - 1];
    const base = last ? new Date(last.date + "T12:00:00") : new Date();
    base.setDate(base.getDate() + 7);
    return [...existing, { date: base.toISOString().split("T")[0], time: last?.time || defaultTime || "" }];
  }

  function buildPlanSessions(count: number, startTime?: string): { date: string; time: string }[] {
    const base = new Date();
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i * 7);
      return { date: d.toISOString().split("T")[0], time: startTime ?? "" };
    });
  }

  function planDiscount(sessions: number): number {
    if (sessions >= 8) return 20;
    if (sessions >= 6) return 15;
    if (sessions >= 4) return 10;
    return 5;
  }

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
          ageRanges: s.ageRange ? s.ageRange.split(",").map((x: string) => x.trim()).filter(Boolean) : [],
          skillLevels: s.skillLevel ? s.skillLevel.split(",").map((x: string) => x.trim()).filter(Boolean) : [],
          spotsTotal: String(s.spotsTotal ?? 6),
          pricePerPlayer: String(calcPrice(s.spotsTotal ?? 6, s.duration ?? 60)),
          notes: s.notes ?? "",
          instructions: (s as any).instructions ?? "",
          sessionPhoto: (s as any).sessionPhoto ?? "",
          videoUrl: (s as any).videoUrl ?? "",
          firstClassFree: (s as any).firstClassFree ?? false,
          recurring: (s as any).recurring ?? false,
          recurringWeeks: (s as any).recurringWeeks != null ? String((s as any).recurringWeeks) : "",
          isPlan: false,
          planWeeks: "4",
          planSessions: [],
          discountPct: (s as any).discountPct ?? 0,
          discountLabel: (s as any).discountLabel ?? "",
          startDate: (s as any).startDate ?? "",
          allowLateBooking: (s as any).allowLateBooking !== false ? true : false,
          waitlistEnabled: (s as any).waitlistEnabled ?? false,
          recurringDates: (() => {
            const stored = Array.isArray((s as any).sessionDates) && !(s as any).isPlan ? (s as any).sessionDates : [];
            if (stored.length > 0) {
              return stored.map((d: any) => typeof d === "string" ? { date: d, time: s.time ?? "" } : d);
            }
            if ((s as any).recurring && (s as any).startDate && (s as any).recurringWeeks) {
              return generateRecurringDates((s as any).startDate, parseInt((s as any).recurringWeeks), s.time ?? "");
            }
            return [];
          })(),
        });
        setQuestionnaire((s as any).questionnaire ?? null);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load session"); setLoading(false); });
  }, [id]);

  function set(key: string, val: string) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "spotsTotal") {
        const spots = Math.max(2, parseInt(val) || 2);
        next.pricePerPlayer = String(calcPrice(spots, parseInt(f.duration) || 60));
        next.sessionType = spots <= 3 ? "semi-private" : spots <= 6 ? "small-group" : "clinic";
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
        body: JSON.stringify({ ...form, questionnaire }),
      });
      if (res.ok) { setSaved(true); }
      else { const d = await res.json(); setError(d.error ?? "Something went wrong"); }
    } finally { setSaving(false); }
  }

  if (loading) return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (error) return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  if (saved) return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center bg-white rounded-2xl border shadow-sm p-10 space-y-6">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Session updated!</h1>
        <div className="space-y-3">
          <Button className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={() => router.push(`/sessions/${id}`)}>View listing</Button>
          <Button variant="outline" className="w-full" onClick={() => setSaved(false)}>Keep editing</Button>
        </div>
      </div>
    </div>
  );

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
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Session Photo <span className="font-normal normal-case text-xs">(optional — defaults to your profile photo)</span></label>
            <ImageUpload
              currentUrl={(form as any).sessionPhoto}
              onUploaded={(url) => setForm((f) => ({ ...f, sessionPhoto: url }))}
              label="Upload a session preview photo"
            />
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Spots & Price</label>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Total spots available <span className="text-foreground font-bold">{form.spotsTotal}</span>
              </label>
              <input type="range" min="2" max="20" value={form.spotsTotal}
                onChange={(e) => set("spotsTotal", e.target.value)}
                className="w-full accent-[#0F3154]" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2</span><span>20</span>
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
            {/* Discount */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Offer a discount</p>
                  <p className="text-xs text-muted-foreground">Up to 50% off — great for filling spots fast</p>
                </div>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, discountPct: (f as any).discountPct > 0 ? 0 : 10 }))}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${(form as any).discountPct > 0 ? "bg-[#DC373E]" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${(form as any).discountPct > 0 ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
              {(form as any).discountPct > 0 && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Discount amount</span>
                      <span className="text-lg font-extrabold" style={{ color: "#DC373E" }}>{(form as any).discountPct}% off</span>
                    </div>
                    <input type="range" min={5} max={50} step={5} value={(form as any).discountPct}
                      onChange={(e) => setForm((f) => ({ ...f, discountPct: parseInt(e.target.value) }))}
                      className="w-full accent-[#DC373E]" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>5%</span><span>50%</span></div>
                  </div>
                  {(() => {
                    const original = parseInt(form.pricePerPlayer) || 0;
                    const discounted = Math.round(original * (1 - (form as any).discountPct / 100));
                    return (
                      <div className="rounded-xl p-4 bg-red-50 border border-red-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Players pay</p>
                          <p className="text-muted-foreground text-sm line-through">${original}/player</p>
                          <p className="text-xl font-extrabold" style={{ color: "#DC373E" }}>${discounted}/player</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">You earn (85%)</p>
                          <p className="text-xl font-bold" style={{ color: "#0F3154" }}>${Math.round(discounted * 0.85)}/player</p>
                        </div>
                      </div>
                    );
                  })()}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Promo label <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
                    <Input value={(form as any).discountLabel}
                      onChange={(e) => setForm((f) => ({ ...f, discountLabel: e.target.value.slice(0, 40) }))}
                      placeholder='e.g. "Early Bird", "Summer Special"' maxLength={40} />
                  </div>
                </div>
              )}
            </div>

            {/* First class free */}
            <div className="pt-2 border-t">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={(form as any).firstClassFree}
                  onChange={(e) => setForm((f) => ({ ...f, firstClassFree: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#0F3154]" />
                <div>
                  <p className="font-semibold text-sm">Offer first class free</p>
                  <p className="text-xs text-muted-foreground mt-0.5">A powerful tool to convert new players into recurring clients — they try for free, then book.</p>
                </div>
              </label>
            </div>

            {/* Waitlist */}
            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t">
              <input type="checkbox" checked={form.waitlistEnabled}
                onChange={(e) => setForm((f) => ({ ...f, waitlistEnabled: e.target.checked }))}
                className="mt-0.5 h-4 w-4 accent-[#0F3154]" />
              <div>
                <p className="font-semibold text-sm">Enable waitlist</p>
                <p className="text-xs text-muted-foreground mt-0.5">Players sign up with no charge. Once you have enough interest, open it for booking — they'll get an email to pay.</p>
              </div>
            </label>

            {/* Recurring + Package toggles */}
            <div className="border-t pt-3 space-y-3">
              {!form.isPlan && (
                <div>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, recurring: !(f as any).recurring } as any))}
                    className="flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all"
                    style={(form as any).recurring ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Recurring Session</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Runs every week on the same day, time, and location — no end date</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${(form as any).recurring ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${(form as any).recurring ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </button>
                </div>
              )}

              <button type="button"
                onClick={() => setForm((f) => ({ ...f, isPlan: !f.isPlan, recurring: false, recurringWeeks: "", planSessions: !f.isPlan ? buildPlanSessions(parseInt(f.planWeeks) || 4, f.time) : f.planSessions }))}
                className="flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all"
                style={form.isPlan ? { borderColor: "#DC373E", backgroundColor: "#fff5f5" } : { borderColor: "#e2e8f0" }}>
                <div className="text-left">
                  <p className="font-semibold text-sm">Package</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Players must book the entire package upfront — discount applied automatically</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${form.isPlan ? "bg-[#DC373E]" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPlan ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </button>

              {form.isPlan && (
                <div className="space-y-2 pt-1">
                  <label className="text-sm font-medium block">Number of sessions in package</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5, 6, 7, 8].map((w) => {
                      const disc = planDiscount(w);
                      return (
                        <button key={w} type="button"
                          onClick={() => setForm((f) => ({ ...f, planWeeks: String(w), planSessions: buildPlanSessions(w, f.time) }))}
                          className="flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all"
                          style={form.planWeeks === String(w) ? { borderColor: "#DC373E", backgroundColor: "#fff5f5" } : { borderColor: "#e2e8f0" }}>
                          <span className="font-bold text-sm">{w}</span>
                          <span className="text-xs font-semibold" style={{ color: "#DC373E" }}>{disc}% off</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Allow late booking toggle */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t">
                    <input type="checkbox" checked={form.allowLateBooking}
                      onChange={(e) => setForm((f) => ({ ...f, allowLateBooking: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 accent-[#DC373E]" />
                    <div>
                      <p className="font-semibold text-sm">Allow late joins (pro-rated)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Players who join after sessions have started pay only for remaining sessions.</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Location — after Spots & Price */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Schedule & Location</label>

            {form.isPlan ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Set the date and time for each session — any schedule works (3 days in a row, weekends only, etc.)</p>
                <div className="flex items-end gap-3 rounded-xl border border-dashed p-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Set time for all sessions</label>
                    <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
                  </div>
                  <button type="button"
                    className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-[#0F3154] hover:text-white"
                    style={{ borderColor: "#0F3154", color: "#0F3154" }}
                    onClick={() => setForm((f) => ({ ...f, planSessions: f.planSessions.map((s) => ({ ...s, time: f.time })) }))}>
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
                          onChange={(e) => setForm((f) => { const sessions = [...f.planSessions]; sessions[i] = { ...sessions[i], date: e.target.value }; return { ...f, planSessions: sessions }; })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Time</label>
                        <Input type="time" value={s.time}
                          onChange={(e) => setForm((f) => { const sessions = [...f.planSessions]; sessions[i] = { ...sessions[i], time: e.target.value }; return { ...f, planSessions: sessions }; })} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Start date <span className="font-normal text-xs text-muted-foreground">(optional — when the series begins)</span>
                  </label>
                  <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </div>
                {form.recurring && (
                  <div className="space-y-3">
                    {/* No end date vs limited run */}
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, recurringDates: [] } as any))}
                        className="p-3 rounded-xl border-2 text-left transition-all"
                        style={form.recurringDates.length === 0 ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}>
                        <p className="text-sm font-semibold">No end date</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Runs every week forever</p>
                      </button>
                      <button type="button"
                        onClick={() => {
                          if (form.recurringDates.length === 0) {
                            setForm((f) => ({ ...f, recurringDates: addNextRecurringDate([], f.startDate ? f.startDate : f.time ? new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0], f.time) } as any));
                          }
                        }}
                        className="p-3 rounded-xl border-2 text-left transition-all"
                        style={form.recurringDates.length > 0 ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}>
                        <p className="text-sm font-semibold">Limited run</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Set specific dates (up to 8)</p>
                      </button>
                    </div>
                    {form.recurringDates.length === 0 && (
                      <div className="rounded-xl bg-[#e8f0f9] px-3 py-2.5 text-xs text-[#0F3154]">
                        This session runs every <strong>{form.dayOfWeek || "[day]"}</strong> indefinitely — same time, same location. Players book and work out scheduling with you.
                      </div>
                    )}
                    {form.recurringDates.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">Quick generate from start date</p>
                          <div className="flex gap-1.5">
                            {[2,3,4,5,6,7,8].map((w) => (
                              <button key={w} type="button"
                                onClick={() => setForm((f) => ({ ...f, recurringDates: generateRecurringDates(f.startDate || new Date().toISOString().split("T")[0], w, f.time) } as any))}
                                className="w-7 h-7 rounded-lg text-xs font-semibold border-2 transition-all"
                                style={form.recurringDates.length === w ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9", color: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                        {form.recurringDates.map((d, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <Input type="date" value={d.date} className="flex-1"
                              onChange={(e) => setForm((f) => {
                                const dates = [...f.recurringDates]; dates[i] = { ...dates[i], date: e.target.value }; return { ...f, recurringDates: dates };
                              })} />
                            <Input type="time" value={d.time} className="w-28"
                              onChange={(e) => setForm((f) => {
                                const dates = [...f.recurringDates]; dates[i] = { ...dates[i], time: e.target.value }; return { ...f, recurringDates: dates };
                              })} />
                            <button type="button"
                              onClick={() => setForm((f) => ({ ...f, recurringDates: f.recurringDates.filter((_, j) => j !== i) }))}
                              className="text-muted-foreground hover:text-red-500 text-lg leading-none px-1 shrink-0">×</button>
                          </div>
                        ))}
                        <button type="button"
                          onClick={() => setForm((f) => ({ ...f, recurringDates: addNextRecurringDate(f.recurringDates, f.time) }))}
                          className="text-xs font-semibold text-[#0F3154] hover:underline">+ Add date</button>
                      </div>
                    )}
                  </div>
                )}
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
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                Skill Level
                <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button"
                  onClick={() => setForm((f) => ({
                    ...f, skillLevels: f.skillLevels.length === levels.length ? [] : [...levels],
                  }))}
                  className="py-2 px-3 rounded-lg text-sm font-medium border transition-colors"
                  style={form.skillLevels.length === levels.length ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                  All Levels
                </button>
                {levels.map((l) => (
                  <button key={l} type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      skillLevels: f.skillLevels.includes(l) ? f.skillLevels.filter((x) => x !== l) : [...f.skillLevels, l],
                    }))}
                    className="py-2 px-3 rounded-lg text-sm font-medium border transition-colors"
                    style={form.skillLevels.includes(l) ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                Age Range
                <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button"
                  onClick={() => setForm((f) => ({
                    ...f, ageRanges: f.ageRanges.length === ageRanges.length ? [] : [...ageRanges],
                  }))}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  style={form.ageRanges.length === ageRanges.length ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                  All Ages
                </button>
                {ageRanges.map((a) => (
                  <button key={a} type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      ageRanges: f.ageRanges.includes(a) ? f.ageRanges.filter((x) => x !== a) : [...f.ageRanges, a],
                    }))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.ageRanges.includes(a) ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>


          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 block">About this session <span style={{ color: "#DC373E" }}>*</span></label>
              <p className="text-xs text-muted-foreground mb-2">Describe what players will work on.</p>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value.slice(0, 400))} rows={3}
                placeholder="e.g. This session focuses on ball mastery and finishing in small groups..."
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <p className="text-xs text-muted-foreground text-right mt-1">{form.notes.length}/400</p>
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


          {/* Questionnaire builder */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Player Questionnaire</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Players complete this after booking — visible on their dashboard</p>
              </div>
              <button type="button"
                onClick={() => setQuestionnaire(questionnaire ? null : { title: "Before Your First Session", questions: [newQuestion()] })}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${questionnaire ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${questionnaire ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {questionnaire && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Questionnaire title</label>
                  <Input value={questionnaire.title}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, title: e.target.value })}
                    placeholder="e.g. Before Your First Session" />
                </div>

                <div className="space-y-3">
                  {questionnaire.questions.map((q, qi) => (
                    <div key={q.id} className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Input value={q.label}
                            onChange={(e) => setQuestionnaire((prev) => {
                              if (!prev) return prev;
                              const qs = [...prev.questions];
                              qs[qi] = { ...qs[qi], label: e.target.value };
                              return { ...prev, questions: qs };
                            })}
                            placeholder="Question text…" />
                          <div className="flex gap-3 flex-wrap items-center">
                            <div className="flex gap-1">
                              {(["text", "choice"] as const).map((t) => (
                                <button key={t} type="button"
                                  onClick={() => setQuestionnaire((prev) => {
                                    if (!prev) return prev;
                                    const qs = [...prev.questions];
                                    qs[qi] = { ...qs[qi], type: t, options: t === "choice" ? (qs[qi].options.length ? qs[qi].options : [""]) : [] };
                                    return { ...prev, questions: qs };
                                  })}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors capitalize"
                                  style={q.type === t ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                                  {t === "text" ? "Text answer" : "Multiple choice"}
                                </button>
                              ))}
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                              <input type="checkbox" checked={q.required}
                                onChange={(e) => setQuestionnaire((prev) => {
                                  if (!prev) return prev;
                                  const qs = [...prev.questions];
                                  qs[qi] = { ...qs[qi], required: e.target.checked };
                                  return { ...prev, questions: qs };
                                })}
                                className="accent-[#0F3154]" />
                              Required
                            </label>
                          </div>
                          {q.type === "choice" && (
                            <div className="space-y-1.5 pl-1">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex gap-2 items-center">
                                  <Input value={opt} placeholder={`Option ${oi + 1}`} className="text-sm"
                                    onChange={(e) => setQuestionnaire((prev) => {
                                      if (!prev) return prev;
                                      const qs = [...prev.questions];
                                      const opts = [...qs[qi].options];
                                      opts[oi] = e.target.value;
                                      qs[qi] = { ...qs[qi], options: opts };
                                      return { ...prev, questions: qs };
                                    })} />
                                  <button type="button" onClick={() => setQuestionnaire((prev) => {
                                    if (!prev) return prev;
                                    const qs = [...prev.questions];
                                    qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, i) => i !== oi) };
                                    return { ...prev, questions: qs };
                                  })} className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button type="button" onClick={() => setQuestionnaire((prev) => {
                                if (!prev) return prev;
                                const qs = [...prev.questions];
                                qs[qi] = { ...qs[qi], options: [...qs[qi].options, ""] };
                                return { ...prev, questions: qs };
                              })} className="text-xs text-[#0F3154] font-semibold hover:underline flex items-center gap-1 mt-1">
                                <Plus className="h-3 w-3" /> Add option
                              </button>
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => setQuestionnaire((prev) => {
                          if (!prev) return prev;
                          return { ...prev, questions: prev.questions.filter((_, i) => i !== qi) };
                        })} className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button"
                  onClick={() => setQuestionnaire((prev) => prev ? { ...prev, questions: [...prev.questions, newQuestion()] } : prev)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-dashed transition-colors hover:border-[#0F3154] hover:text-[#0F3154] text-muted-foreground w-full justify-center">
                  <Plus className="h-4 w-4" /> Add question
                </button>
              </div>
            )}
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
