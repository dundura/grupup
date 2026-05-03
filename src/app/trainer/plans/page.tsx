"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, Plus, Trash2, X, Check, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import Link from "next/link";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Plan {
  id: number; date?: string; dayOfWeek?: string; time?: string;
  sport?: string; city?: string; note?: string;
  interestCount: number; createdAt: string;
}
interface Interest {
  id: number; planId?: number; playerName?: string; playerEmail?: string;
  type: string; suggestedDate?: string; suggestedTime?: string; message?: string;
  status: string; createdAt: string;
}

const emptyForm = { date: "", dayOfWeek: "", time: "", sport: "", city: "", note: "" };

export default function TrainerPlansPage() {
  const { user, isLoaded } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [dateMode, setDateMode] = useState<"specific" | "day">("specific");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [acting, setActing] = useState<number | null>(null);
  const [plansAbout, setPlansAbout] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [savedAbout, setSavedAbout] = useState(false);
  const [trainerId, setTrainerId] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    Promise.all([
      fetch("/api/trainer/plans").then((r) => r.json()),
      fetch("/api/trainer/profile").then((r) => r.json()),
    ]).then(([d, profile]) => {
      setPlans(d.plans ?? []);
      setInterests(d.interests ?? []);
      setPlansAbout(d.plansAbout ?? "");
      if (profile?.id) setTrainerId(profile.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded]);

  async function saveAbout() {
    setSavingAbout(true);
    await fetch("/api/trainer/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plansAbout }),
    });
    setSavingAbout(false);
    setSavedAbout(true);
    setTimeout(() => setSavedAbout(false), 2000);
  }

  function openForm() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function addPlan() {
    const hasDate = dateMode === "specific" ? !!form.date : !!form.dayOfWeek;
    if (!hasDate && !form.time) return;
    setSaving(true);
    const payload = {
      ...form,
      date: dateMode === "specific" ? form.date : null,
      dayOfWeek: dateMode === "day" ? form.dayOfWeek : null,
    };
    const res = await fetch("/api/trainer/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const plan = await res.json();
    setPlans((p) => [{ ...plan, interestCount: 0 }, ...p]);
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  }

  async function deletePlan(id: number) {
    await fetch(`/api/trainer/plans/${id}`, { method: "DELETE" });
    setPlans((p) => p.filter((x) => x.id !== id));
  }

  async function removeInterest(interestId: number, planId: number) {
    await fetch("/api/trainer/plans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interestId, planId }),
    });
    setInterests((prev) => prev.filter((i) => i.id !== interestId));
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, interestCount: Math.max(0, p.interestCount - 1) } : p));
  }

  async function actOnSuggestion(interestId: number, action: "approve" | "reject") {
    setActing(interestId);
    const res = await fetch(`/api/trainer/plans/${interestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const d = await res.json();
    if (action === "approve" && d.plan) {
      setPlans((p) => [{ ...d.plan, interestCount: 0 }, ...p]);
    }
    setInterests((prev) => prev.map((i) => i.id === interestId
      ? { ...i, status: action === "approve" ? "approved" : "rejected" }
      : i));
    setActing(null);
  }

  const suggestions = interests.filter((i) => i.type === "suggestion" && i.status === "pending");

  if (!isLoaded || loading) return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container max-w-3xl py-8 px-4 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pre-launch Plans</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Post dates you're thinking about — players express interest before you commit.</p>
          </div>
          <Button onClick={openForm} style={{ backgroundColor: "#DC373E" }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* About text */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">About (shown on your profile page)</label>
            <Button size="sm" onClick={saveAbout} disabled={savingAbout}
              style={{ backgroundColor: "#0F3154" }}>
              {savedAbout ? "Saved ✓" : savingAbout ? "Saving…" : "Save"}
            </Button>
          </div>
          <RichTextEditor
            value={plansAbout}
            onChange={setPlansAbout}
            placeholder="Write a brief overview about yourself or your training style. This appears at the top of your gauge interest page."
            maxLength={1000}
          />
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">

            {/* Toggle */}
            <div className="flex rounded-xl border overflow-hidden text-sm font-semibold w-fit">
              <button
                onClick={() => { setDateMode("specific"); setForm((f) => ({ ...f, dayOfWeek: "" })); }}
                className="px-4 py-2 transition-colors"
                style={dateMode === "specific" ? { backgroundColor: "#0F3154", color: "white" } : { color: "#6b7280" }}>
                Specific Date
              </button>
              <button
                onClick={() => { setDateMode("day"); setForm((f) => ({ ...f, date: "" })); }}
                className="px-4 py-2 transition-colors border-l"
                style={dateMode === "day" ? { backgroundColor: "#0F3154", color: "white" } : { color: "#6b7280" }}>
                Day of Week
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Date or Day picker */}
              {dateMode === "specific" ? (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Day of week</label>
                  <select value={form.dayOfWeek}
                    onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select a day…</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Time (optional)</label>
                <input type="time" value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sport (optional)</label>
                <input value={form.sport}
                  onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                  placeholder="e.g. Soccer"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location (optional)</label>
                <input value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Austin, TX"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Note (optional)</label>
                <input value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Thinking about a small group session…"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" disabled={saving || (dateMode === "specific" ? !form.date : !form.dayOfWeek)}
                onClick={addPlan} style={{ backgroundColor: "#0F3154" }}>
                {saving ? "Saving…" : "Post"}
              </Button>
            </div>
          </div>
        )}

        {/* Pending suggestions from players */}
        {suggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-sm text-amber-800">
              {suggestions.length} player suggestion{suggestions.length > 1 ? "s" : ""} waiting for review
            </p>
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border p-4 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{s.playerName ?? "Player"}</p>
                  {(s.suggestedDate || s.suggestedTime) && (
                    <p className="text-xs text-muted-foreground">
                      {s.suggestedDate && new Date(s.suggestedDate + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {s.suggestedTime && ` at ${formatTime(s.suggestedTime)}`}
                    </p>
                  )}
                  {s.message && <p className="text-xs text-muted-foreground italic">"{s.message}"</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => actOnSuggestion(s.id, "approve")} disabled={acting === s.id}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => actOnSuggestion(s.id, "reject")} disabled={acting === s.id}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50">
                    <X className="h-3 w-3" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan list */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-base mb-1">No plans posted yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add a date or day to start gauging interest from players.</p>
            <Button onClick={openForm} style={{ backgroundColor: "#DC373E" }} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add your first plan
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const planInterests = interests.filter((i) => i.planId === plan.id && i.type === "interest");
              const isOpen = expanded === plan.id;
              const label = planLabel(plan);
              return (
                <div key={plan.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{ backgroundColor: "#EFF6FF" }}>
                        <CalendarDays className="h-5 w-5" style={{ color: "#0F3154" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {trainerId && (
                        <Link href={`/groups/${trainerId}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "#0F3154" }}>
                          View session
                        </Link>
                      )}
                      <button onClick={() => setExpanded(isOpen ? null : plan.id)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {plan.interestCount ?? planInterests.length}
                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {plan.note && !plan.sport && !plan.city && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-muted-foreground italic">"{plan.note}"</p>
                    </div>
                  )}

                  {isOpen && (
                    <div className="border-t px-4 py-3 space-y-2">
                      {planInterests.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No one has expressed interest yet.</p>
                      ) : planInterests.map((i) => (
                        <div key={i.id} className="flex items-center gap-2 group">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: "#0F3154" }}>
                            {(i.playerName ?? "?")[0].toUpperCase()}
                          </div>
                          <p className="text-xs font-medium">{i.playerName ?? "Player"}</p>
                          {i.playerEmail && <p className="text-xs text-muted-foreground flex-1">{i.playerEmail}</p>}
                          <button
                            onClick={() => removeInterest(i.id, plan.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                            title="Remove">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Link href="/trainer/manage" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to session management
          </Link>
        </div>
      </div>
    </div>
  );
}

function planLabel(plan: Plan): string {
  if (plan.dayOfWeek) {
    return `Every ${plan.dayOfWeek}${plan.time ? ` · ${formatTime(plan.time)}` : ""}`;
  }
  if (plan.date) {
    return new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      + (plan.time ? ` · ${formatTime(plan.time)}` : "");
  }
  return plan.time ? formatTime(plan.time) : "TBD";
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
