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
  id: number; sessionId: number; userName: string | null; userEmail: string;
  childName?: string | null; childAge?: number | null; parentPhone?: string | null;
  createdAt: string;
}

interface Booking {
  id: number; sessionId: string | null; userName: string; userEmail: string;
  athleteName: string; createdAt: string; amountPaid: number; trainerAmount: number;
  sessionTitle: string;
}

interface Follower {
  clerkId: string; name: string; email: string; photo: string;
}

type Modal = { type: "session"; sessionId: number; sessionTitle: string } | { type: "followers" } | { type: "waitlist"; sessionId: number; sessionTitle: string; count: number; emails: string[] } | null;

export default function TrainerManagePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [waitlists, setWaitlists] = useState<Record<number, WaitlistEntry[]>>({});
  const [selectedWaitlist, setSelectedWaitlist] = useState<Record<number, Set<number>>>({});
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
  const [notifyModal, setNotifyModal] = useState<{ sessionId: number; sessionTitle: string; count: number } | null>(null);
  const [notifySent, setNotifySent] = useState<number | null>(null);

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
      // Load waitlists for all sessions
      const wlMap: Record<number, WaitlistEntry[]> = {};
      await Promise.all(sessArr.map(async (s) => {
        try {
          const r = await fetch(`/api/sessions/${s.id}/waitlist`);
          const data = await r.json();
          wlMap[s.id] = Array.isArray(data) ? data : [];
        } catch { wlMap[s.id] = []; }
      }));
      setWaitlists(wlMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  async function handleNotifyWaitlist(sessionId: number) {
    setNotifying(sessionId);
    try {
      const res = await fetch(`/api/trainer/sessions/${sessionId}/notify-waitlist`, { method: "POST" });
      const d = await res.json();
      setNotifySent(d.sent ?? 0);
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
      else if (modal.type === "waitlist") url = `/api/trainer/sessions/${modal.sessionId}/message-waitlist`;
      else url = "/api/trainer/message-followers";
      const body: Record<string, unknown> = { subject, message };
      if (modal.type === "waitlist") body.emails = modal.emails;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
            <h2 className="text-base font-bold">My Sessions</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/trainer/plans">+ Pre-launch event</Link>
              </Button>
              <Button style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/trainer/new-session">+ New session</Link>
              </Button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sessions yet.</p>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Session</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Schedule</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Booked</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Spots left</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Waitlist</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const roster = bookings.filter((b) => b.sessionId === String(s.id));
                    const waitlist = waitlists[s.id] ?? [];
                    const isOpen = expanded === s.id;
                    const booked = s.spotsTotal - s.spotsLeft;
                    const sel = selectedWaitlist[s.id] ?? new Set<number>();
                    const allChecked = waitlist.length > 0 && sel.size === waitlist.length;
                    const selectedEmails = waitlist.filter((w) => sel.has(w.id)).map((w) => w.userEmail);
                    function toggleAll() {
                      setSelectedWaitlist((prev) => ({
                        ...prev,
                        [s.id]: allChecked ? new Set() : new Set(waitlist.map((w) => w.id)),
                      }));
                    }
                    function toggleOne(id: number) {
                      setSelectedWaitlist((prev) => {
                        const next = new Set(prev[s.id] ?? []);
                        next.has(id) ? next.delete(id) : next.add(id);
                        return { ...prev, [s.id]: next };
                      });
                    }
                    return (
                      <>
                        <tr key={s.id}
                          className={`border-t cursor-pointer hover:bg-gray-50 transition-colors ${isOpen ? "bg-blue-50/50" : ""}`}
                          onClick={() => setExpanded(isOpen ? null : s.id)}>
                          <td className="px-4 py-3">
                            <p className="font-semibold">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.sport}{s.city ? ` · ${s.city}` : ""}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {s.dayOfWeek && s.time ? `${s.dayOfWeek}s · ${s.time}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-[#0F3154]">{booked}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold text-xs ${s.spotsLeft === 0 ? "text-red-600" : s.spotsLeft <= 2 ? "text-amber-600" : "text-green-700"}`}>
                              {s.spotsLeft === 0 ? "Full" : s.spotsLeft}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.waitlistEnabled
                              ? <span className="font-semibold text-amber-600">{waitlist.length}</span>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-3">
                              <Link href={`/trainer/sessions/${s.id}/edit`}
                                className="text-xs font-semibold hover:underline"
                                style={{ color: "#0F3154" }}>
                                More details
                              </Link>
                              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr key={`${s.id}-detail`} className="border-t bg-gray-50/80">
                            <td colSpan={6} className="px-4 py-4 space-y-4">

                              {/* Registrations */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registrations ({roster.length})</p>
                                  {roster.length > 0 && (
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); setModal({ type: "session", sessionId: s.id, sessionTitle: s.title }); setSentMsg(""); }}
                                      className="flex items-center gap-1.5 text-xs font-semibold text-[#0F3154] px-3 py-1.5 rounded-lg border border-[#0F3154] hover:bg-[#0F3154] hover:text-white transition-colors">
                                      <Mail className="h-3.5 w-3.5" /> Message all
                                    </button>
                                  )}
                                </div>
                                {roster.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No registrations yet.</p>
                                ) : (
                                  <div className="border rounded-lg overflow-hidden bg-white">
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
                                            <td className="px-3 py-2 text-muted-foreground">{b.athleteName && b.athleteName !== b.userName ? b.athleteName : "—"}</td>
                                            <td className="px-3 py-2 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                                            <td className="px-3 py-2 text-right">
                                              <button type="button"
                                                onClick={(e) => { e.stopPropagation(); setRefundModal({ id: b.id, name: b.userName || "this player", amount: b.amountPaid }); }}
                                                disabled={refunding === b.id}
                                                className="text-xs text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1">
                                                <RotateCcw className="h-3 w-3" />{refunding === b.id ? "…" : "Refund"}
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Waitlist */}
                              {s.waitlistEnabled && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                      Waitlist ({waitlist.length}){sel.size > 0 && <span className="ml-2 normal-case text-[#0F3154]">{sel.size} selected</span>}
                                    </p>
                                    {waitlist.length > 0 && (
                                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button type="button"
                                          disabled={sel.size === 0}
                                          onClick={() => { setModal({ type: "waitlist", sessionId: s.id, sessionTitle: s.title, count: sel.size, emails: selectedEmails }); setSentMsg(""); }}
                                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                          style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                                          <Mail className="h-3.5 w-3.5" />
                                          Custom email{sel.size > 0 ? ` (${sel.size})` : ""}
                                        </button>
                                        <button type="button"
                                          onClick={() => setNotifyModal({ sessionId: s.id, sessionTitle: s.title, count: waitlist.length })}
                                          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                                          style={{ backgroundColor: "#DC373E" }}>
                                          <Mail className="h-3.5 w-3.5" />
                                          Notify — spots open!
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {waitlist.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No waitlist signups yet.</p>
                                  ) : (
                                    <div className="border rounded-lg overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
                                      <table className="w-full text-xs">
                                        <thead className="bg-muted/50">
                                          <tr>
                                            <th className="px-3 py-2 w-8"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded" /></th>
                                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Parent</th>
                                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Child</th>
                                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Age</th>
                                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Phone</th>
                                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Joined</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {waitlist.map((w) => (
                                            <tr key={w.id} className={`border-t cursor-pointer ${sel.has(w.id) ? "bg-blue-50" : "hover:bg-gray-50"}`} onClick={() => toggleOne(w.id)}>
                                              <td className="px-3 py-2"><input type="checkbox" checked={sel.has(w.id)} onChange={() => toggleOne(w.id)} onClick={(e) => e.stopPropagation()} className="rounded" /></td>
                                              <td className="px-3 py-2"><p className="font-medium">{w.userName || "—"}</p><p className="text-muted-foreground">{w.userEmail}</p></td>
                                              <td className="px-3 py-2 font-medium">{w.childName || "—"}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{w.childAge || "—"}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{w.parentPhone || "—"}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}

                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
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
                  : modal.type === "waitlist"
                    ? `Email ${modal.count} selected — ${modal.sessionTitle}`
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

      {/* Notify RSVP list modal */}
      {notifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#e8f0f9" }}>
                <Mail className="h-7 w-7" style={{ color: "#0F3154" }} />
              </div>
              <h2 className="text-lg font-bold">Notify interested players</h2>
              <p className="text-sm text-muted-foreground">
                This will email <strong>{notifyModal.count} {notifyModal.count === 1 ? "person" : "people"}</strong> who expressed interest in <strong>{notifyModal.sessionTitle}</strong> that booking is now open.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setNotifyModal(null)}>Cancel</Button>
              <Button className="flex-1" disabled={notifying === notifyModal.sessionId}
                style={{ backgroundColor: "#DC373E" }}
                onClick={async () => {
                  const { sessionId } = notifyModal;
                  setNotifyModal(null);
                  await handleNotifyWaitlist(sessionId);
                }}>
                {notifying === notifyModal.sessionId ? "Sending…" : "Send emails"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notify sent confirmation */}
      {notifySent !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-lg font-bold">Emails sent!</h2>
            <p className="text-sm text-muted-foreground">
              Notified <strong>{notifySent} {notifySent === 1 ? "person" : "people"}</strong> that booking is now open.
            </p>
            <Button className="w-full" style={{ backgroundColor: "#0F3154" }} onClick={() => setNotifySent(null)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
