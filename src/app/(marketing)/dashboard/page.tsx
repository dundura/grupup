"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Plus, Users, Search, Star, MapPin, Pencil,
  CheckCircle, AlertCircle, ExternalLink,
  CalendarDays, Clock, Pencil as EditIcon, Trash2,
} from "lucide-react";

interface TrainerProfile {
  id: string; photo: string; bio: string; city: string; state: string;
  sport: string; sports: string[]; specialties: string[]; certifications: string[];
  skillLevels: string[]; yearsExperience: number; hourlyRate: number;
  rating: number; reviewCount: number; isArchived: boolean;
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
      ]).then(([profile, sess]) => {
        setTrainerProfile(profile ?? null);
        setSessions(Array.isArray(sess) ? sess : []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoaded, role]);

  async function deleteSession(id: number) {
    if (!confirm("Delete this session? Players who booked will be notified.")) return;
    await fetch(`/api/trainer/sessions/${id}`, { method: "DELETE" });
    setSessions((s) => s.filter((x) => x.id !== id));
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

  return (
    <div className="min-h-screen bg-[#f4f6f9]">

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
            <Link href={role === "trainer" ? "/trainer/setup" : "/profile"}
              className="flex items-center gap-1.5 text-sm font-medium text-[#0F3154] hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
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
                      <button
                        onClick={() => deleteSession(s.id)}
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

      </div>
    </div>
  );
}
