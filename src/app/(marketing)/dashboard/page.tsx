"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Plus, Users, Search, Star, MapPin, Pencil,
  CheckCircle, AlertCircle, ExternalLink,
  CalendarDays, Clock, Trash2, DollarSign, Eye, ClipboardList, X, Ban, ChevronDown, ChevronUp, ChevronRight,
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
  const [trainingRequests, setTrainingRequests] = useState<Array<{
    id: number; playerName: string; playerEmail: string; sport?: string; level?: string;
    city?: string; preferredDate?: string; sessions?: string; budget?: string; message?: string; createdAt: string;
  }>>([]);
  const [followers, setFollowers] = useState<{ followerClerkId: string; name: string; photo: string }[]>([]);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [playerBookings, setPlayerBookings] = useState<Array<{
    id: number; sessionTitle: string; trainerName: string;
    dayOfWeek: string; time: string; city: string; venue: string;
    athleteName: string; amountPaid: number; sessionCount: number;
    bookingType: string; status: string; createdAt: string;
  }>>([]);
  const [playerRequests, setPlayerRequests] = useState<Array<{
    id: number; sport?: string; level?: string; city?: string; budget?: string;
    trainingType?: string; status: string; sendCount?: number; createdAt: string;
  }>>([]);
  const [playerProfiles, setPlayerProfiles] = useState<Array<{
    id: number; name: string; birthYear?: number; sport?: string; skillLevel?: string; notes?: string; isDefault?: boolean; focusAreas?: string[];
  }>>([]);
  const FOCUS_AREAS = ["Ball Skills","Finishing","Defending","1v1","Passing","Shooting","Speed & Agility","Dribbling","Heading","Goalkeeping","Game Sense","Set Pieces"];
  const [profileModal, setProfileModal] = useState<{ id?: number; name: string; birthYear: string; sport: string; skillLevel: string; notes: string; photo: string; city: string; bio: string; isPublic: boolean; focusAreas: string[] } | null>(null);
  const [activePlayerProfileId, setActivePlayerProfileId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activePlayerProfileId");
      return stored ? parseInt(stored) : null;
    }
    return null;
  });

  function switchProfile(id: number | null) {
    setActivePlayerProfileId(id);
    if (typeof window !== "undefined") {
      if (id === null) localStorage.removeItem("activePlayerProfileId");
      else localStorage.setItem("activePlayerProfileId", String(id));
    }
  }
  const [savingProfile, setSavingProfile] = useState(false);
  const [reminding, setReminding] = useState<number | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);
  const [cancelConfirmModal, setCancelConfirmModal] = useState<{ id: number; title: string; amount: number } | null>(null);
  const [lateContactModal, setLateContactModal] = useState<{ title: string; amount: number } | null>(null);
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
        fetch("/api/training-requests").then((r) => r.json()).catch(() => []),
        fetch("/api/player/profiles").then((r) => r.json()).catch(() => []),
      ]).then(([profile, sess, bkgs, stripeStatus, trainerReqs, tRequests, profiles]) => {
        setTrainerProfile(profile ?? null);
        setSessions(Array.isArray(sess) ? sess : []);
        setTrainerBookings(Array.isArray(bkgs) ? bkgs : []);
        setTrainerFollowRequests(Array.isArray(trainerReqs) ? trainerReqs : []);
        if (Array.isArray(tRequests)) setTrainingRequests(tRequests);
        if (Array.isArray(profiles)) setPlayerProfiles(profiles);
        setIsArchived(profile?.isArchived ?? false);
        setStripeConnected(stripeStatus?.connected ?? false);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      // Player: load follow requests, questionnaires, bookings, and check for trainer profile
      Promise.all([
        fetch("/api/player/follows").then((r) => r.json()).catch(() => ({})),
        fetch("/api/player/questionnaires").then((r) => r.json()).catch(() => ({})),
        fetch("/api/player/bookings").then((r) => r.json()).catch(() => []),
        fetch("/api/player/requests").then((r) => r.json()).catch(() => []),
        fetch("/api/player/profiles").then((r) => r.json()).catch(() => []),
        fetch("/api/trainer/profile").then((r) => r.json()).catch(() => null),
        fetch("/api/trainer/sessions").then((r) => r.json()).catch(() => []),
      ]).then(([followData, qData, bkgs, reqs, profiles, trainerProf, sess]) => {
        if (followData.pending) setFollowRequests(followData.pending);
        if (followData.approved) setFollowers(followData.approved);
        if (qData.pending) setPendingQuestionnaires(qData.pending);
        if (Array.isArray(bkgs)) setPlayerBookings(bkgs);
        if (Array.isArray(reqs)) setPlayerRequests(reqs);
        if (Array.isArray(profiles)) setPlayerProfiles(profiles);
        if (trainerProf?.id) setTrainerProfile(trainerProf);
        setSessions(Array.isArray(sess) ? sess : []);
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

  async function saveProfile() {
    if (!profileModal || !profileModal.name.trim()) return;
    setSavingProfile(true);
    try {
      const isEdit = !!profileModal.id;
      const url = isEdit ? `/api/player/profiles/${profileModal.id}` : "/api/player/profiles";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileModal.name,
          birthYear: profileModal.birthYear || null,
          sport: profileModal.sport || null,
          skillLevel: profileModal.skillLevel || null,
          notes: profileModal.notes || null,
          photo: profileModal.photo || null,
          city: profileModal.city || null,
          bio: profileModal.bio || null,
          isPublic: profileModal.isPublic,
          instagram: (profileModal as any).instagram || null,
          tiktok: (profileModal as any).tiktok || null,
          snapchat: (profileModal as any).snapchat || null,
          focusAreas: profileModal.focusAreas ?? [],
        }),
      });
      const saved = await res.json();
      setPlayerProfiles((prev) =>
        isEdit ? prev.map((p) => p.id === saved.id ? saved : p) : [...prev, saved]
      );
      setProfileModal(null);
    } finally { setSavingProfile(false); }
  }

  async function deleteProfile(id: number) {
    await fetch(`/api/player/profiles/${id}`, { method: "DELETE" });
    setPlayerProfiles((prev) => prev.filter((p) => p.id !== id));
  }

  async function setDefaultProfile(id: number) {
    const res = await fetch(`/api/player/profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true, name: playerProfiles.find((p) => p.id === id)?.name }),
    });
    const updated = await res.json();
    setPlayerProfiles((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
  }

  function handleCancelBooking(bookingId: number, createdAt: string, title: string, amount: number) {
    const bookedAt = new Date(createdAt).getTime();
    const withinWindow = Date.now() - bookedAt < 24 * 60 * 60 * 1000;
    if (!withinWindow) { setLateContactModal({ title, amount }); return; }
    setCancelConfirmModal({ id: bookingId, title, amount });
  }

  async function confirmCancel() {
    if (!cancelConfirmModal) return;
    setCancellingBooking(cancelConfirmModal.id);
    setCancelConfirmModal(null);
    try {
      const res = await fetch(`/api/player/bookings/${cancelConfirmModal.id}/cancel`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        setPlayerBookings((prev) => prev.map((b) => b.id === cancelConfirmModal.id ? { ...b, status: "refunded" } : b));
      } else {
        alert(d.error ?? "Cancellation failed. Please contact support.");
      }
    } finally {
      setCancellingBooking(null);
    }
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

  const activeKid = activePlayerProfileId !== null
    ? playerProfiles.find((p) => p.id === activePlayerProfileId) ?? null
    : null;

  // isTrainerMode is driven by trainerProfile existence + no kid active — not by Clerk role
  const isTrainerMode = !activeKid && !!trainerProfile;

  const photo = activeKid
    ? ((activeKid as any).photo || "")
    : (trainerProfile?.photo || user?.imageUrl || "");
  const displayName = activeKid ? activeKid.name : firstName;
  const profileComplete = isTrainerMode
    ? !!(trainerProfile && ((trainerProfile.sports ?? []).length > 0 || trainerProfile.sport))
    : !!(meta.city && meta.sport);

  function formatSessionType(t: string) {
    return t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function nextClassDate(dayOfWeek: string): string {
    if (!dayOfWeek) return "";
    const days: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const target = days[dayOfWeek.toLowerCase()];
    if (target === undefined) return "";
    const now = new Date();
    const diff = (target - now.getDay() + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + diff);
    return next.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  const isPending = isTrainerMode && trainerProfile && !trainerProfile.isApproved;

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

      {/* Cancel confirmation modal */}
      {cancelConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-base">Cancel this booking?</p>
                <p className="text-sm text-muted-foreground">{cancelConfirmModal.title}</p>
              </div>
            </div>
            <div className="rounded-xl bg-[#f0f9f4] border border-green-200 px-4 py-3">
              <p className="text-sm text-green-800 font-medium">✓ Full refund of ${cancelConfirmModal.amount}</p>
              <p className="text-xs text-green-700 mt-0.5">Returns to your original payment method in 5–10 business days.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                Keep booking
              </button>
              <button onClick={confirmCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#DC373E" }}>
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late cancellation contact modal */}
      {lateContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Request Cancellation</h3>
              <button onClick={() => setLateContactModal(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground">
              The 24-hour free cancellation window has passed for <strong>{lateContactModal.title}</strong>.
              Email us and we'll review your request.
            </p>
            <a
              href={`mailto:neil@anytime-soccer.com?subject=Cancellation Request — ${encodeURIComponent(lateContactModal.title)}&body=Hi, I'd like to request a cancellation for my booking of ${encodeURIComponent(lateContactModal.title)} ($${lateContactModal.amount}). Please let me know if a refund is possible.`}
              className="flex items-center justify-center w-full py-3 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#0F3154" }}
              onClick={() => setLateContactModal(null)}>
              Email Support
            </a>
            <button onClick={() => setLateContactModal(null)}
              className="w-full py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
              Never mind
            </button>
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
                {activeKid ? activeKid.name : (firstName ? `Hey, ${firstName}` : "Your Dashboard")}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-block bg-white/15 text-white/90 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {activeKid ? "Player" : isTrainerMode ? "Coach" : "Player"}
                </span>
                {activeKid ? (
                  <>
                    {(activeKid as any).city && (
                      <span className="flex items-center gap-1 text-white/60 text-xs">
                        <MapPin className="h-3 w-3" />{(activeKid as any).city}
                      </span>
                    )}
                    {activeKid.sport && (
                      <span className="text-white/60 text-xs">{activeKid.sport}</span>
                    )}
                  </>
                ) : (
                  meta.city && (
                    <span className="flex items-center gap-1 text-white/60 text-xs">
                      <MapPin className="h-3 w-3" />{meta.city}
                    </span>
                  )
                )}
                {isTrainerMode && trainerProfile?.rating != null && (
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


      {/* Trainer quick-nav */}
      {isTrainerMode && (
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container max-w-4xl flex gap-1 overflow-x-auto py-2 px-4 scrollbar-hide">
            {[
              { label: "Sessions", href: "#sessions" },
              { label: "My Clients", href: "/clients" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-[#0F3154]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="container max-w-4xl py-8 space-y-6">

        {/* ── Profile picker ── */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Profiles</h2>
            <Link href="/profile" className="text-xs font-semibold hover:underline" style={{ color: "#0F3154" }}>
              Edit Profile →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

            {/* Trainer profile */}
            {trainerProfile && (
              <button onClick={() => switchProfile(null)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={activeKid === null
                  ? { borderColor: "#0F3154", backgroundColor: "#EFF6FF" }
                  : { borderColor: "#e5e7eb", backgroundColor: "white" }}>
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#0F3154] shrink-0">
                  {trainerProfile.photo
                    ? <img src={trainerProfile.photo} alt={firstName} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xl font-bold text-white">{firstName?.[0]}</span>}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm truncate max-w-[100px]">{firstName}</p>
                  <p className="text-xs text-muted-foreground">Trainer</p>
                </div>
                {activeKid === null && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#0F3154" }}>Active</span>}
              </button>
            )}

            {/* Player profiles */}
            {playerProfiles.map((p) => (
              <button key={p.id} onClick={() => switchProfile(p.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={activeKid?.id === p.id
                  ? { borderColor: "#DC373E", backgroundColor: "#fff8f8" }
                  : { borderColor: "#e5e7eb", backgroundColor: "white" }}>
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0"
                  style={{ backgroundColor: "#DC373E" }}>
                  {(p as any).photo
                    ? <img src={(p as any).photo} alt={p.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xl font-bold text-white">{p.name[0]}</span>}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm truncate max-w-[100px]">{p.name.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">{p.sport || "Player"}</p>
                </div>
                {activeKid?.id === p.id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>Active</span>}
              </button>
            ))}

            {/* Add player profile — max 5 */}
            {playerProfiles.length < 5 && (
              <Link href="/onboarding"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400">+</div>
                <p className="text-xs font-semibold text-muted-foreground">Add Profile</p>
              </Link>
            )}
          </div>
        </div>

        {/* ── Active kid profile card ── */}
        {activeKid && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Profile</h2>
              <div className="flex items-center gap-3">
                <Link href={`/connect/player/${activeKid.id}`}
                  className="text-xs font-semibold text-[#0F3154] hover:underline">
                  View public profile →
                </Link>
                <button
                  onClick={() => setProfileModal({ id: activeKid.id, name: activeKid.name, birthYear: activeKid.birthYear ? String(activeKid.birthYear) : "", sport: activeKid.sport ?? "", skillLevel: activeKid.skillLevel ?? "", notes: activeKid.notes ?? "", photo: (activeKid as any).photo ?? "", city: (activeKid as any).city ?? "", bio: (activeKid as any).bio ?? "", isPublic: (activeKid as any).isPublic !== false, focusAreas: (activeKid as any).focusAreas ?? [] })}
                  className="text-xs font-medium text-[#0F3154] hover:underline">
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(activeKid as any).photo ? (
                <img src={(activeKid as any).photo} alt={activeKid.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0" style={{ backgroundColor: "#DC373E" }}>
                  {activeKid.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-lg">{activeKid.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[activeKid.sport, activeKid.skillLevel, activeKid.birthYear ? `Born ${activeKid.birthYear}` : "", (activeKid as any).city].filter(Boolean).join(" · ") || "No details yet — tap Edit to add"}
                </p>
              </div>
            </div>
            {(activeKid as any).bio && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{(activeKid as any).bio}</p>
            )}
            {((activeKid as any).focusAreas?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {((activeKid as any).focusAreas as string[]).map((a) => (
                  <span key={a} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0f4f9", color: "#0F3154" }}>{a}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Trainer profile card (only when trainer is active) ── */}
        {!activeKid && isTrainerMode && trainerProfile && (
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Trainer Profile</h2>
            <div className="flex items-center gap-3">
              {isTrainerMode && (
                <Link href="/trainer/payout"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Payout
                </Link>
              )}
              <Link href="/trainer/setup"
                className="flex items-center gap-1.5 text-sm font-medium text-[#0F3154] hover:underline">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>
          </div>

          {isTrainerMode && trainerProfile ? (
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
          ) : isTrainerMode && !trainerProfile ? (
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
        )}

        {/* Player: Pending Questionnaires */}
        {!isTrainerMode && pendingQuestionnaires.length > 0 && (
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
        {!isTrainerMode && (followRequests.length > 0 || followers.length > 0) && (
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

        {/* Trainer: Sessions quick-link */}
        {isTrainerMode && (
          <div id="sessions" className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold">Sessions</h2>
                {sessions.length > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-bold text-white rounded-full"
                    style={{ backgroundColor: "#DC373E" }}>{sessions.length}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link href="/trainer/plans"
                  className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: "#0F3154" }}>
                  <CalendarDays className="h-3.5 w-3.5" /> Pre-launch
                </Link>
                <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
                  <Link href="/trainer/new-session">
                    <Plus className="h-4 w-4 mr-1" /> New session
                  </Link>
                </Button>
              </div>
            </div>
            <Link href="/trainer/manage"
              className="flex items-center justify-between mt-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "#EFF6FF" }}>
                  <ClipboardList className="h-5 w-5" style={{ color: "#0F3154" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Manage Sessions</p>
                  <p className="text-xs text-muted-foreground">View registrations, waitlists &amp; send emails</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        )}

        {/* Trainer: Follow Requests */}
        {isTrainerMode && trainerFollowRequests.length > 0 && (
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

        {/* Trainer: Training Requests inbox */}
        {isTrainerMode && trainingRequests.length > 0 && (
          <div id="requests" className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold">Training Requests</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Players near you looking for a trainer</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>
                {trainingRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {trainingRequests.map((r) => (
                <div key={r.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{r.playerName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                        {r.sport && <span>{r.sport}</span>}
                        {r.level && <span>{r.level}</span>}
                        {r.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.city}</span>}
                        {r.sessions && <span>{r.sessions} session{r.sessions !== "1" ? "s" : ""}</span>}
                        {r.budget && <span className="font-semibold text-green-700">{r.budget}/session</span>}
                      </div>
                      {r.preferredDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />{r.preferredDate}
                        </p>
                      )}
                      {r.message && <p className="text-xs text-muted-foreground mt-1 italic">"{r.message}"</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link href={`/trainer/requests/${r.id}/accept`}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity text-center"
                        style={{ backgroundColor: "#DC373E" }}>
                        Accept
                      </Link>
                      <button
                        onClick={async () => {
                          await fetch(`/api/trainer/requests/${r.id}/dismiss`, { method: "POST" });
                          setTrainingRequests((prev) => prev.filter((x) => x.id !== r.id));
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trainer: Earnings / Bookings */}
        {isTrainerMode && trainerBookings.length > 0 && (
          <div id="earnings" className="bg-white rounded-2xl border p-6">
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



        {/* Trainer: CRM link card */}
        {isTrainerMode && (
          <Link href="/clients" className="flex items-center justify-between bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF6FF" }}>
                <Users className="h-5 w-5" style={{ color: "#0F3154" }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0F3154]">My Clients</p>
                <p className="text-xs text-muted-foreground">Track clients, groups & notes</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        )}

        {/* Player: My Sessions */}
        {!isTrainerMode && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">My Sessions</h2>
              <Link href="/groups" className="text-sm font-medium text-[#DC373E] hover:underline">Browse all →</Link>
            </div>

            {playerBookings.length === 0 ? (
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
            ) : (
              <div className="space-y-3">
                {playerBookings.map((b) => (
                  <div key={b.id} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-snug">{b.sessionTitle}</p>
                        {b.trainerName && (
                          <p className="text-xs text-muted-foreground mt-0.5">with {b.trainerName}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                          {b.dayOfWeek && b.time && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />{b.dayOfWeek}s at {b.time}
                            </span>
                          )}
                          {(b.venue || b.city) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{[b.venue, b.city].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {b.athleteName && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{b.athleteName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: b.status === "refunded" ? "#9ca3af" : "#0F3154" }}>
                          {b.status === "refunded" ? <span className="line-through">${b.amountPaid}</span> : `$${b.amountPaid}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.dayOfWeek ? nextClassDate(b.dayOfWeek) : new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {b.status === "refunded" ? (
                          <span className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Refunded
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCancelBooking(b.id, b.createdAt, b.sessionTitle, b.amountPaid)}
                            disabled={cancellingBooking === b.id}
                            className="mt-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50">
                            {cancellingBooking === b.id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Player: My Training Requests */}
        {!isTrainerMode && playerRequests.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">My Training Requests</h2>
              <Link href="/request" className="text-sm font-medium hover:underline" style={{ color: "#DC373E" }}>+ New request</Link>
            </div>
            <div className="space-y-3">
              {playerRequests.map((r) => {
                const canRemind = (r.sendCount ?? 1) < 2;
                const statusColor = r.status === "open" ? "text-green-700 bg-green-50" : r.status === "accepted" ? "text-blue-700 bg-blue-50" : "text-gray-500 bg-gray-100";
                return (
                  <div key={r.id} className="border rounded-xl p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.sport && <span className="font-semibold text-sm">{r.sport}</span>}
                        {r.level && <span className="text-xs text-muted-foreground">{r.level}</span>}
                        {r.city && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{r.city}</span>}
                        {r.budget && <span className="text-xs font-semibold text-green-700">{r.budget}/session</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" · "}<span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColor}`}>{r.status}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.status === "open" && (
                        <button
                          disabled={!canRemind || reminding === r.id}
                          onClick={async () => {
                            if (!canRemind) return;
                            setReminding(r.id);
                            const res = await fetch(`/api/training-requests/${r.id}/remind`, { method: "POST" });
                            if (res.ok) setPlayerRequests((prev) => prev.map((x) => x.id === r.id ? { ...x, sendCount: (x.sendCount ?? 1) + 1 } : x));
                            setReminding(null);
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
                          title={canRemind ? "Send a reminder to trainers" : "Reminder limit reached"}>
                          {reminding === r.id ? "Sending…" : canRemind ? "Remind" : "Reminded"}
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this request?")) return;
                          await fetch(`/api/training-requests/${r.id}`, { method: "DELETE" });
                          setPlayerRequests((prev) => prev.filter((x) => x.id !== r.id));
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="Delete request">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stripe Payouts — trainers only */}
        {isTrainerMode && stripeConnected !== null && (
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

      {/* Player Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 my-auto">
            <h2 className="text-lg font-bold">{profileModal.id ? "Edit Player" : "Add Player"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Player name *</label>
                <input value={profileModal.name}
                  onChange={(e) => setProfileModal((p) => p ? { ...p, name: e.target.value } : p)}
                  placeholder="e.g. Emma"
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Birth year</label>
                  <input type="number" value={profileModal.birthYear}
                    onChange={(e) => setProfileModal((p) => p ? { ...p, birthYear: e.target.value } : p)}
                    placeholder="e.g. 2015"
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sport</label>
                  <input value={profileModal.sport}
                    onChange={(e) => setProfileModal((p) => p ? { ...p, sport: e.target.value } : p)}
                    placeholder="e.g. Soccer"
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Skill level</label>
                  <select value={profileModal.skillLevel}
                    onChange={(e) => setProfileModal((p) => p ? { ...p, skillLevel: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Elite</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">City</label>
                  <input value={profileModal.city}
                    onChange={(e) => setProfileModal((p) => p ? { ...p, city: e.target.value } : p)}
                    placeholder="e.g. Cary"
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bio <span className="font-normal">(optional — shown on their profile page)</span></label>
                <textarea value={profileModal.bio}
                  onChange={(e) => setProfileModal((p) => p ? { ...p, bio: e.target.value } : p)}
                  placeholder="e.g. Goalkeeper looking to improve footwork and distribution..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes <span className="font-normal">(private — for booking only)</span></label>
                <input value={profileModal.notes}
                  onChange={(e) => setProfileModal((p) => p ? { ...p, notes: e.target.value } : p)}
                  placeholder="e.g. left-footed, needs extra attention on defending"
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Focus Areas <span className="font-normal">(tap to select)</span></label>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_AREAS.map((area) => {
                    const selected = profileModal.focusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setProfileModal((p) => p ? {
                          ...p,
                          focusAreas: selected
                            ? p.focusAreas.filter((a) => a !== area)
                            : [...p.focusAreas, area],
                        } : p)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border transition-all"
                        style={selected
                          ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                          : { backgroundColor: "white", color: "#6b7280", borderColor: "#e2e8f0" }}>
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">Social (optional)</label>
                {[
                  { key: "instagram", placeholder: "@username", label: "Instagram" },
                  { key: "tiktok", placeholder: "@username", label: "TikTok" },
                  { key: "snapchat", placeholder: "username", label: "Snapchat" },
                ].map(({ key, placeholder, label }) => (
                  <input key={key} value={(profileModal as any)[key] ?? ""}
                    onChange={(e) => setProfileModal((p) => p ? { ...p, [key]: e.target.value } : p)}
                    placeholder={`${label} — ${placeholder}`}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                ))}
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={profileModal.isPublic}
                  onChange={(e) => setProfileModal((p) => p ? { ...p, isPublic: e.target.checked } : p)}
                  className="accent-[#0F3154] h-4 w-4" />
                <span className="text-sm font-medium">Show on Connect page</span>
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setProfileModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border">Cancel</button>
              <button onClick={saveProfile} disabled={savingProfile || !profileModal.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#0F3154" }}>
                {savingProfile ? "Saving…" : profileModal.id ? "Save changes" : "Add player"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
