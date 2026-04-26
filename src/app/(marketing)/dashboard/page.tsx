"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Bell, Star, MapPin, Clock, ChevronRight, Search, Plus, Users } from "lucide-react";
import { groupSessions, trainers } from "@/lib/mock-data";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [followed, setFollowed] = useState<string[]>([]);

  useEffect(() => {
    const f = localStorage.getItem("grupup_followed");
    if (f) setFollowed(JSON.parse(f));
  }, []);

  function toggleFollow(trainerId: string) {
    setFollowed((prev) => {
      const next = prev.includes(trainerId)
        ? prev.filter((id) => id !== trainerId)
        : [...prev, trainerId];
      localStorage.setItem("grupup_followed", JSON.stringify(next));
      return next;
    });
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  }

  const meta = (user?.publicMetadata ?? {}) as {
    role?: string; city?: string; sport?: string; level?: string; playerName?: string;
  };
  const role = meta.role ?? "player";
  const city = meta.city ?? "";
  const sport = meta.sport ?? "";
  const level = meta.level ?? "";
  const firstName = user?.firstName ?? "";

  const name = role === "parent" && meta.playerName ? meta.playerName : firstName;

  // Recommended sessions based on profile sport + city
  const recommended = groupSessions.filter((s) => {
    const sportMatch = !sport || s.sport.toLowerCase() === sport.toLowerCase();
    const cityMatch = !city || s.city === city.split(",")[0];
    return sportMatch || cityMatch;
  }).slice(0, 4);

  const followedTrainers = trainers.filter((t) => followed.includes(t.id));

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-10">
        <div className="container max-w-5xl">
          <p className="text-white/60 text-sm mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-white mb-1">
            {name ? `Hey, ${name} 👋` : "Your Dashboard"}
          </h1>
          <p className="text-white/50 text-sm">
            {role === "trainer" && <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">Coach</span>}
            {sport && `${sport} · `}{city}
            {level && ` · ${level}`}
          </p>
        </div>
      </div>

      <div className="container max-w-5xl py-10 space-y-10">

        {/* Trainer view */}
        {role === "trainer" ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My sessions</h2>
              <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/trainer/new-session">
                  <Plus className="h-4 w-4 mr-1" /> New session
                </Link>
              </Button>
            </div>
            <div className="bg-white rounded-2xl border p-10 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="font-semibold text-lg mb-1">No sessions yet</p>
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
          </section>
        ) : (
          /* Player / Parent view */
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My sessions</h2>
              <Link href="/groups" className="text-sm font-medium text-[#DC373E] flex items-center gap-1 hover:underline">
                Browse all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border p-10 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-semibold text-lg mb-1">No sessions booked yet</p>
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
          </section>
        )}

        {/* Recommended sessions */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Recommended for you
                {city && <span className="text-muted-foreground font-normal text-base ml-2">· {city.split(",")[0]}</span>}
              </h2>
              <Link href="/groups" className="text-sm font-medium text-[#DC373E] flex items-center gap-1 hover:underline">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recommended.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="bg-white rounded-2xl border hover:shadow-md transition-shadow overflow-hidden flex"
                >
                  <div className="w-2 shrink-0" style={{ backgroundColor: "#0F3154" }} />
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          {s.sportEmoji} {s.sport} · {s.sessionType.replace("-", " ")}
                        </p>
                        <p className="font-bold text-sm leading-tight">{s.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-base">${s.pricePerPlayer}</p>
                        <p className="text-xs text-muted-foreground">/player</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.dayOfWeek}s {s.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${s.spotsLeft <= 2 ? "text-[#DC373E]" : "text-muted-foreground"}`}>
                        {s.spotsLeft <= 2 ? `⚡ ${s.spotsLeft} spots left` : `${s.spotsLeft} spots open`}
                      </span>
                      <span className="text-xs text-muted-foreground">{s.trainer.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Following — players/parents only */}
        {role !== "trainer" && <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trainers you follow</h2>
          </div>
          {followedTrainers.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="font-semibold mb-1">Follow trainers to get notified</p>
              <p className="text-sm text-muted-foreground mb-5">
                Follow a trainer and you'll get an email the moment they open a new group session — plus you can share sessions directly with your crew.
              </p>
              <Button variant="outline" asChild>
                <Link href="/groups">Browse sessions</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {followedTrainers.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border p-4 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{t.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{t.rating}</span>
                      <span>· {t.city}, {t.state}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                    style={{ borderColor: "#0F3154", color: "#0F3154" }}
                  >
                    <Bell className="h-3.5 w-3.5" />
                    Following
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>}

      </div>
    </div>
  );
}
