"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, Plus, Trash2, Check, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Plan {
  id: number; date?: string; time?: string; sport?: string; city?: string; note?: string;
  interestCount: number; createdAt: string;
}
interface Interest {
  id: number; planId?: number; playerName?: string; playerEmail?: string;
  type: string; suggestedDate?: string; suggestedTime?: string; message?: string;
  status: string; createdAt: string;
}

export default function TrainerPlansPage() {
  const { user, isLoaded } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState({ date: "", time: "", sport: "", city: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    fetch("/api/trainer/plans").then((r) => r.json()).then((d) => {
      setPlans(d.plans ?? []);
      setInterests(d.interests ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded]);

  async function addPlan() {
    if (!form.date && !form.time) return;
    setSaving(true);
    const res = await fetch("/api/trainer/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const plan = await res.json();
    setPlans((p) => [{ ...plan, interestCount: 0 }, ...p]);
    setForm({ date: "", time: "", sport: "", city: "", note: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function deletePlan(id: number) {
    await fetch(`/api/trainer/plans/${id}`, { method: "DELETE" });
    setPlans((p) => p.filter((x) => x.id !== id));
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
    setInterests((prev) => prev.map((i) => i.id === interestId ? { ...i, status: action === "approve" ? "approved" : "rejected" } : i));
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
          <Button onClick={() => setShowForm((v) => !v)} style={{ backgroundColor: "#DC373E" }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Date
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <p className="font-semibold text-sm">New planned date</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sport (optional)</label>
                <input value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                  placeholder="e.g. Soccer" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location (optional)</label>
                <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Austin, TX" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Note (optional)</label>
                <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Thinking about a small group session..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" disabled={saving || (!form.date && !form.time)} onClick={addPlan}
                style={{ backgroundColor: "#0F3154" }}>
                {saving ? "Saving…" : "Post Date"}
              </Button>
            </div>
          </div>
        )}

        {/* Pending suggestions from players */}
        {suggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-sm text-amber-800">{suggestions.length} player suggestion{suggestions.length > 1 ? "s" : ""} waiting for review</p>
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
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: "#0F3154" }}>
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => actOnSuggestion(s.id, "reject")} disabled={acting === s.id}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors">
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
            <p className="font-semibold text-base mb-1">No planned dates yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add a date to start gauging interest from players.</p>
            <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "#DC373E" }} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add your first date
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const planInterests = interests.filter((i) => i.planId === plan.id && i.type === "interest");
              const isOpen = expanded === plan.id;
              return (
                <div key={plan.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{ backgroundColor: "#EFF6FF" }}>
                        <CalendarDays className="h-5 w-5" style={{ color: "#0F3154" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">
                          {plan.date ? new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "TBD"}
                          {plan.time && ` · ${formatTime(plan.time)}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note || "No details yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => setExpanded(isOpen ? null : plan.id)}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {plan.interestCount ?? planInterests.length}
                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      <button onClick={() => deletePlan(plan.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {plan.note && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-muted-foreground italic">"{plan.note}"</p>
                    </div>
                  )}

                  {isOpen && (
                    <div className="border-t px-4 py-3 space-y-2">
                      {planInterests.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No one has expressed interest yet.</p>
                      ) : (
                        planInterests.map((i) => (
                          <div key={i.id} className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: "#0F3154" }}>
                              {(i.playerName ?? "?")[0].toUpperCase()}
                            </div>
                            <p className="text-xs font-medium">{i.playerName ?? "Player"}</p>
                            {i.playerEmail && <p className="text-xs text-muted-foreground">{i.playerEmail}</p>}
                          </div>
                        ))
                      )}
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

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
