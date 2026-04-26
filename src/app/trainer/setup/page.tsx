"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { Plus, X, CheckCircle } from "lucide-react";
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });
import { ImageUpload } from "@/components/ui/ImageUpload";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const specialtyOptions = ["Finishing", "Ball Mastery", "Ball Control", "Speed & Agility", "Goalkeeping", "Defending", "1v1", "Youth Development", "Technical Skills", "Passing", "Shooting"];
const certOptions = ["USSF D License", "USSF C License", "USSF B License", "UEFA B License", "United Soccer Coaches", "NASM-CPT", "Certified Speed Specialist"];
const skillLevels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const countries = ["United States", "Canada", "United Kingdom", "Australia", "Ireland", "Germany", "France", "Spain", "Brazil", "Mexico", "South Africa", "Nigeria", "Ghana", "Jamaica", "Trinidad & Tobago", "Other"];

export default function TrainerSetupPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const meta = (user?.publicMetadata ?? {}) as { sports?: string[]; bio?: string; yearsExperience?: string; specialties?: string[]; certifications?: string[]; city?: string; country?: string };

  const [form, setForm] = useState({
    photo: user?.imageUrl ?? "",
    bio: meta.bio ?? "",
    country: meta.country ?? "",
    city: meta.city ?? "",
    sports: meta.sports ?? [],
    specialties: meta.specialties ?? [],
    certifications: meta.certifications ?? [],
    skillLevels: [] as string[],
    yearsExperience: meta.yearsExperience ?? "",
    hourlyRate: "85",
    customSpecialty: "",
    customCert: "",
  });

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleList(key: "sports" | "specialties" | "certifications" | "skillLevels", val: string) {
    setForm((f) => ({
      ...f,
      [key]: (f[key] as string[]).includes(val)
        ? (f[key] as string[]).filter((v) => v !== val)
        : [...(f[key] as string[]), val],
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const d = await res.json();
        alert(d.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;

  const step1Valid = form.bio.replace(/<[^>]*>/g, "").trim().length > 20 && form.city.trim() && form.country && form.sports.length > 0;

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {user?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="You" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
            )}
            <div>
              <h1 className="text-2xl font-bold">Set up your coaching profile</h1>
              <p className="text-muted-foreground text-sm">This is what players and parents see when they find you.</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= n ? "text-white" : "bg-muted text-muted-foreground"}`}
                  style={step >= n ? { backgroundColor: "#0F3154" } : undefined}>
                  {step > n ? <CheckCircle className="h-4 w-4" /> : n}
                </div>
                <span className={`text-sm font-medium ${step >= n ? "" : "text-muted-foreground"}`}>
                  {n === 1 ? "About you" : "Your expertise"}
                </span>
                {n < 2 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">

          {step === 1 && (
            <>
              {/* Photo */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Profile Photo</label>
                <ImageUpload
                  currentUrl={form.photo}
                  onUploaded={(url) => setForm((f) => ({ ...f, photo: url }))}
                  label="Upload your coaching photo"
                />
              </div>

              {/* Bio */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Your Bio</label>
                <RichTextEditor
                  value={form.bio}
                  onChange={(val) => set("bio", val)}
                  placeholder="Tell players about your background, playing experience, coaching philosophy, and what makes your sessions different…"
                  maxLength={800}
                />
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border p-6 space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Location</label>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Country</label>
                  <select value={form.country} onChange={(e) => set("country", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select your country</option>
                    {countries.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">City</label>
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Cary, London, Lagos" />
                </div>
              </div>

              {/* Sports */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sports you coach</label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => (
                    <button key={s} type="button" onClick={() => toggleList("sports", s)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.sports.includes(s)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={!step1Valid}
                style={{ backgroundColor: "#DC373E" }} onClick={() => setStep(2)}>
                Continue →
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Experience */}
              <div className="bg-white rounded-2xl border p-6 space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Experience</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Years coaching</label>
                    <Input type="number" min="0" max="40" value={form.yearsExperience}
                      onChange={(e) => set("yearsExperience", e.target.value)} placeholder="e.g. 8" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Private rate ($/hr)</label>
                    <Input type="number" min="30" step="5" value={form.hourlyRate}
                      onChange={(e) => set("hourlyRate", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Skill levels */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Who do you coach?</label>
                <div className="grid grid-cols-4 gap-2">
                  {skillLevels.map((l) => (
                    <button key={l} type="button" onClick={() => toggleList("skillLevels", l)}
                      className="py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={form.skillLevels.includes(l)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Specialties <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {specialtyOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleList("specialties", s)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.specialties.includes(s)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {s}
                    </button>
                  ))}
                  {form.specialties.filter((s) => !specialtyOptions.includes(s)).map((s) => (
                    <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0F3154" }}>
                      {s}
                      <button type="button" onClick={() => toggleList("specialties", s)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={form.customSpecialty} onChange={(e) => set("customSpecialty", e.target.value)}
                    placeholder="Add your own…"
                    onKeyDown={(e) => { if (e.key === "Enter" && form.customSpecialty.trim()) { e.preventDefault(); if (!form.specialties.includes(form.customSpecialty.trim())) toggleList("specialties", form.customSpecialty.trim()); set("customSpecialty", ""); } }} />
                  <Button type="button" variant="outline" size="sm" disabled={!form.customSpecialty.trim()}
                    onClick={() => { if (form.customSpecialty.trim() && !form.specialties.includes(form.customSpecialty.trim())) toggleList("specialties", form.customSpecialty.trim()); set("customSpecialty", ""); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-2xl border p-6">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Certifications <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {certOptions.map((c) => (
                    <button key={c} type="button" onClick={() => toggleList("certifications", c)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={form.certifications.includes(c)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {c}
                    </button>
                  ))}
                  {form.certifications.filter((c) => !certOptions.includes(c)).map((c) => (
                    <span key={c} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0F3154" }}>
                      {c}
                      <button type="button" onClick={() => toggleList("certifications", c)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={form.customCert} onChange={(e) => set("customCert", e.target.value)}
                    placeholder="Add your own certification…"
                    onKeyDown={(e) => { if (e.key === "Enter" && form.customCert.trim()) { e.preventDefault(); if (!form.certifications.includes(form.customCert.trim())) toggleList("certifications", form.customCert.trim()); set("customCert", ""); } }} />
                  <Button type="button" variant="outline" size="sm" disabled={!form.customCert.trim()}
                    onClick={() => { if (form.customCert.trim() && !form.certifications.includes(form.customCert.trim())) toggleList("certifications", form.customCert.trim()); set("customCert", ""); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>← Back</Button>
                <Button className="flex-1" size="lg" disabled={saving}
                  style={{ backgroundColor: "#DC373E" }} onClick={handleSave}>
                  {saving ? "Creating your profile…" : "Publish my profile"}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
