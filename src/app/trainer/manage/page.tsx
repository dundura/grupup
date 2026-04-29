"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Mail, Users, RefreshCw, X, RotateCcw } from "lucide-react";

interface Session {
  id: number; title: string; sport: string; city: string;
  dayOfWeek: string; time: string; spotsTotal: number; spotsLeft: number;
  waitlistEnabled?: boolean;
}
interface WaitlistEntry {
  id: number; sessionId: number; userName: string | null; userEmail: string; createdAt: string;
}

interface Booking {
  id: number; sessionId: string | null; userName: string; userEmail: string;
  athleteName: string; createdAt: string; amountPaid: number; trainerAmount: number;
  sessionTitle: string;
}

interface Follower {
  clerkId: string; name: string; email: string; photo: string;
}

type Modal = { type: "session"; sessionId: number; sessionTitle: string } | { type: "followers" } | null;

export default function TrainerManagePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [waitlists, setWaitlists] = useState<Record<number, WaitlistEntry[]>>({});
  const [notifying, setNotifying] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [refunding, setRefunding] = useState<number | null>(null);
  const [refundModal, setRefundModal] = useState<{ id: number; name: string; amount: number } | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/sign-in"); return; }
    Promise.all([
      fetch("/api/trainer/sessions").then((r) => r.json()),
      fetch("/api/trainer/bookings").then((r) => r.json()),
      fetch("/api/trainer/message-followers").then((r) => r.json()),
    ]).then(async ([sess, bkgs, fols]) => {
      const sessArr: Session[] = Array.isArray(sess) ? sess : [];
      setSessions(sessArr);
      setBookings(Array.isArray(bkgs) ? bkgs : []);
      setFollowers(Array.isArray(fols) ? fols : []);
      // Load waitlists for sessions that have waitlist enabled
      const wlMap: Record<number, WaitlistEntry[]> = {};
      await Promise.all(sessArr.map(async (s) => {
        try {
          const r = await fetch(`/api/sessions/${s.id}/waitlist`);
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0) wlMap[s.id] = data;
        } catch {}
      }));
      setWaitlists(wlMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  async function handleNotifyWaitlist(sessionId: number) {
    if (!confirm("Email everyone on the waitlist that booking is now open?")) return;
    setNotifying(sessionId);
    try {
      const res = await fetch(`/api/trainer/sessions/${sessionId}/notify-waitlist`, { method: "POST" });
      const d = await res.json();
      alert(`Sent to ${d.sent} ${d.sent === 1 ? "person" : "people"} on the waitlist.`);
    } finally {
      setNotifying(null);
    }
  }

  async function confirmRefund() {
    if (!refundModal) return;
    setRefunding(refundModal.id);
    setRefundModal(null);
    try {
      const res = await fetch(`/api/bookings/${refundModal.id}/refund`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== refundModal.id));
      } else {
        alert(d.error ?? "Refund failed");
      }
    } finally {
      setRefunding(null);
    }
  }


  async function handleSend() {
    if (!message.trim() || !modal) return;
    setSending(true);
    try {
      let url = "";
      if (modal.type === "session") url = `/api/trainer/sessions/${modal.sessionId}/message`;
      else url = "/api/trainer/message-followers";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const d = await res.json();
      setSentMsg(`Sent to ${d.sent} ${d.sent === 1 ? "person" : "people"}`);
      setMessage("");
      setSubject("");
      setTimeout(() => { setSentMsg(""); setModal(null); }, 2500);
    } finally {
      setSending(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-12">

      {/* Refund confirmation modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <RotateCcw className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-base">Issue a refund?</p>
                <p className="text-sm text-muted-foreground">{refundModal.name}</p>
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800 font-medium">This cannot be undone</p>
              <p className="text-xs text-amber-700 mt-0.5">${refundModal.amount} will be returned to the player's original payment method within 5–10 business days.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRefundModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={confirmRefund}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#DC373E" }}>
                Yes, refund it
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage</h1>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">← Dashboard</Link>
        </div>

        {/* Sessions + Roster */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">Sessions</h2>
            <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
              <Link href="/trainer/new-session">+ New session</Link>
            </Button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const roster = bookings.filter((b) => b.sessionId === String(s.id));
                const isOpen = expanded === s.id;
                return (
                  <div key={s.id} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.sport}{s.city ? ` · ${s.city}` : ""}
                          {s.dayOfWeek && s.time ? ` · ${s.dayOfWeek}s at ${s.time}` : ""}
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${s.spotsLeft === 0 ? "text-red-600" : s.spotsLeft <= 2 ? "text-amber-600" : "text-green-700"}`}>
                          {s.spotsLeft === 0 ? "Full" : `${s.spotsTotal - s.spotsLeft} booked · ${s.spotsLeft} spots left`}
                        </p>
                      </div>
                      {roster.length > 0 && (
                        <button type="button" onClick={() => setExpanded(isOpen ? null : s.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0F3154] shrink-0">
                          {roster.length} registered
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>

                    {isOpen && roster.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Name</th>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Athlete</th>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Booked</th>
                                <th className="px-3 py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {roster.map((b) => (
                                <tr key={b.id} className="border-t">
                                  <td className="px-3 py-2 font-medium">{b.userName || "—"}</td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {b.athleteName && b.athleteName !== b.userName ? b.athleteName : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button type="button"
                                      onClick={() => setRefundModal({ id: b.id, name: b.userName || "this player", amount: b.amountPaid })}
                                      disabled={refunding === b.id}
                                      className="text-xs text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1"
                                      title="Refund this booking">
                                      <RotateCcw className="h-3 w-3" />
                                      {refunding === b.id ? "…" : "Refund"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button type="button"
                          onClick={() => { setModal({ type: "session", sessionId: s.id, sessionTitle: s.title }); setSentMsg(""); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#0F3154] hover:underline">
                          <Mail className="h-3.5 w-3.5" /> Message all registrants
                        </button>
                      </div>
                    )}
                    {roster.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1.5">No registrations yet.</p>
                    )}

                    {/* Waitlist */}
                    {waitlists[s.id]?.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground">{waitlists[s.id].length} on waitlist</p>
                          <button type="button"
                            onClick={() => handleNotifyWaitlist(s.id)}
                            disabled={notifying === s.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#DC373E" }}>
                            <Mail className="h-3 w-3" />
                            {notifying === s.id ? "Sending…" : "Notify — spots open!"}
                          </button>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Name</th>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Email</th>
                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                              {waitlists[s.id].map((w) => (
                                <tr key={w.id} className="border-t">
                                  <td className="px-3 py-2 font-medium">{w.userName || "—"}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{w.userEmail}</td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Followers */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold">Followers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{followers.length} {followers.length === 1 ? "person follows" : "people follow"} you</p>
            </div>
            {followers.length > 0 && (
              <button type="button"
                onClick={() => { setModal({ type: "followers" }); setSentMsg(""); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-colors"
                style={{ backgroundColor: "#0F3154" }}>
                <Mail className="h-4 w-4" /> Message all
              </button>
            )}
          </div>

          {followers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No followers yet.</p>
          ) : (
            <div className="space-y-2">
              {followers.map((f) => (
                <div key={f.clerkId} className="flex items-center gap-3 py-2 border-b last:border-0">
                  {f.photo ? (
                    <Image src={f.photo} alt={f.name} width={32} height={32} className="rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">
                {modal.type === "session"
                  ? `Message registrants — ${modal.sessionTitle}`
                  : `Message all followers (${followers.length})`}
              </h3>
              <button type="button" onClick={() => setModal(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {sentMsg ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">✅</div>
                <p className="font-semibold">{sentMsg}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Subject (optional)</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Session update, Reminder…" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={5} placeholder="Write your message…"
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                  <Button className="flex-1" disabled={!message.trim() || sending}
                    style={{ backgroundColor: "#DC373E" }} onClick={handleSend}>
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
