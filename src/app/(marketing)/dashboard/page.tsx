"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Plus, Users, Search, Star, MapPin, Pencil,
  CheckCircle, AlertCircle, ExternalLink,
  CalendarDays, Clock, Trash2, DollarSign, Eye,
} from "lucide-react";

interface TrainerProfile {
  id: string; photo: string; bio: string; city: string; state: string;
  sport: string; sports: string[]; specialties: string[]; certifications: string[];
  skillLevels: string[]; yearsExperience: number; hourlyRate: number;
  rating: number; reviewCount: number; isArchived: boolean; isApproved: boolean;
}

interface TrainerSession {
  id: number; title: string; sport: string; sessionType: string;
  city: string; dayOfWeek: string; time: string; duration: number;
  pricePerPlayer: number; spotsTotal: number; spotsLeft: number;
  skillLevel: string; ageRange: string; isActive: boolean; createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [trainerProfile, setTrainerProfile]   = useState<TrainerProfile | null>(null);
  const [sessions, setSessions]               = useState<TrainerSession[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [deleteModal, setDeleteModal]         = useState<number | null>(null);
  const [deleting, setDeleting]               = useState(false);
  const [trainerBookings, setTrainerBookings] = useState<any[]>([]);
  const [archiving, setArchiving] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const meta = (user?.publicMetadata ?? {}) as {
    role?: string; city?: string; sport?: string; level?: string; country?: string;
  };
  const role      = meta.role ?? "player";
  const firstName = user?.firstName ?? "";

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "trainer") {
      Promise.all([
        fetch("/api/trainer/profile").then((r) => r.json()),
        fetch("/api/trainer/sessions").then((r) => r.json()),
        fetch("/api/trainer/bookings").then((r) => r.json()),
        fetch("/api/trainer/stripe/status").then((r) => r.json()),
      ]).then(([profile, sess, bkgs, stripeStatus]) => {
        setTrainerProfile(profile ?? null);
        setSessions(Array.isArray(sess) ? sess : []);
        setTrainerBookings(Array.isArray(bkgs) ? bkgs : []);
        setIsArchived(profile?.isArchived ?? false);
        setStripeConnected(stripeStatus?.connected ?? false);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoaded, role]);

  async function handleConnectStripe() {
    setConnectingStripe(true);
    const res = await fetch("/api/trainer/stripe/connect", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setConnectingStripe(false);
  }

  async function handleArchive(archive: boolean) {
    setArchiving(true);
    const res = await fetch("/api/user/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive }),
    });
    if (res.ok) setIsArchived(archive);
    setArchiving(false);
  }

  async function confirmDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    await fetch(`/api/trainer/sessions/${deleteModal}`, { method: "DELETE" });
    setSessions((s) => s.filter((x) => x.id !== deleteModal));
    setDeleteModal(null);
    setDeleting(false);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const photo = trainerProfile?.photo || user?.imageUrl || "";
  const profileComplete = role === "trainer"
    ? !!(trainerProfile && ((trainerProfile.sports ?? []).length > 0 || trainerProfile.sport))
    : !!(meta.city && meta.sport);

  function formatSessionType(t: string) {
    return t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const isPending = role === "trainer" && trainerProfile && !trainerProfile.isApproved;

  return (
    <div className="min-h-screen bg-[#f4f6f9]">

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-base">Delete this session?</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              ⚠️ Any players who have already booked will be notified and issued a full refund.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#DC373E" }}>
                {deleting ? "Deleting…" : "Yes, delete it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending approval banner */}
      {isPending && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            ⏳ Your trainer profile is pending approval. We review applications within 1–2 business days.
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-8">
        <div className="container max-w-4xl">
          <p className="text-white/60 text-sm mb-4">Welcome back</p>
          <div className="flex items-center gap-4">
            {photo ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                <Image src={photo} alt={firstName} fill className="object-cover" sizes="64px" unoptimized />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white text-2xl font-bold">{firstName?.[0] ?? "?"}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {firstName ? `Hey, ${firstName}` : "Your Dashboard"}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-block bg-white/15 text-white/90 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {role === "trainer" ? "Coach" : "Player"}
                </span>
                {meta.city && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <MapPin className="h-3 w-3" />{meta.city}
                  </span>
                )}
                {role === "trainer" && trainerProfile?.rating != null && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {trainerProfile.rating.toFixed(1)} ({trainerProfile.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">My Profile</h2>
            <div className="flex items-center gap-3">
              {role === "trainer" && (
                <Link href="/trainer/payout"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Payout
                </Link>
              )}
              <Link href={role === "trainer" ? "/trainer/setup" : "/profile"}
                className="flex items-center gap-1.5 text-sm font-medium text-[#0F3154] hover:underline">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>
          </div>

          {role === "trainer" && trainerProfile ? (
            <div className="space-y-3">
              {profileComplete ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Profile complete — you appear in trainer listings</span>
                  <Link href={`/groups/${trainerProfile.id}`} className="ml-auto flex items-center gap-1 text-xs font-medium hover:underline">
                    View public profile <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Complete your profile to appear in trainer listings</span>
                  <Link href="/trainer/setup" className="ml-auto text-xs font-medium hover:underline">Finish setup →</Link>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {trainerProfile.bio && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: trainerProfile.bio.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() }} />
                  </div>
                )}
                {(trainerProfile.sports ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Sports</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(trainerProfile.sports ?? []).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#0F3154]/10 text-[#0F3154] font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(trainerProfile.specialties ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Specialties</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(trainerProfile.specialties ?? []).slice(0, 4).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm">{[trainerProfile.city, trainerProfile.state].filter(Boolean).join(", ") || "—"}</p>
                </div>
                {trainerProfile.hourlyRate > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Private Rate</p>
                    <p className="text-sm">${trainerProfile.hourlyRate}/hr</p>
                  </div>
                )}
              </div>
            </div>
          ) : role === "trainer" && !trainerProfile ? (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="font-semibold mb-1">Coaching profile not set up yet</p>
              <p className="text-sm text-muted-foreground mb-4">Set up your profile so players can find and book you.</p>
              <Button style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/trainer/setup">Set up coaching profile →</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                <p>{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                <p>{meta.city || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sport</p>
                <p>{meta.sport || "—"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trainer: Sessions */}
        {role === "trainer" && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">
                My Sessions
                {sessions.length > 0 && (
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">({sessions.length})</span>
                )}
              </h2>
              <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/trainer/new-session">
                  <Plus className="h-4 w-4 mr-1" /> New session
                </Link>
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎯</div>
                <p className="font-semibold mb-1">No sessions posted yet</p>
                <p className="text-muted-foreground text-sm mb-5">
                  Create your first group session and start filling spots.
                </p>
                <Button style={{ backgroundColor: "#DC373E" }} asChild>
                  <Link href="/trainer/new-session">
                    <Users className="h-4 w-4 mr-2" />
                    Create a training session
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="border rounded-xl p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm leading-snug">{s.title}</p>
                        <span className="shrink-0 text-sm font-bold">${s.pricePerPlayer}/player</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-2">
                        <span>{s.sport} · {formatSessionType(s.sessionType)}</span>
                        {s.dayOfWeek && s.time && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />{s.dayOfWeek} at {s.time}
                          </span>
                        )}
                        {s.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{s.duration} min
                          </span>
                        )}
                        {s.city && <span>{s.city}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold ${s.spotsLeft === 0 ? "text-red-600" : s.spotsLeft <= 2 ? "text-amber-600" : "text-green-700"}`}>
                          {s.spotsLeft === 0 ? "Full" : `${s.spotsLeft} of ${s.spotsTotal} spots open`}
                        </span>
                        {s.skillLevel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s.skillLevel}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link href={`/sessions/${s.id}`}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                        title="View session">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/trainer/sessions/${s.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Edit session">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trainer: Earnings / Bookings */}
        {role === "trainer" && trainerBookings.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold">Earnings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {trainerBookings.filter((b) => !b.trainerPaid).length > 0
                    ? `$${trainerBookings.filter((b) => !b.trainerPaid).reduce((s: number, b: any) => s + b.trainerAmount, 0)} pending payout`
                    : "All paid out"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold" style={{ color: "#0F3154" }}>
                  ${trainerBookings.reduce((s: number, b: any) => s + b.trainerAmount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">total earned</p>
              </div>
            </div>
            <div className="space-y-2">
              {trainerBookings.slice(0, 10).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{b.sessionTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.userName}{b.athleteName && b.athleteName !== b.userName ? ` · ${b.athleteName}` : ""}
                      {b.sessionCount > 1 ? ` · ${b.sessionCount} sessions` : ""}
                      {" · "}{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="font-bold text-sm" style={{ color: "#0F3154" }}>${b.trainerAmount}</span>
                    {b.trainerPaid ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player: Find sessions */}
        {role !== "trainer" && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">My Sessions</h2>
              <Link href="/groups" className="text-sm font-medium text-[#DC373E] hover:underline">Browse all →</Link>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-semibold mb-1">No sessions booked yet</p>
              <p className="text-muted-foreground text-sm mb-5">
                Find a group session near you and reserve your spot.
              </p>
              <Button style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/groups">
                  <Search className="h-4 w-4 mr-2" />
                  Find a group session
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stripe Payouts — trainers only */}
        {role === "trainer" && stripeConnected !== null && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-base font-bold mb-1">Payouts</h2>
            <p className="text-xs text-muted-foreground mb-5">Connect Stripe to receive automatic payouts after each session.</p>

            {stripeConnected ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-green-800">Stripe connected</p>
                  <p className="text-xs text-green-700 mt-0.5">You'll receive 85% of every booking automatically within 2–7 business days.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f4f9] border">
                  <DollarSign className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#0F3154" }} />
                  <div>
                    <p className="font-semibold text-sm">Get paid automatically</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Connect your bank account once — 85% of every booking transfers to you directly after the session.</p>
                  </div>
                </div>
                <button onClick={handleConnectStripe} disabled={connectingStripe}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
                  style={{ backgroundColor: "#0F3154" }}>
                  {connectingStripe ? "Redirecting to Stripe…" : "Connect Stripe Payouts"}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Powered by Stripe · Takes ~2 minutes · Your bank info is never stored by GrupUp
                </p>
              </div>
            )}
          </div>
        )}

        {/* Account */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-base font-bold mb-1">Account</h2>
          <p className="text-xs text-muted-foreground mb-5">Manage your account visibility.</p>

          {isArchived ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-amber-800">Your account is hidden</p>
                  <p className="text-xs text-amber-700 mt-0.5">Your profile and sessions are not visible to anyone. Reactivate to appear in search results.</p>
                </div>
              </div>
              <button onClick={() => handleArchive(false)} disabled={archiving}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:opacity-50"
                style={{ borderColor: "#0F3154", color: "#0F3154" }}>
                {archiving ? "Reactivating…" : "Reactivate my account"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Archiving hides your profile and all sessions from search results. Your data is preserved and you can reactivate at any time.
              </p>
              <button onClick={() => handleArchive(true)} disabled={archiving}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:opacity-50 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                style={{ borderColor: "#e2e8f0", color: "#6b7280" }}>
                {archiving ? "Archiving…" : "Archive my account"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
