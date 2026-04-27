"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Trophy, Zap, Lock, Globe } from "lucide-react";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const cities = ["Cary", "Raleigh", "Durham", "Chapel Hill", "Apex", "Charlotte", "Wake Forest", "Morrisville"];
const ageRanges = ["6–8", "8–10", "10–12", "12–14", "14–16", "16–18", "Adults (18+)", "All ages"];

const groupTypes = [
  {
    value: "find-trainer",
    emoji: "🎯",
    label: "Looking for a trainer",
    desc: "Form a group first, then find a coach to lead your sessions",
  },
  {
    value: "free-play",
    emoji: "🎮",
    label: "Free play / Pickup",
    desc: "Organize informal games and scrimmages — no coach needed",
  },
  {
    value: "train-together",
    emoji: "💪",
    label: "Train together",
    desc: "Self-organized training group working toward a shared goal",
  },
];

export default function CreateGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "",
    type: "",
    level: "",
    ageRange: "",
    city: "",
    maxPlayers: "8",
    description: "",
    isPublic: true,
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key: string, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const isValid = form.name.trim() && form.sport && form.type && form.city;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    localStorage.setItem("grupup_new_group", JSON.stringify(form));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border shadow-sm p-10">
          <div className="text-5xl mb-4">🙌</div>
          <h1 className="text-2xl font-bold mb-2">Group created!</h1>
          <p className="text-muted-foreground mb-8">
            <strong>{form.name}</strong> is live. Share it with your crew or make it public so others can find and join.
          </p>
          <div className="space-y-3">
            <Button className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={() => router.push("/dashboard")}>
              View my dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/groups")}>
              Browse other groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a group</h1>
          <p className="text-muted-foreground text-lg">
            Start your own training group — find a trainer together or organize free play.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Group name */}
          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Group Name</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Tuesday Soccer Crew, Raleigh Ballers..."
              className="text-base"
            />
          </div>

          {/* Group type */}
          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">What kind of group?</label>
            <div className="space-y-3">
              {groupTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("type", t.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                  style={
                    form.type === t.value
                      ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                      : { borderColor: "#e2e8f0" }
                  }
                >
                  <span className="text-2xl shrink-0">{t.emoji}</span>
                  <div>
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sport + Level */}
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sport</label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("sport", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={
                      form.sport === s
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Skill Level</label>
              <div className="grid grid-cols-4 gap-2">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set("level", l)}
                    className="py-2 rounded-lg text-sm font-medium border transition-colors"
                    style={
                      form.level === l
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Age Range</label>
              <div className="flex flex-wrap gap-2">
                {ageRanges.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("ageRange", a)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={
                      form.ageRange === a
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location + size */}
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">City</label>
              <select
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}, NC</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Max players <span className="text-foreground font-bold normal-case tracking-normal">{form.maxPlayers}</span>
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={form.maxPlayers}
                onChange={(e) => set("maxPlayers", e.target.value)}
                className="w-full accent-[#0F3154]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2 (semi-private)</span>
                <span>20 (clinic)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Description <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell potential members what your group is about, when you typically train, your goals..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Visibility */}
          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set("isPublic", true)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                style={form.isPublic ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}
              >
                <Globe className="h-5 w-5" style={{ color: form.isPublic ? "#0F3154" : "#94a3b8" }} />
                <div className="text-left">
                  <p className="font-semibold text-sm">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can find and request to join</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => set("isPublic", false)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                style={!form.isPublic ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" } : { borderColor: "#e2e8f0" }}
              >
                <Lock className="h-5 w-5" style={{ color: !form.isPublic ? "#0F3154" : "#94a3b8" }} />
                <div className="text-left">
                  <p className="font-semibold text-sm">Private</p>
                  <p className="text-xs text-muted-foreground">Invite only — you control who joins</p>
                </div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-base"
            disabled={!isValid}
            style={{ backgroundColor: "#DC373E" }}
          >
            <Users className="h-5 w-5 mr-2" />
            Create group
          </Button>
        </form>
      </div>
    </div>
  );
}
