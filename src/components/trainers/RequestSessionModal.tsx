"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Mail, X, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

export default function RequestSessionModal({
  trainerId,
  trainerName,
}: {
  trainerId: string;
  trainerName: string;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    sport: "",
    level: "",
    preferredDate: "",
    preferredTime: "",
    sessions: "",
    budget: "",
    message: "",
  });

  function setF(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const valid = form.name.trim() && form.email.trim();

  async function handleSubmit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trainers/${trainerId}/request-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-white font-semibold text-sm"
        style={{ backgroundColor: "#DC373E" }}>
        <Mail className="h-4 w-4" />
        Request a Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Request sent!</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  We'll follow up within 24 hours about training with {trainerName}.
                </p>
                <button onClick={() => { setOpen(false); setSubmitted(false); }}
                  className="w-full py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Request a Session</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">with {trainerName}</p>
                  </div>
                  <button onClick={() => setOpen(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Your Name <span className="text-red-500">*</span></label>
                      <Input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="Alex Smith" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email <span className="text-red-500">*</span></label>
                      <Input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="you@email.com" />
                    </div>
                  </div>

                  {/* Sport + Level */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sport / Focus</label>
                      <Input value={form.sport} onChange={(e) => setF("sport", e.target.value)} placeholder="e.g. Soccer" />
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

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Preferred Date <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <Input type="date" value={form.preferredDate} onChange={(e) => setF("preferredDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Preferred Time <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <Input type="time" value={form.preferredTime} onChange={(e) => setF("preferredTime", e.target.value)} />
                    </div>
                  </div>

                  {/* Sessions + Budget */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block"># of Sessions</label>
                      <select value={form.sessions} onChange={(e) => setF("sessions", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">How many?</option>
                        {["1", "2–4", "5–8", "9–12", "12+"].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Budget per Session</label>
                      <Input value={form.budget} onChange={(e) => setF("budget", e.target.value)} placeholder="e.g. $30–$50" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea value={form.message} onChange={(e) => setF("message", e.target.value)}
                      rows={3} placeholder="Number of players, goals, specific drills…"
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={!valid || submitting}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: "#DC373E" }}>
                    {submitting ? "Sending…" : "Send Request"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
