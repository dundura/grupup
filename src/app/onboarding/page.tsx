"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, ChevronRight } from "lucide-react";
import { completeOnboarding } from "./_actions";

type Role = "player" | "trainer";

const roles: { value: Role; label: string; desc: string; icon: typeof User }[] = [
  { value: "player",  label: "Player",         icon: User,   desc: "I want to find and join group sessions near me" },
  { value: "trainer", label: "Coach / Trainer", icon: Shield, desc: "I want to create sessions and grow my client base" },
];

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Ireland",
  "Germany", "France", "Spain", "Brazil", "Mexico", "South Africa",
  "Nigeria", "Ghana", "Jamaica", "Trinidad & Tobago", "Other",
];

export default function OnboardingPage() {
  const router  = useRouter();
  const { user } = useUser();
  const [step,   setStep]   = useState(1);
  const [role,   setRole]   = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState({ firstName: "", lastName: "", country: "", city: "" });

  function set(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  const step2Valid = form.firstName.trim() && form.country && form.city.trim();

  async function handleFinish() {
    if (!role) return;
    setSaving(true);
    try {
      const result = await completeOnboarding({ role, ...form });
      if (result?.success) {
        await user?.reload();
        router.push(role === "trainer" ? "/trainer/setup" : "/dashboard");
      } else {
        alert(result?.error ?? "Something went wrong. Please try again.");
        setSaving(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((n) => (
            <div key={n} className="h-2 rounded-full transition-all"
              style={{ width: step === n ? 28 : 8, backgroundColor: step >= n ? "#0F3154" : "#e2e8f0" }} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          {/* Step 1: Role */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-muted-foreground mb-6">What type of profile do you want?</p>

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

              <p className="text-xs text-muted-foreground text-center mb-4">
                You can add more profiles (player or trainer) from your account later.
              </p>

              <Button className="w-full" disabled={!role} onClick={() => setStep(2)}
                style={{ backgroundColor: "#DC373E" }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {/* Step 2: Basic info */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Your details</h1>
              <p className="text-muted-foreground mb-6">
                {role === "trainer" ? "Where are you coaching?" : "Help us find the right sessions for you."}
              </p>

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
              </div>

              {role === "trainer" && (
                <p className="text-xs text-muted-foreground bg-blue-50 rounded-lg p-3 mb-5">
                  Next you'll set up your coaching profile — photo, bio, specialties, and rates.
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!step2Valid || saving}
                  style={{ backgroundColor: "#DC373E" }} onClick={handleFinish}>
                  {saving ? "Setting up…" : role === "trainer" ? "Set up coaching profile →" : "Find sessions →"}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
