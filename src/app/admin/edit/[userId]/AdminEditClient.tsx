"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PhotoCropModal } from "@/components/ui/PhotoCropModal";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const leagues = ["ECNL", "MLS Next", "NPL (National Premier League)", "USYSA", "US Club Soccer", "Elite Academy", "AAU", "High School Varsity", "College", "Recreational", "Other"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite", "Recreational", "Club", "Academy", "AAU", "Varsity", "Travel Ball", "Select", "Competitive"];
const improvementAreaOptions = ["Ball Skills", "Finishing", "Defending", "1v1", "Passing", "Shooting", "Speed & Agility", "Dribbling", "Heading", "Goalkeeping", "Game Sense", "Set Pieces"];
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

export default function AdminEditClient({
  userId, role, playerProfileId, initialData,
}: {
  userId: string;
  role: string;
  playerProfileId: number | null;
  initialData: {
    firstName: string; lastName: string; email: string; photo: string;
    city: string; country: string; bio: string; sport: string;
    playerSports: string[]; sports: string[]; level: string; league: string;
    team: string; birthYear: string; gender: string; yearsExperience: string;
    specialties: string[]; certifications: string[]; videoLinks: string[];
    improvementAreas: string[];
    availableForFreePlay: boolean; openToTrain: boolean;
    isApproved: boolean; isHidden: boolean;
    instagram: string; tiktok: string; snapchat: string;
    position: string; improvementAreas: string[];
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleCropApply(blob: Blob) {
    setCropSrc(null);
    setUploadingPhoto(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: "photo.jpg", contentType: "image/jpeg" }),
      });
      const { uploadUrl, cdnUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": "image/jpeg" } });
      set("photo", cdnUrl);
    } finally {
      setUploadingPhoto(false);
    }
  }

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
      body: JSON.stringify({ ...form, playerProfileId }),
    });
    if (res.ok) { setSaved(true); setShowPopup(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json(); setError(d.error ?? "Failed to save"); }
    setSaving(false);
  }

  const isPlayer = role === "player" || role === "parent";

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-10">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-4 bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-1">Profile updated!</h2>
            <p className="text-muted-foreground text-sm mb-5">Changes saved successfully.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPopup(false)}>Close</Button>
              <Button className="flex-1" style={{ backgroundColor: "#0F3154" }} onClick={() => { setShowPopup(false); router.push("/admin"); }}>
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      )}
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
            {cropSrc && (
              <PhotoCropModal imageSrc={cropSrc} onApply={handleCropApply} onCancel={() => setCropSrc(null)} />
            )}
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}
                className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9] group cursor-pointer">
                {form.photo ? (
                  <Image src={form.photo} alt="Profile" fill className="object-cover" sizes="80px" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-[#0F3154]">
                    {form.firstName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                <Button variant="outline" size="sm" disabled={uploadingPhoto} onClick={() => fileRef.current?.click()}>
                  {uploadingPhoto ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</> : <><Camera className="h-4 w-4 mr-1.5" /> Upload photo</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG or WebP</p>
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

          {/* Bio / player looking for */}
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                {isPlayer ? "What are you looking for?" : "Bio"}
              </label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            {isPlayer && (
              <div>
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {improvementAreaOptions.map((a) => (
                    <button key={a} type="button"
                      onClick={() => {
                        const arr = form.improvementAreas ?? [];
                        set("improvementAreas", arr.includes(a) ? arr.filter((x: string) => x !== a) : [...arr, a]);
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={(form.improvementAreas ?? []).includes(a)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                  <Input value={form.league} onChange={(e) => set("league", e.target.value.slice(0, 40))}
                    placeholder="e.g. ECNL, AAU, High School Varsity…" maxLength={40} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Team / Club</label>
                  <Input value={form.team} onChange={(e) => set("team", e.target.value)} placeholder="e.g. NCFC" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Position</label>
                <Input value={(form as any).position ?? ""} onChange={(e) => set("position", e.target.value)} placeholder="e.g. Striker, Midfielder, Goalkeeper…" />
              </div>
              <div className="hidden">{/* spacer to close grid */}
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
              {[
                { key: "availableForFreePlay", label: "Seeking Free Play", desc: "Shows pill on their connect card" },
                { key: "openToTrain", label: "Seeking Training", desc: "Shows pill on their connect card" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between border-t pt-3">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button type="button" onClick={() => set(key, !(form as any)[key])}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${(form as any)[key] ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${(form as any)[key] ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-sm font-semibold">Active on Connect</p>
                  <p className="text-xs text-muted-foreground">Toggle off to remove this player from Connect with Players</p>
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

              {/* Social */}
              <div className="pt-2 border-t space-y-2">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Social</p>
                {[
                  { key: "instagram", label: "Instagram" },
                  { key: "tiktok",    label: "TikTok" },
                  { key: "snapchat",  label: "Snapchat" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-sm font-medium mb-1.5 block">{label}</label>
                    <Input value={(form as any)[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={`@username`} />
                  </div>
                ))}
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
