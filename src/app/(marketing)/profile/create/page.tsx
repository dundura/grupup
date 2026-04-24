"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, User, Users } from "lucide-react";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const cities = ["Cary", "Raleigh", "Durham", "Chapel Hill", "Apex", "Charlotte", "Wake Forest", "Morrisville"];

type Role = "player" | "parent";

const roles: { value: Role; label: string; desc: string; icon: typeof User }[] = [
  { value: "player", label: "Player", desc: "I want to find and join group sessions", icon: User },
  { value: "parent", label: "Parent", desc: "I'm booking sessions for my child", icon: Users },
];

export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", city: "", sport: "", level: "",
    playerName: "", playerAge: "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const step2Complete =
    form.firstName.trim() && form.city && form.sport &&
    (role !== "parent" || (form.playerName.trim() && form.playerAge));

  function handleFinish() {
    localStorage.setItem("grupup_profile", JSON.stringify({ role, ...form }));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-2 rounded-full transition-all"
              style={{
                width: step === n ? 24 : 8,
                backgroundColor: step >= n ? "#0F3154" : "#e2e8f0",
              }}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          {/* Step 1 — Role */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your profile</h1>
              <p className="text-muted-foreground mb-6">Are you booking for yourself or your child?</p>
              <div className="space-y-3 mb-8">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                    style={
                      role === r.value
                        ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                        : { borderColor: "#e2e8f0" }
                    }
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: role === r.value ? "#0F3154" : "#f1f5f9" }}
                    >
                      <r.icon className="h-5 w-5" style={{ color: role === r.value ? "white" : "#64748b" }} />
                    </div>
                    <div>
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                className="w-full"
                disabled={!role}
                onClick={() => setStep(2)}
                style={{ backgroundColor: "#DC373E" }}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
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
                  <label className="text-sm font-medium mb-1.5 block">City</label>
                  <select
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select your city</option>
                    {cities.map((c) => <option key={c}>{c}, NC</option>)}
                  </select>
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

          {/* Step 3 — Done */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2">
                You're in, {form.firstName || "there"}!
              </h1>
              <p className="text-muted-foreground mb-8">
                Find a group session near you and book your spot in seconds.
              </p>
              <div className="space-y-3">
                <Button className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={handleFinish}>
                  Find a group session
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { localStorage.setItem("grupup_profile", JSON.stringify({ role, ...form })); router.push("/dashboard"); }}>
                  Go to my dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <a href="#" className="font-medium underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
