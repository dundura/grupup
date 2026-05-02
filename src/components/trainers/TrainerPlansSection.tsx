"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, Check, Sparkles, X } from "lucide-react";

interface Plan {
  id: number; date?: string; dayOfWeek?: string; time?: string; sport?: string; city?: string;
  note?: string; interestCount: number;
}

export default function TrainerPlansSection({ trainerId }: { trainerId: string }) {
  const { user, isLoaded } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myInterests, setMyInterests] = useState<number[]>([]);
  const [trainerClerkId, setTrainerClerkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggest, setSuggest] = useState({ date: "", time: "", message: "" });
  const [suggestSent, setSuggestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [interestModal, setInterestModal] = useState<number | null>(null);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  useEffect(() => {
    fetch(`/api/trainers/${trainerId}/plans`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) { setLoading(false); return; }
        setPlans(d.plans ?? []);
        setMyInterests(d.myInterests ?? []);
        setTrainerClerkId(d.trainerClerkId ?? "");
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [trainerId]);

  async function expressInterest(planId: number) {
    if (!isLoaded) return;
    if (!childName.trim() || !childAge.trim()) return;
    setActing(planId);
    const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
    const res = await fetch(`/api/trainers/${trainerId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "interest", planId, playerName: name, playerEmail: email,
        childName: childName.trim(),
        childAge: parseInt(childAge),
        parentPhone: parentPhone.trim() || null,
      }),
    });
    if (res.ok) {
      setMyInterests((p) => [...p, planId]);
      setPlans((prev) => prev.map((pl) => pl.id === planId ? { ...pl, interestCount: pl.interestCount + 1 } : pl));
    }
    setActing(null);
    setInterestModal(null);
    setChildName(""); setChildAge(""); setParentPhone("");
  }

  async function submitSuggestion() {
    setSending(true);
    const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
    await fetch(`/api/trainers/${trainerId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "suggestion", playerName: name, playerEmail: email, ...suggest }),
    });
    setSuggestSent(true);
    setSending(false);
  }

  if (loading || plans.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 shadow-sm p-5 overflow-hidden" style={{ borderColor: "#DC373E", backgroundColor: "#fff8f8" }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <p className="font-bold text-base" style={{ color: "#DC373E" }}>Gauge Interest</p>
      </div>
      <p className="text-xs font-semibold mb-1" style={{ color: "#DC373E" }}>These are potential sessions — not yet confirmed.</p>
      <p className="text-xs text-muted-foreground mb-4">Your trainer is considering offering these dates and would like to know if there's enough interest before committing. Tap <strong>I'm interested</strong> to let them know — the more interest, the more likely they'll launch it.</p>

      <div className="space-y-3">
        {plans.map((plan) => {
          const interested = myInterests.includes(plan.id);
          return (
            <div key={plan.id} className="flex items-center justify-between gap-3 py-3 border-b last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: "#EFF6FF" }}>
                  <CalendarDays className="h-4 w-4" style={{ color: "#0F3154" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">
                    {plan.dayOfWeek
                      ? `Every ${plan.dayOfWeek}${plan.time ? ` · ${formatTime(plan.time)}` : ""}`
                      : plan.date
                        ? new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (plan.time ? ` · ${formatTime(plan.time)}` : "")
                        : "Date TBD"}
                  </p>
                  {(plan.sport || plan.city || plan.note) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note}
                    </p>
                  )}
                  {plan.interestCount > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{plan.interestCount} interested</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { if (!interested) setInterestModal(plan.id); }}
                disabled={interested || acting === plan.id}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors shrink-0"
                style={interested
                  ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                  : { backgroundColor: "#DC373E", color: "white", borderColor: "#DC373E" }}>
                {interested ? <><Check className="h-3 w-3" /> Interested</> : "I'm interested"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interest modal */}
      {interestModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Tell us about your child</h2>
              <button onClick={() => setInterestModal(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Child's name *</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)}
                  placeholder="First & last name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Child's age *</label>
                <input type="number" value={childAge} onChange={(e) => setChildAge(e.target.value)}
                  placeholder="Age" min={1} max={99}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Parent phone (optional)</label>
                <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setInterestModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={() => expressInterest(interestModal)}
                disabled={!childName.trim() || !childAge.trim() || acting === interestModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#DC373E" }}>
                {acting === interestModal ? "Saving…" : "I'm interested"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggest a time */}
      <div className="mt-4 pt-3 border-t">
        {suggestSent ? (
          <p className="text-xs text-green-700 font-medium text-center py-1">✓ Suggestion sent! The trainer will review it.</p>
        ) : showSuggest ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Suggest a different time</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={suggest.date} onChange={(e) => setSuggest((s) => ({ ...s, date: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="time" value={suggest.time} onChange={(e) => setSuggest((s) => ({ ...s, time: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <input value={suggest.message} onChange={(e) => setSuggest((s) => ({ ...s, message: e.target.value }))}
              placeholder="Optional note..." className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSuggest(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Cancel</button>
              <button onClick={submitSuggestion} disabled={sending || (!suggest.date && !suggest.time)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: "#0F3154" }}>
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowSuggest(true)}
            className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
            + Suggest a different time
          </button>
        )}
      </div>
    </div>
  );
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
