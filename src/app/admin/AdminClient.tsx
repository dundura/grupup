"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Trash2, Archive, ArchiveRestore, Search, CheckCircle, XCircle, DollarSign, ExternalLink, LogIn, Eye, EyeOff } from "lucide-react";

interface AdminUser {
  id: string; name: string; email: string; photo: string; role: string;
  joinedAt: string; sessionCount: number; bookingCount: number;
  archived: boolean; trainerId?: string | null; isApproved?: boolean;
}

interface AdminSession {
  id: number; title: string; trainerName: string; trainerClerkId: string;
  sessionType: string; pricePerPlayer: number; spotsTotal: number; spotsLeft: number;
  bookingCount: number; isActive: boolean; createdAt: string; city: string; sport: string;
}

interface AdminBooking {
  id: number; createdAt: string; userName: string; userEmail: string;
  athleteName: string; sessionTitle: string; bookingType: string;
  sessionCount: number; amountPaid: number; trainerAmount: number;
  trainerName: string; trainerPaid: boolean; trainerPaidAt: string | null;
}

export default function AdminClient({
  trainers, players, bookings: initialBookings, sessions,
}: {
  trainers: AdminUser[]; players: AdminUser[]; bookings: AdminBooking[]; sessions: AdminSession[];
}) {
  const { signIn } = useSignIn();
  const [tab, setTab] = useState<"trainers" | "players" | "sessions" | "payouts">("trainers");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState({ trainers, players });
  const [bookings, setBookings] = useState(initialBookings);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [payoutFilter, setPayoutFilter] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [impersonateModal, setImpersonateModal] = useState<{ userId: string; name: string } | null>(null);
  const [superPwd, setSuperPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  const list = (tab === "trainers" ? users.trainers : users.players)
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const filteredBookings = bookings.filter((b) =>
    payoutFilter === "all" ? true : payoutFilter === "paid" ? b.trainerPaid : !b.trainerPaid
  );

  const unpaidTotal = bookings.filter((b) => !b.trainerPaid).reduce((sum, b) => sum + b.trainerAmount, 0);

  async function handleApprove(trainerId: string, userId: string, approved: boolean) {
    setLoading(userId);
    await fetch(`/api/admin/trainers/${trainerId}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    setUsers((prev) => ({ ...prev, trainers: prev.trainers.map((u) => u.id === userId ? { ...u, isApproved: approved } : u) }));
    setLoading(null);
  }

  async function handleArchive(userId: string, archived: boolean) {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
    setUsers((prev) => ({ trainers: prev.trainers.map((u) => u.id === userId ? { ...u, archived } : u), players: prev.players.map((u) => u.id === userId ? { ...u, archived } : u) }));
    setLoading(null);
  }

  async function handleDelete(userId: string) {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => ({ trainers: prev.trainers.filter((u) => u.id !== userId), players: prev.players.filter((u) => u.id !== userId) }));
    setConfirming(null);
    setLoading(null);
  }

  async function handleMarkPaid(bookingId: number, paid: boolean) {
    setLoading(String(bookingId));
    await fetch(`/api/admin/bookings/${bookingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trainerPaid: paid }) });
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, trainerPaid: paid, trainerPaidAt: paid ? new Date().toISOString() : null } : b));
    setLoading(null);
  }

  async function handleApprovePlayer(userId: string, approved: boolean) {
    setLoading(userId);
    await fetch(`/api/admin/players/${userId}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    setUsers((prev) => ({ ...prev, players: prev.players.map((u) => u.id === userId ? { ...u, isApproved: approved } : u) }));
    setLoading(null);
  }

  async function handleImpersonate() {
    if (!impersonateModal || !signIn) return;
    setImpersonating(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: impersonateModal.userId, superPassword: superPwd }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed"); setImpersonating(false); return; }
      await signIn!.create({ strategy: "ticket", ticket: data.token });
      window.location.href = "/dashboard";
    } catch (e: any) {
      alert(e.message || "Failed");
      setImpersonating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Admin</h1>
          <p className="text-muted-foreground text-sm">{users.trainers.length} trainers · {users.players.length} players · {bookings.length} bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {(["trainers", "players", "sessions", "payouts"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors"
                style={tab === t ? { backgroundColor: "#0F3154", color: "white" } : { backgroundColor: "white", color: "#0F3154", border: "1px solid #0F3154" }}>
                {t === "payouts"
                  ? `Payouts${unpaidTotal > 0 ? ` ($${unpaidTotal} owed)` : ""}`
                  : t === "sessions"
                  ? `Sessions (${sessions.length})`
                  : `${t} (${t === "trainers" ? users.trainers.length : users.players.length})`}
              </button>
            ))}
          </div>
          {tab !== "payouts" && tab !== "sessions" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
                className="pl-9 pr-4 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring w-64" />
            </div>
          )}
          {tab === "payouts" && (
            <div className="flex gap-2">
              {(["unpaid", "paid", "all"] as const).map((f) => (
                <button key={f} onClick={() => setPayoutFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                  style={payoutFilter === f ? { backgroundColor: "#0F3154", color: "white" } : { backgroundColor: "white", border: "1px solid #e2e8f0", color: "#475569" }}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Users table */}
        {tab !== "payouts" && tab !== "sessions" && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {list.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No {tab} found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-[#f7f8fa]">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="text-center px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                      {tab === "trainers" ? "Sessions" : "Bookings"}
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((u) => (
                    <tr key={u.id} className={u.archived ? "opacity-50" : ""}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-muted">
                            {u.photo ? (
                              <Image src={u.photo} alt={u.name} fill className="object-cover" sizes="32px" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                                {u.name?.[0] ?? "?"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{u.name}</p>
                              {tab === "trainers" && u.trainerId && !u.isApproved && (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                              )}
                              {tab === "trainers" && u.trainerId && u.isApproved && (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>
                              )}
                              {tab === "players" && !u.isApproved && (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                              )}
                              {tab === "players" && u.isApproved && (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>
                              )}
                              {u.archived && <span className="text-xs text-muted-foreground">(archived)</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                        {new Date(u.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                        <span className="font-semibold">{tab === "trainers" ? u.sessionCount : u.bookingCount}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {tab === "trainers" && u.trainerId && (
                            <Link href={`/groups/${u.trainerId}`} target="_blank"
                              title="View profile"
                              className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-[#f0f4f9] transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" style={{ color: "#0F3154" }} />
                            </Link>
                          )}
                          {tab === "trainers" && u.trainerId && (
                            u.isApproved ? (
                              <button onClick={() => handleApprove(u.trainerId!, u.id, false)} disabled={loading === u.id} title="Revoke approval"
                                className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors">
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            ) : (
                              <button onClick={() => handleApprove(u.trainerId!, u.id, true)} disabled={loading === u.id} title="Approve trainer"
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 transition-colors">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              </button>
                            )
                          )}
                          {tab === "players" && (
                            u.isApproved ? (
                              <button onClick={() => handleApprovePlayer(u.id, false)} disabled={loading === u.id} title="Revoke approval"
                                className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors">
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            ) : (
                              <button onClick={() => handleApprovePlayer(u.id, true)} disabled={loading === u.id} title="Approve player"
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 transition-colors">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              </button>
                            )
                          )}
                          <button onClick={() => { setImpersonateModal({ userId: u.id, name: u.name }); setSuperPwd(""); setShowPwd(false); }}
                            title="Login as this user"
                            className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-[#f0f4f9] transition-colors">
                            <LogIn className="h-3.5 w-3.5" style={{ color: "#0F3154" }} />
                          </button>
                          <button onClick={() => handleArchive(u.id, !u.archived)} disabled={loading === u.id} title={u.archived ? "Unarchive" : "Archive"}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-amber-50 hover:border-amber-300 transition-colors">
                            {u.archived ? <ArchiveRestore className="h-3.5 w-3.5 text-amber-500" /> : <Archive className="h-3.5 w-3.5 text-amber-500" />}
                          </button>
                          {confirming === u.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(u.id)} disabled={loading === u.id}
                                className="text-xs font-semibold text-white px-2 py-1 rounded-lg" style={{ backgroundColor: "#DC373E" }}>
                                {loading === u.id ? "…" : "Confirm"}
                              </button>
                              <button onClick={() => setConfirming(null)} className="text-xs text-muted-foreground px-2 py-1 rounded-lg border">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirming(u.id)} title="Delete user"
                              className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Sessions tab */}
        {tab === "sessions" && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No sessions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-[#f7f8fa]">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Session</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Trainer</th>
                    <th className="text-center px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Bookings</th>
                    <th className="text-center px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Spots</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="font-semibold leading-snug">{s.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {s.sport && <span className="text-xs text-muted-foreground">{s.sport}</span>}
                              {s.city && <span className="text-xs text-muted-foreground">· {s.city}</span>}
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {s.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-xs text-muted-foreground">${s.pricePerPlayer}/player</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="font-medium">{s.trainerName}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`font-bold text-base ${s.bookingCount > 0 ? "" : "text-muted-foreground"}`}>
                          {s.bookingCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center hidden sm:table-cell text-muted-foreground text-xs">
                        {s.spotsLeft}/{s.spotsTotal} left
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/sessions/${s.id}`} target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-[#f0f4f9] transition-colors"
                          style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                          <ExternalLink className="h-3 w-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Payouts tab */}
        {tab === "payouts" && (
          <div className="space-y-4">
            {unpaidTotal > 0 && payoutFilter !== "paid" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Outstanding trainer payouts</p>
                  <p className="text-xs text-amber-700 mt-0.5">{bookings.filter((b) => !b.trainerPaid).length} unpaid booking{bookings.filter((b) => !b.trainerPaid).length !== 1 ? "s" : ""}</p>
                </div>
                <p className="text-2xl font-extrabold text-amber-800">${unpaidTotal}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {filteredBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">No {payoutFilter} bookings.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-[#f7f8fa]">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Booking</th>
                      <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Trainer</th>
                      <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Player Paid</th>
                      <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Trainer Owes</th>
                      <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className={b.trainerPaid ? "opacity-60" : ""}>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold leading-snug">{b.sessionTitle}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {b.userName}{b.athleteName && b.athleteName !== b.userName ? ` · athlete: ${b.athleteName}` : ""}
                            {b.sessionCount > 1 ? ` · ${b.sessionCount} sessions` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}
                            <span className="capitalize">{b.bookingType}</span>
                          </p>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <p className="font-medium">{b.trainerName}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold">${b.amountPaid}</td>
                        <td className="px-5 py-3.5 text-right font-bold" style={{ color: "#0F3154" }}>${b.trainerAmount}</td>
                        <td className="px-5 py-3.5 text-right">
                          {b.trainerPaid ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="h-3 w-3" /> Paid out
                              </span>
                              {b.trainerPaidAt && (
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(b.trainerPaidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                              <button onClick={() => handleMarkPaid(b.id, false)} disabled={loading === String(b.id)}
                                className="text-[10px] text-muted-foreground underline hover:text-red-600 transition-colors">
                                undo
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => handleMarkPaid(b.id, true)} disabled={loading === String(b.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                              style={{ backgroundColor: "#0F3154" }}>
                              <DollarSign className="h-3 w-3" />
                              {loading === String(b.id) ? "…" : "Mark Paid"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Impersonate modal */}
      {impersonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-1">Login as {impersonateModal.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter the admin super password to sign in as this user.</p>
            <div className="relative mb-4">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Super password"
                value={superPwd}
                onChange={(e) => setSuperPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && superPwd && handleImpersonate()}
                className="w-full px-3 py-2 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setImpersonateModal(null)}
                className="flex-1 py-2 rounded-lg border text-sm font-semibold text-muted-foreground hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleImpersonate} disabled={!superPwd || impersonating}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#0F3154" }}>
                {impersonating ? "Signing in…" : "Login as them"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
