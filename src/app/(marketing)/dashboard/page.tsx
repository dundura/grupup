"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Plus, Users, Search, Star, MapPin, Pencil,
  CheckCircle, AlertCircle, ExternalLink,
  CalendarDays, Clock, Trash2, DollarSign, Eye, ClipboardList, X, Ban, ChevronDown, ChevronUp,
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
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [followRequests, setFollowRequests] = useState<{ followerClerkId: string; name: string; photo: string }[]>([]);
  const [trainerFollowRequests, setTrainerFollowRequests] = useState<{ id: number; followerClerkId: string; name: string; photo: string }[]>([]);
  const [followers, setFollowers] = useState<{ followerClerkId: string; name: string; photo: string }[]>([]);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [pendingQuestionnaires, setPendingQuestionnaires] = useState<Array<{
    bookingId: number; sessionTitle: string;
    questionnaire: { title: string; questions: Array<{ id: string; type: string; label: string; required: boolean; options?: string[] }> };
  }>>([]);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<typeof pendingQuestionnaires[0] | null>(null);
  const [qResponses, setQResponses] = useState<Record<string, string>>({});
  const [qSubmitting, setQSubmitting] = useState(false);

  const meta = (user?.publicMetadata ?? {}) as {
    role?: string; city?: string; sport?: string; level?: string; country?: string;
  };
  const role      = meta.role ?? "player";
  const firstName = user?.firstName ?? "";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const isAdmin   = ["neil@anytime-soccer.com", "nmciq2@gmail.com"].includes(userEmail);

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "trainer") {
      Promise.all([
        fetch("/api/trainer/profile").then((r) => r.json()),
        fetch("/api/trainer/sessions").then((r) => r.json()),
        fetch("/api/trainer/bookings").then((r) => r.json()),
        fetch("/api/trainer/stripe/status").then((r) => r.json()),
        fetch("/api/trainer/follow-requests").then((r) => r.json()),
      ]).then(([profile, sess, bkgs, stripeStatus, trainerReqs]) => {
        setTrainerProfile(profile ?? null);
        setSessions(Array.isArray(sess) ? sess : []);
        setTrainerBookings(Array.isArray(bkgs) ? bkgs : []);
        setTrainerFollowRequests(Array.isArray(trainerReqs) ? trainerReqs : []);
        setIsArchived(profile?.isArchived ?? false);
        setStripeConnected(stripeStatus?.connected ?? false);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      // Player: load follow requests + pending questionnaires
      Promise.all([
        fetch("/api/player/follows").then((r) => r.json()).catch(() => ({})),
        fetch("/api/player/questionnaires").then((r) => r.json()).catch(() => ({})),
      ]).then(([followData, qData]) => {
        if (followData.pending) setFollowRequests(followData.pending);
        if (followData.approved) setFollowers(followData.approved);
        if (qData.pending) setPendingQuestionnaires(qData.pending);
        setLoading(false);
      });
    }
  }, [isLoaded, role]);

  async function handleFollowAction(followerClerkId: string, action: "approve" | "reject" | "remove") {
    setFollowLoading(followerClerkId);
    await fetch("/api/player/follow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerClerkId, action: action === "approve" ? "approve" : "reject" }),
    });
    if (action === "approve") {
      const req = followRequests.find((r) => r.followerClerkId === followerClerkId);
      if (req) setFollowers((f) => [...f, req]);
      setFollowRequests((r) => r.filter((x) => x.followerClerkId !== followerClerkId));
    } else {
      setFollowRequests((r) => r.filter((x) => x.followerClerkId !== followerClerkId));
      setFollowers((f) => f.filter((x) => x.followerClerkId !== followerClerkId));
    }
    setFollowLoading(null);
  }

  async function handleBlock(clerkId: string) {
    setFollowLoading(clerkId);
    await fetch("/api/user/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedClerkId: clerkId, action: "block" }),
    });
    // Also remove any follow relationship
    await fetch("/api/player/follow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerClerkId: clerkId, action: "reject" }),
    });
    setFollowRequests((r) => r.filter((x) => x.followerClerkId !== clerkId));
    setFollowers((f) => f.filter((x) => x.followerClerkId !== clerkId));
    setFollowLoading(null);
  }

  async function handleQSubmit() {
    if (!activeQuestionnaire) return;
    setQSubmitting(true);
    await fetch(`/api/bookings/${activeQuestionnaire.bookingId}/questionnaire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: qResponses }),
    });
    setPendingQuestionnaires((q) => q.filter((x) => x.bookingId !== activeQuestionnaire.bookingId));
    setActiveQuestionnaire(null);
    setQResponses({});
    setQSubmitting(false);
  }

  async function handleConnectStripe() {
    setConnectingStripe(true);
    setStripeError("");
    try {
      const res = await fetch("/api/trainer/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const msg = data.error ?? "Something went wrong. Please try again.";
        setStripeError(msg);
        alert("Stripe error: " + msg);
        setConnectingStripe(false);
      }
    } catch {
      setStripeError("Network error. Please try again.");
      setConnectingStripe(false);
    }
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

      {/* Questionnaire modal */}
      {activeQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="font-bold text-base">{activeQuestionnaire.questionnaire.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{activeQuestionnaire.sessionTitle}</p>
              </div>
              <button onClick={() => { setActiveQuestionnaire(null); setQResponses({}); }}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {activeQuestionnaire.questionnaire.questions.map((q) => (
                <div key={q.id}>
                  <label className="text-sm font-semibold block mb-2">
                    {q.label}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === "text" ? (
                    <textarea
                      value={qResponses[q.id] ?? ""}
                      onChange={(e) => setQResponses((r) => ({ ...r, [q.id]: e.target.value }))}
                      rows={3} placeholder="Your answer…"
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(q.options ?? []).filter(Boolean).map((opt) => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="radio" name={q.id} value={opt}
                            checked={qResponses[q.id] === opt}
                            onChange={() => setQResponses((r) => ({ ...r, [q.id]: opt }))}
                            className="accent-[#0F3154]" />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button onClick={handleQSubmit} disabled={qSubmitting}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: "#DC373E" }}>
                {qSubmitting ? "Submitting…" : "Submit questionnaire"}
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">Welcome back</p>
            {isAdmin && (
              <Link href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Panel
              </Link>
            )}
          </div>
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
            <h2 className="text-base font-bold">My Profiles</h2>
            <div className="flex items-center gap-3">
              {role === "trainer" && (
                <Link href="/trainer/payout"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Payout
                </Link>
              )}
              <Link href="/onboarding"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-[#f0f4f9]"
                style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                <Plus className="h-3.5 w-3.5" /> Add Profile
              </Link>
              {role === "trainer" && (
                <Link href="/trainer/manage"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#0F3154] hover:underline">
                  <ClipboardList className="h-3.5 w-3.5" /> Manage
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

        {/* Player: Pending Questionnaires */}
        {role !== "trainer" && pendingQuestionnaires.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-5 w-5" style={{ color: "#DC373E" }} />
              <h2 className="text-base font-bold">Action Required</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>
                {pendingQuestionnaires.length}
              </span>
            </div>
            {pendingQuestionnaires.map((q) => (
              <div key={q.bookingId} className="flex items-center justify-between gap-3 border rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{q.questionnaire.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.sessionTitle}</p>
                </div>
                <button onClick={() => { setActiveQuestionnaire(q); setQResponses({}); }}
                  className="shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#DC373E" }}>
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Player: Follow Requests & Followers */}
        {role !== "trainer" && (followRequests.length > 0 || followers.length > 0) && (
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            {followRequests.length > 0 && (
              <div>
                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                  Follow Requests
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>
                    {followRequests.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {followRequests.map((r) => (
                    <div key={r.followerClerkId} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                        {r.photo ? (
                          <Image src={r.photo} alt={r.name} fill className="object-cover" sizes="40px" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                            {r.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="flex-1 font-semibold text-sm">{r.name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleFollowAction(r.followerClerkId, "approve")}
                          disabled={followLoading === r.followerClerkId}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity"
                          style={{ backgroundColor: "#0F3154" }}>
                          Approve
                        </button>
                        <button onClick={() => handleFollowAction(r.followerClerkId, "reject")}
                          disabled={followLoading === r.followerClerkId}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-muted-foreground hover:bg-gray-50 transition-colors">
                          Deny
                        </button>
                        <button onClick={() => handleBlock(r.followerClerkId)}
                          disabled={followLoading === r.followerClerkId}
                          title="Block user"
                          className="p-1.5 rounded-lg border text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {followers.length > 0 && (
              <div className={followRequests.length > 0 ? "border-t pt-5" : ""}>
                <h2 className="text-base font-bold mb-3">Followers ({followers.length})</h2>
                <div className="space-y-3">
                  {followers.map((f) => (
                    <div key={f.followerClerkId} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                        {f.photo ? (
                          <Image src={f.photo} alt={f.name} fill className="object-cover" sizes="40px" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                            {f.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="flex-1 font-semibold text-sm">{f.name}</p>
                      <button onClick={() => handleFollowAction(f.followerClerkId, "remove")}
                        disabled={followLoading === f.followerClerkId}
                        title="Remove follower"
                        className="p-1.5 rounded-lg border text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleBlock(f.followerClerkId)}
                        disabled={followLoading === f.followerClerkId}
                        title="Block user"
                        className="p-1.5 rounded-lg border text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                      {/* Registrations roster toggle */}
                      {(() => {
                        const roster = trainerBookings.filter((b) => b.sessionId === String(s.id));
                        if (roster.length === 0) return (
                          <p className="text-xs text-muted-foreground mt-1.5">No registrations yet</p>
                        );
                        const isOpen = expandedSession === s.id;
                        return (
                          <div className="mt-1.5">
                            <button type="button"
                              onClick={() => setExpandedSession(isOpen ? null : s.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#0F3154] hover:underline">
                              {roster.length} registered
                              {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            {isOpen && (
                              <div className="mt-2 border rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Player</th>
                                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Athlete</th>
                                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Booked</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {roster.map((b: any) => (
                                      <tr key={b.id} className="border-t">
                                        <td className="px-3 py-2 font-medium">{b.userName || "—"}</td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                          {b.athleteName && b.athleteName !== b.userName ? b.athleteName : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                          {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })()}
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

        {/* Trainer: Follow Requests */}
        {role === "trainer" && trainerFollowRequests.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              Follow Requests
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{trainerFollowRequests.length}</span>
            </h2>
            <div className="space-y-3">
              {trainerFollowRequests.map((req) => (
                <div key={req.followerClerkId} className="flex items-center gap-3">
                  {req.photo ? (
                    <Image src={req.photo} alt={req.name} width={36} height={36} className="rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                      {req.name[0] ?? "?"}
                    </div>
                  )}
                  <p className="text-sm font-medium flex-1 min-w-0 truncate">{req.name}</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      disabled={followLoading === req.followerClerkId}
                      onClick={async () => {
                        setFollowLoading(req.followerClerkId);
                        await fetch("/api/trainer/follow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followId: req.id, action: "approved" }) });
                        setTrainerFollowRequests((r) => r.filter((x) => x.followerClerkId !== req.followerClerkId));
                        setFollowLoading(null);
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: "#0F3154" }}>
                      Approve
                    </button>
                    <button
                      disabled={followLoading === req.followerClerkId}
                      onClick={async () => {
                        setFollowLoading(req.followerClerkId);
                        await fetch("/api/trainer/follow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followId: req.id, action: "denied" }) });
                        setTrainerFollowRequests((r) => r.filter((x) => x.followerClerkId !== req.followerClerkId));
                        setFollowLoading(null);
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                {stripeError && (
                  <p className="text-xs text-red-600 text-center">{stripeError}</p>
                )}
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
