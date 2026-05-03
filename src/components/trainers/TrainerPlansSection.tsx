"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Check, X, Mail } from "lucide-react";

interface Plan {
  id: number; date?: string; dayOfWeek?: string; time?: string; sport?: string; city?: string;
  note?: string; interestCount: number;
}

export default function TrainerPlansSection({ trainerId }: { trainerId: string }) {
  const { user, isLoaded } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myInterests, setMyInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [interestModal, setInterestModal] = useState<number | null>(null);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [childCity, setChildCity] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    fetch(`/api/trainers/${trainerId}/plans`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) { setLoading(false); return; }
        setPlans(d.plans ?? []);
        setMyInterests(d.myInterests ?? []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [trainerId]);

  useEffect(() => {
    if (user) {
      setContactForm((f) => ({
        ...f,
        name: f.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: f.email || (user.emailAddresses?.[0]?.emailAddress ?? ""),
      }));
    }
  }, [user]);

  async function submitContact() {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return;
    setContactSending(true);
    await fetch(`/api/trainers/${trainerId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "suggestion",
        playerName: contactForm.name,
        playerEmail: contactForm.email,
        message: contactForm.message,
      }),
    });
    setContactSent(true);
    setContactSending(false);
  }

  async function expressInterest(planId: number) {
    if (!isLoaded) return;
    if (!childName.trim() || !childAge.trim() || !parentPhone.trim() || !childCity.trim()) return;
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
        parentPhone: parentPhone.trim(),
        childCity: childCity.trim(),
      }),
    });
    if (res.ok) {
      setMyInterests((p) => [...p, planId]);
      setPlans((prev) => prev.map((pl) => pl.id === planId ? { ...pl, interestCount: pl.interestCount + 1 } : pl));
    }
    setActing(null);
    setInterestModal(null);
    setChildName(""); setChildAge(""); setParentPhone(""); setChildCity("");
  }

  async function removeInterest(planId: number) {
    setActing(planId);
    const res = await fetch(`/api/trainers/${trainerId}/plans`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (res.ok) {
      setMyInterests((p) => p.filter((id) => id !== planId));
      setPlans((prev) => prev.map((pl) => pl.id === planId ? { ...pl, interestCount: Math.max(0, pl.interestCount - 1) } : pl));
    }
    setActing(null);
  }


  if (loading || plans.length === 0) return null;

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
      {/* Table */}
      <div>
        <table className="w-full text-sm">
          <thead className="bg-white/60">
            <tr>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Date</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Sport · Location</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Interest</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const interested = myInterests.includes(plan.id);
              const dateLabel = plan.dayOfWeek
                ? `Every ${plan.dayOfWeek}${plan.time ? ` · ${formatTime(plan.time)}` : ""}`
                : plan.date
                  ? new Date(plan.date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (plan.time ? ` · ${formatTime(plan.time)}` : "")
                  : "Date TBD";
              return (
                <tr key={plan.id} className="border-t bg-white/40">
                  <td className="px-5 py-3 font-semibold text-sm">{dateLabel}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {[plan.sport, plan.city].filter(Boolean).join(" · ") || plan.note || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {plan.interestCount > 0 ? `${plan.interestCount} interested` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => interested ? removeInterest(plan.id) : setInterestModal(plan.id)}
                      disabled={acting === plan.id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all shrink-0 ml-auto"
                      style={interested
                        ? { backgroundColor: "#16a34a", color: "white", borderColor: "#16a34a" }
                        : { backgroundColor: "#DC373E", color: "white", borderColor: "#DC373E" }}>
                      {acting === plan.id ? "…" : interested ? <><Check className="h-3 w-3" /> Interested</> : "I'm interested"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contact button */}
      <div className="px-5 py-4 border-t bg-white/60 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Not sure? Send a message and we'll be in touch.</p>
        <button
          onClick={() => setContactOpen(true)}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors shrink-0"
          style={{ borderColor: "#0F3154", color: "#0F3154" }}>
          <Mail className="h-4 w-4" /> Contact
        </button>
      </div>

      {/* Contact modal */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Express Interest</h2>
              <button onClick={() => setContactOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {contactSent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold">Message sent!</p>
                <p className="text-sm text-muted-foreground mt-1">The trainer will be in touch soon.</p>
                <button onClick={() => { setContactOpen(false); setContactSent(false); }}
                  className="mt-4 text-sm font-semibold hover:underline" style={{ color: "#0F3154" }}>Close</button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Your name *</label>
                    <input value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="First & last name"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                    <input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Message *</label>
                    <textarea value={contactForm.message} onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                      rows={3} placeholder="Tell us about your child, what you're looking for…"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setContactOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={submitContact}
                    disabled={!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim() || contactSending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: "#0F3154" }}>
                    {contactSending ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">City *</label>
                <input value={childCity} onChange={(e) => setChildCity(e.target.value)}
                  placeholder="e.g. Cary, NC"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Parent phone *</label>
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
                disabled={!childName.trim() || !childAge.trim() || !parentPhone.trim() || !childCity.trim() || acting === interestModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#DC373E" }}>
                {acting === interestModal ? "Saving…" : "I'm interested"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
