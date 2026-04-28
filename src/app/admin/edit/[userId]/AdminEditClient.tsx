"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const leagues = ["ECNL", "MLS Next", "NPL (National Premier League)", "USYSA", "US Club Soccer", "Elite Academy", "High School Varsity", "College", "Recreational", "Other"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

export default function AdminEditClient({
  userId, role, initialData,
}: {
  userId: string;
  role: string;
  initialData: {
    firstName: string; lastName: string; email: string; photo: string;
    city: string; country: string; bio: string; sport: string;
    playerSports: string[]; sports: string[]; level: string; league: string;
    team: string; birthYear: string; gender: string; yearsExperience: string;
    specialties: string[]; certifications: string[]; videoLinks: string[];
    isApproved: boolean; isHidden: boolean;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: any) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleArr(key: "playerSports" | "sports" | "specialties" | "certifications", val: string) {
    setForm((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    const res = await fetch(`/api/admin/users/${userId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json(); setError(d.error ?? "Failed to save"); }
    setSaving(false);
  }

  const isPlayer = role === "player" || role === "parent";

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Admin
          </Link>
          {saved && (
            <div className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
              <CheckCircle className="h-4 w-4" /> Saved
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
        <p className="text-muted-foreground text-sm mb-6">{form.email} · <span className="capitalize">{role}</span></p>

        <div className="space-y-5">
          {/* Name */}
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Name</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">First name</label>
                <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Last name</label>
                <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-white rounded-2xl border p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Profile Photo</h2>
            <div className="flex items-center gap-4">
              {form.photo ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-200">
                  <Image src={form.photo} alt="Profile" fill className="object-cover" sizes="64px" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-white text-xl font-bold bg-[#0F3154]">
                  {form.firstName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">Photo URL</label>
                <Input value={form.photo} onChange={(e) => set("photo", e.target.value)} placeholder="https://..." className="text-xs" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Location</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">City</label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Country</label>
                <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border p-5">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          {/* Player-specific */}
          {isPlayer && (
            <div className="bg-white rounded-2xl border p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Player Details</h2>
              <div>
                <label className="text-sm font-medium mb-2 block">Sports</label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArr("playerSports", s)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.playerSports.includes(s) ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Skill level</label>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((l) => (
                      <button key={l} type="button" onClick={() => set("level", l)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                        style={form.level === l ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Birth year</label>
                  <select value={form.birthYear} onChange={(e) => set("birthYear", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select year</option>
                    {birthYears.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">League</label>
                  <select value={form.league} onChange={(e) => set("league", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select league</option>
                    {leagues.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Team / Club</label>
                  <Input value={form.team} onChange={(e) => set("team", e.target.value)} placeholder="e.g. NCFC" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <div className="flex gap-2 flex-wrap">
                  {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                    <button key={g} type="button" onClick={() => set("gender", g)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.gender === g ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-sm font-semibold">Approved</p>
                  <p className="text-xs text-muted-foreground">Player appears on /connect when approved</p>
                </div>
                <button type="button" onClick={() => set("isApproved", !form.isApproved)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${form.isApproved ? "bg-green-500" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isApproved ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Hidden from Connect</p>
                  <p className="text-xs text-muted-foreground">Player won't appear in listings</p>
                </div>
                <button type="button" onClick={() => set("isHidden", !form.isHidden)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${form.isHidden ? "bg-[#DC373E]" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isHidden ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          )}

          {/* Trainer-specific */}
          {role === "trainer" && (
            <div className="bg-white rounded-2xl border p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trainer Details</h2>
              <div>
                <label className="text-sm font-medium mb-2 block">Sports coached</label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArr("sports", s)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.sports.includes(s) ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Years of experience</label>
                <Input type="number" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} className="w-28" />
              </div>
            </div>
          )}

          {/* Video links — players only */}
          {isPlayer && (
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Highlight Videos</h2>
              <div className="space-y-2">
                {[0,1,2,3,4,5].map((i) => (
                  <Input key={i}
                    value={form.videoLinks[i] ?? ""}
                    onChange={(e) => {
                      const updated = [...form.videoLinks];
                      updated[i] = e.target.value;
                      setForm((f) => ({ ...f, videoLinks: updated }));
                    }}
                    placeholder={`Video ${i + 1} — YouTube or Vimeo URL`}
                    className="text-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <Button className="w-full" size="lg" onClick={save} disabled={saving} style={{ backgroundColor: "#DC373E" }}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
