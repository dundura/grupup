"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });
import { completeOnboarding } from "@/app/onboarding/_actions";
import { CheckCircle, Plus, X } from "lucide-react";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Ireland",
  "Germany", "France", "Spain", "Brazil", "Mexico", "South Africa",
  "Nigeria", "Ghana", "Jamaica", "Trinidad & Tobago", "Other",
];
const specialties = ["Finishing", "Ball Mastery", "Ball Control", "Speed & Agility", "Goalkeeping", "Defending", "1v1", "Youth Development", "Technical Skills", "Passing", "Shooting"];
const certOptions = ["USSF D License", "USSF C License", "USSF B License", "UEFA B License", "United Soccer Coaches", "NASM-CPT", "Certified Speed Specialist"];

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const meta = (user?.publicMetadata ?? {}) as {
    role?: string; country?: string; city?: string; sport?: string; sports?: string[]; level?: string;
    bio?: string; yearsExperience?: string;
    specialties?: string[]; certifications?: string[];
    playerName?: string; playerAge?: string;
  };

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    customSpecialty: "",
    lastName: user?.lastName ?? "",
    country: meta.country ?? "",
    city: meta.city ?? "",
    sport: meta.sport ?? "",
    selectedSports: meta.sports ?? [],
    level: meta.level ?? "",
    bio: meta.bio ?? "",
    yearsExperience: meta.yearsExperience ?? "",
    selectedSpecialties: meta.specialties ?? [],
    selectedCerts: meta.certifications ?? [],
    playerName: meta.playerName ?? "",
    playerAge: meta.playerAge ?? "",
  });

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleList(key: "selectedCerts" | "selectedSpecialties" | "selectedSports", val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));
  }

  async function handleSave() {
    if (!meta.role) return;
    setSaving(true);
    await completeOnboarding({ role: meta.role, ...form });
    setSaved(true);
    setSaving(false);
  }

  if (!isLoaded) return <div className="py-12 text-muted-foreground">Loading…</div>;

  const role = meta.role ?? "player";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Saved
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Basic Info</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First name</label>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last name</label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-1.5 block">Country</label>
            <select value={form.country} onChange={(e) => set("country", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select country</option>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-1.5 block">City</label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Cary, London, Lagos" />
          </div>
          {role !== "trainer" ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Sport</label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button key={s} type="button" onClick={() => set("sport", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.sport === s
                      ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                      : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Sports you coach <span className="text-muted-foreground font-normal">(select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button key={s} type="button" onClick={() => toggleList("selectedSports", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.selectedSports.includes(s)
                      ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                      : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
              </div>
              {form.selectedSports.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">Don't see your sport? Contact us to add it.</p>
              )}
            </div>
          )}
        </div>

        {role === "player" && (
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Skill Level</h2>
            <div className="grid grid-cols-4 gap-2">
              {levels.map((l) => (
                <button key={l} type="button" onClick={() => set("level", l)}
                  className="py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={form.level === l
                    ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                    : { borderColor: "#e2e8f0", color: "#475569" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === "parent" && (
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Player Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Player name</label>
                <Input value={form.playerName} onChange={(e) => set("playerName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age</label>
                <Input type="number" min="4" max="18" value={form.playerAge} onChange={(e) => set("playerAge", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {role === "trainer" && (
          <div className="bg-card border rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Coaching Profile</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <RichTextEditor
                value={form.bio}
                onChange={(val) => set("bio", val)}
                placeholder="Tell players about your background, coaching style, and what makes your sessions different…"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Years of experience</label>
              <Input type="number" min="0" max="40" value={form.yearsExperience}
                onChange={(e) => set("yearsExperience", e.target.value)} className="w-28" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specialties <span className="text-muted-foreground font-normal">(select all that apply or add your own)</span></label>
              <div className="flex flex-wrap gap-2 mb-3">
                {specialties.map((s) => (
                  <button key={s} type="button" onClick={() => toggleList("selectedSpecialties", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.selectedSpecialties.includes(s)
                      ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                      : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
                {form.selectedSpecialties.filter((s) => !specialties.includes(s)).map((s) => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {s}
                    <button type="button" onClick={() => toggleList("selectedSpecialties", s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={form.customSpecialty}
                  onChange={(e) => set("customSpecialty", e.target.value)}
                  placeholder="Add your own specialty…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.customSpecialty.trim()) {
                      e.preventDefault();
                      if (!form.selectedSpecialties.includes(form.customSpecialty.trim())) {
                        toggleList("selectedSpecialties", form.customSpecialty.trim());
                      }
                      set("customSpecialty", "");
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm"
                  disabled={!form.customSpecialty.trim()}
                  onClick={() => {
                    if (form.customSpecialty.trim() && !form.selectedSpecialties.includes(form.customSpecialty.trim())) {
                      toggleList("selectedSpecialties", form.customSpecialty.trim());
                    }
                    set("customSpecialty", "");
                  }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {certOptions.map((c) => (
                  <button key={c} type="button" onClick={() => toggleList("selectedCerts", c)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.selectedCerts.includes(c)
                      ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                      : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button className="w-full" style={{ backgroundColor: "#DC373E" }} disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
