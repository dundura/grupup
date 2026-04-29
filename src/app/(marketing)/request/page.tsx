"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SPORTS = ["Soccer", "Basketball", "Tennis", "Baseball", "Volleyball", "Speed & Agility", "Multi-sport", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
const SESSION_OPTIONS = ["1", "2–4", "5–8", "9–12", "12+"];

export default function RequestTrainingPage() {
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notified, setNotified] = useState(0);
  const [form, setForm] = useState({
    name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    trainingType: "individual",
    groupSize: "",
    sport: "",
    level: "",
    city: "",
    zipCode: "",
    preferredDate: "",
    preferredTime: "",
    sessions: "",
    budget: "",
    message: "",
  });

  function setF(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const valid = form.name.trim() && form.email.trim() && (form.city.trim() || form.zipCode.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/training-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.ok) { setSubmitted(true); setNotified(d.notified ?? 0); }
      else alert(d.error ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        <CheckCircle className="h-14 w-14 mx-auto mb-4 text-green-600" />
        <h1 className="text-2xl font-bold mb-2">Request sent!</h1>
        <p className="text-muted-foreground mb-2">
          {notified > 0
            ? `${notified} trainer${notified > 1 ? "s" : ""} in your area have been notified.`
            : "We're finding trainers in your area."}
        </p>
        <p className="text-muted-foreground text-sm mb-6">When a trainer accepts, you'll get an email with a payment link to confirm your booking.</p>
        <a href="/groups" className="block w-full py-3 rounded-xl text-white font-semibold text-sm text-center"
          style={{ backgroundColor: "#DC373E" }}>
          Browse Sessions While You Wait
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Hero */}
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-14 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
          <Search className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Find a Trainer Near You</h1>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Post your training request. Local trainers respond, you pick the best fit.
        </p>
      </div>

      <div className="container max-w-xl py-10 px-4">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Contact */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-base">Your Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name <span className="text-red-500">*</span></label>
                <Input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="Alex Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email <span className="text-red-500">*</span></label>
                <Input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="you@email.com" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-base">Location <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">City</label>
                <Input value={form.city} onChange={(e) => setF("city", e.target.value)} placeholder="e.g. Cary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Zip Code</label>
                <Input value={form.zipCode} onChange={(e) => setF("zipCode", e.target.value)} placeholder="e.g. 27519" />
              </div>
            </div>
          </div>

          {/* Training Details */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-base">Training Details</h2>

            {/* Training type toggle */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Training Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["individual", "group"].map((type) => (
                  <button key={type} type="button"
                    onClick={() => setF("trainingType", type)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${form.trainingType === type ? "text-white border-transparent" : "border-gray-200 text-muted-foreground"}`}
                    style={form.trainingType === type ? { backgroundColor: "#0F3154" } : undefined}>
                    {type === "individual" ? "Individual / Private" : "Group Training"}
                  </button>
                ))}
              </div>
            </div>

            {form.trainingType === "group" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Expected Group Size</label>
                <select value={form.groupSize} onChange={(e) => setF("groupSize", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">How many players?</option>
                  {["2–4", "5–8", "9–12", "13–20", "20+"].map((n) => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sport</label>
                <select value={form.sport} onChange={(e) => setF("sport", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select sport</option>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Player Level</label>
                <select value={form.level} onChange={(e) => setF("level", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select level</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Preferred Date</label>
                <Input type="date" value={form.preferredDate} onChange={(e) => setF("preferredDate", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Preferred Time</label>
                <Input type="time" value={form.preferredTime} onChange={(e) => setF("preferredTime", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block"># of Sessions</label>
                <select value={form.sessions} onChange={(e) => setF("sessions", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">How many?</option>
                  {SESSION_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Your Budget / Session</label>
                <Input value={form.budget} onChange={(e) => setF("budget", e.target.value)} placeholder="e.g. $25–$40" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Additional Notes</label>
              <textarea value={form.message} onChange={(e) => setF("message", e.target.value)}
                rows={3} placeholder="Number of players, specific goals, equipment available…"
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: "#f0f4f9" }}>
            <p className="font-semibold text-sm" style={{ color: "#0F3154" }}>How it works</p>
            <div className="space-y-2">
              {[
                "Post your request — takes 60 seconds",
                "Local trainers get notified and can accept",
                "You receive a payment link from the trainer",
                "Pay to confirm — booking is locked in",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: "#DC373E" }}>{i + 1}</span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={!valid || submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#DC373E" }}>
            {submitting ? "Sending to trainers…" : "Post Training Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
