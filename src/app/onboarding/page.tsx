"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });
import { Plus, X } from "lucide-react";
import { ChevronRight, User, Users, Shield } from "lucide-react";
import { completeOnboarding } from "./_actions";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const specialties = ["Finishing", "Ball Mastery", "Ball Control", "Speed & Agility", "Goalkeeping", "Defending", "1v1", "Youth Development", "Technical Skills", "Passing", "Shooting"];
const certOptions = ["USSF D License", "USSF C License", "USSF B License", "UEFA B License", "United Soccer Coaches", "NASM-CPT", "Certified Speed Specialist"];
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Ireland",
  "Germany", "France", "Spain", "Brazil", "Mexico", "South Africa",
  "Nigeria", "Ghana", "Jamaica", "Trinidad & Tobago", "Other",
];

type Role = "player" | "parent" | "trainer";

const roles: { value: Role; label: string; desc: string; icon: typeof User }[] = [
  { value: "player",  label: "Player",         desc: "I want to find and join group sessions",   icon: User   },
  { value: "parent",  label: "Parent",          desc: "I'm booking sessions for my child",        icon: Users  },
  { value: "trainer", label: "Coach / Trainer", desc: "I want to create and run group sessions",  icon: Shield },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep]     = useState(1);
  const [role, setRole]     = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    firstName: "", lastName: "", country: "", city: "", sport: "", selectedSports: [] as string[], level: "",
    playerName: "", playerAge: "",
    bio: "", yearsExperience: "", selectedCerts: [] as string[], selectedSpecialties: [] as string[], customCert: "", customSpecialty: "",
  });

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleList(key: "selectedCerts" | "selectedSpecialties" | "selectedSports", val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));
  }

  const step2Complete = role === "trainer"
    ? form.firstName.trim() && form.country && form.city && form.selectedSports.length > 0 && form.bio.trim()
    : form.firstName.trim() && form.country && form.city && form.sport &&
      (role !== "parent" || (form.playerName.trim() && form.playerAge));

  async function handleFinish() {
    if (!role) return;
    setSaving(true);
    try {
      const result = await completeOnboarding({ role, ...form });
      if (result?.success) {
        await user?.reload();
        router.push("/dashboard");
      } else {
        alert(result?.error ?? "Something went wrong saving your profile.");
        setSaving(false);
      }
    } catch (err) {
      console.error("Onboarding submit error:", err);
      alert("Something went wrong. Check the browser console for details.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-2 rounded-full transition-all"
              style={{ width: step === n ? 28 : 8, backgroundColor: step >= n ? "#0F3154" : "#e2e8f0" }} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          {/* Step 1: Role */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your profile</h1>
              <p className="text-muted-foreground mb-6">Who are you joining as?</p>
              <div className="space-y-3 mb-8">
                {roles.map((r) => (
                  <button key={r.value} onClick={() => setRole(r.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                    style={role === r.value
                      ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                      : { borderColor: "#e2e8f0" }}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: role === r.value ? "#0F3154" : "#f1f5f9" }}>
                      <r.icon className="h-5 w-5" style={{ color: role === r.value ? "white" : "#64748b" }} />
                    </div>
                    <div>
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!role} onClick={() => setStep(2)} style={{ backgroundColor: "#DC373E" }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {/* Step 2: Player / Parent details */}
          {step === 2 && role !== "trainer" && (
            <>
              <h1 className="text-2xl font-bold mb-1">Your details</h1>
              <p className="text-muted-foreground mb-6">Help us find the right sessions for you.</p>
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First name</label>
                    <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Alex" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last name</label>
                    <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
                  </div>
                </div>
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Sport</label>
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
                {role === "player" && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Skill level</label>
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
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold mb-3">Your player</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Player name</label>
                        <Input value={form.playerName} onChange={(e) => set("playerName", e.target.value)} placeholder="Jamie" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Age</label>
                        <Input type="number" min="4" max="18" value={form.playerAge} onChange={(e) => set("playerAge", e.target.value)} placeholder="12" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!step2Complete} onClick={() => setStep(3)} style={{ backgroundColor: "#DC373E" }}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Trainer details */}
          {step === 2 && role === "trainer" && (
            <>
              <h1 className="text-2xl font-bold mb-1">Your coaching profile</h1>
              <p className="text-muted-foreground mb-6">This is what players and parents will see.</p>
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First name</label>
                    <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Marcus" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last name</label>
                    <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Johnson" />
                  </div>
                </div>
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Sports you coach <span className="text-muted-foreground font-normal">(select all that apply)</span></label>
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
                    <p className="text-xs text-muted-foreground mt-1.5">Don't see your sport? You can add more after signing up.</p>
                  )}
                </div>
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
                    onChange={(e) => set("yearsExperience", e.target.value)} placeholder="e.g. 8" className="w-32" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Training specialties <span className="text-muted-foreground font-normal">(select all that apply or add your own)</span></label>
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
                  <label className="text-sm font-medium mb-2 block">Certifications <span className="text-muted-foreground font-normal">(select all that apply or write your own)</span></label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {certOptions.map((c) => (
                      <button key={c} type="button" onClick={() => toggleList("selectedCerts", c)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                        style={form.selectedCerts.includes(c)
                          ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                          : { borderColor: "#e2e8f0", color: "#475569" }}>
                        {c}
                      </button>
                    ))}
                    {form.selectedCerts.filter((c) => !certOptions.includes(c)).map((c) => (
                      <span key={c} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: "#0F3154" }}>
                        {c}
                        <button type="button" onClick={() => toggleList("selectedCerts", c)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={form.customCert}
                      onChange={(e) => set("customCert", e.target.value)}
                      placeholder="Add your own certification…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && form.customCert.trim()) {
                          e.preventDefault();
                          if (!form.selectedCerts.includes(form.customCert.trim())) {
                            toggleList("selectedCerts", form.customCert.trim());
                          }
                          set("customCert", "");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm"
                      disabled={!form.customCert.trim()}
                      onClick={() => {
                        if (form.customCert.trim() && !form.selectedCerts.includes(form.customCert.trim())) {
                          toggleList("selectedCerts", form.customCert.trim());
                        }
                        set("customCert", "");
                      }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!step2Complete} onClick={() => setStep(3)} style={{ backgroundColor: "#DC373E" }}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">{role === "trainer" ? "🎯" : "🎉"}</div>
              <h1 className="text-2xl font-bold mb-2">
                {role === "trainer"
                  ? `Profile live, ${form.firstName || "Coach"}!`
                  : `You're in, ${form.firstName || "there"}!`}
              </h1>
              <p className="text-muted-foreground mb-8">
                {role === "trainer"
                  ? "Your coaching profile is ready. Create your first group session and start filling spots."
                  : "Find a group session near you and book your spot in seconds."}
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: "#DC373E" }}
                disabled={saving}
                onClick={handleFinish}
              >
                {saving ? "Setting up your account…" : role === "trainer" ? "Go to dashboard" : "Find a group session"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
