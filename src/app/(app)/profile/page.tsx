"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor").then(m => m.RichTextEditor), { ssr: false });
import { completeOnboarding } from "@/app/onboarding/_actions";
import { CheckCircle, Plus, X, Camera, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PhotoCropModal } from "@/components/ui/PhotoCropModal";
import PlayerProfilesList from "@/components/profile/PlayerProfilesList";
import type { ChildProfile } from "@/components/profile/PlayerProfilesList";

const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const leagues = ["ECNL", "MLS Next", "NPL (National Premier League)", "USYSA", "US Club Soccer", "Elite Academy", "High School Varsity", "College", "Recreational", "Other"];
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Ireland",
  "Germany", "France", "Spain", "Brazil", "Mexico", "South Africa",
  "Nigeria", "Ghana", "Jamaica", "Trinidad & Tobago", "Other",
];
const specialties = ["Finishing", "Ball Mastery", "Ball Control", "Speed & Agility", "Goalkeeping", "Defending", "1v1", "Youth Development", "Technical Skills", "Passing", "Shooting"];
const certOptions = ["USSF D License", "USSF C License", "USSF B License", "UEFA B License", "United Soccer Coaches", "NASM-CPT", "Certified Speed Specialist"];

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = (user?.publicMetadata ?? {}) as {
    role?: string; country?: string; city?: string; sport?: string; sports?: string[]; level?: string;
    bio?: string; yearsExperience?: string; specialties?: string[]; certifications?: string[];
    playerName?: string; playerAge?: string; isHidden?: boolean;
    photo?: string; league?: string; team?: string; birthYear?: string; gender?: string;
    playerSports?: string[]; videoLinks?: string[]; childProfiles?: ChildProfile[];
  };

  function buildForm(u: typeof user) {
    const m = (u?.publicMetadata ?? {}) as typeof meta;
    return {
      firstName: u?.firstName ?? "",
      lastName: u?.lastName ?? "",
      country: m.country ?? "",
      city: m.city ?? "",
      sport: m.sport ?? "",
      selectedSports: (m.sports ?? []) as string[],
      selectedPlayerSports: (m.playerSports ?? (m.sport ? [m.sport] : [])) as string[],
      level: m.level ?? "",
      bio: m.bio ?? (m.role !== "trainer" ? "Looking for group training sessions to improve my skills and connect with other players near me." : ""),
      yearsExperience: m.yearsExperience ?? "",
      selectedSpecialties: (m.specialties ?? []) as string[],
      selectedCerts: (m.certifications ?? []) as string[],
      playerName: m.playerName ?? "",
      playerAge: m.playerAge ?? "",
      isHidden: m.isHidden ?? false,
      customSpecialty: "",
      photo: m.photo ?? "",
      league: m.league ?? "",
      leagueOther: "",
      team: m.team ?? "",
      birthYear: m.birthYear ?? "",
      gender: m.gender ?? "",
      videoLinks: ((m.videoLinks ?? ["", "", "", "", "", ""]) as string[]),
      childProfiles: ((m.childProfiles ?? []) as ChildProfile[]),
      disableMessages: (m as any).disableMessages ?? false,
    };
  }

  const [form, setForm] = useState(() => buildForm(user));

  // Re-hydrate the form once Clerk has loaded the user
  useEffect(() => {
    if (isLoaded && user) {
      setForm(buildForm(user));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  function set(key: string, val: string | boolean) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleList(key: "selectedCerts" | "selectedSpecialties" | "selectedSports" | "selectedPlayerSports", val: string) {
    setForm((f) => ({
      ...f,
      [key]: (f[key] as string[]).includes(val)
        ? (f[key] as string[]).filter((v) => v !== val)
        : [...(f[key] as string[]), val],
    }));
  }

  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
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

  // Photo is valid only if it's an explicit CloudFront upload (not a Clerk default avatar)
  const hasUploadedPhoto = form.photo.includes("cloudfront.net");

  async function handleSave() {
    if (!meta.role) return;
    if (!hasUploadedPhoto) {
      if (fileRef.current) fileRef.current.click();
      return;
    }
    setSaving(true);
    const leagueValue = form.league === "Other" ? form.leagueOther : form.league;
    const cleanedVideos = form.videoLinks.map((v) => v.trim()).filter(Boolean);
    await completeOnboarding({ role: meta.role, ...form, league: leagueValue, videoLinks: cleanedVideos, childProfiles: form.childProfiles });
    setSaved(true);
    setSaving(false);
  }

  if (!isLoaded) return <div className="py-12 text-muted-foreground">Loading…</div>;

  const role = meta.role ?? "player";
  const photoSrc = form.photo || user?.imageUrl || "";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success popup */}
      {saved && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-4 bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-1">Profile saved!</h2>
            <p className="text-muted-foreground text-sm mb-5">Your changes have been saved successfully.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSaved(false)}>Close</Button>
              {user?.id && (
                <Button className="flex-1" style={{ backgroundColor: "#0F3154" }} asChild>
                  <Link href={`/connect/${user.id}`} target="_blank" onClick={() => setSaved(false)}>
                    <ExternalLink className="h-4 w-4 mr-1.5" /> View profile
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crop modal — rendered as fixed overlay */}
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onApply={handleCropApply}
          onCancel={() => setCropSrc(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex items-center gap-3">
          {role !== "trainer" && user?.id && (
            <Link href={`/connect/${user.id}`} target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-[#f0f4f9]"
              style={{ color: "#0F3154", borderColor: "#0F3154" }}>
              <ExternalLink className="h-3.5 w-3.5" /> View profile
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6">

        {/* Photo upload */}
        <div className={`bg-card border rounded-2xl p-6 ${!hasUploadedPhoto ? "border-red-300 bg-red-50/30" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Profile Photo <span className="text-red-500 ml-0.5">*</span>
            </h2>
            {!hasUploadedPhoto && (
              <span className="text-xs font-semibold text-red-600">Required</span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#f0f4f9] shrink-0">
              {photoSrc ? (
                <Image src={photoSrc} alt="Profile" fill className="object-cover" sizes="80px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: "#0F3154" }}>
                  {(form.firstName?.[0] ?? "?").toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              <Button variant="outline" size="sm" disabled={uploadingPhoto} onClick={() => fileRef.current?.click()}>
                {uploadingPhoto ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</> : <><Camera className="h-4 w-4 mr-1.5" /> Change photo</>}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG or WebP · max 5 MB</p>
            </div>
          </div>
        </div>

        {/* Basic info */}
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
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Gender</label>
            <div className="flex gap-2 flex-wrap">
              {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                <button key={g} type="button" onClick={() => set("gender", g)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  style={form.gender === g
                    ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                    : { borderColor: "#e2e8f0", color: "#475569" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {role !== "trainer" ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Sports <span className="text-muted-foreground font-normal">(select all that apply)</span></label>
              <div className="flex flex-wrap gap-2 mb-3">
                {sports.map((s) => (
                  <button key={s} type="button" onClick={() => toggleList("selectedPlayerSports", s)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={form.selectedPlayerSports.includes(s)
                      ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                      : { borderColor: "#e2e8f0", color: "#475569" }}>
                    {s}
                  </button>
                ))}
                {/* Custom sports already added */}
                {form.selectedPlayerSports.filter((s) => !sports.includes(s)).map((s) => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {s}
                    <button type="button" onClick={() => toggleList("selectedPlayerSports", s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {/* Write-in sport */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1 max-w-[220px]">
                  <Input
                    value={(form as any).customPlayerSport ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 20);
                      setForm((f) => ({ ...f, customPlayerSport: val }));
                    }}
                    placeholder="Other sport…"
                    maxLength={20}
                    className="pr-10 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = ((form as any).customPlayerSport ?? "").trim();
                        if (val && !form.selectedPlayerSports.includes(val)) {
                          toggleList("selectedPlayerSports", val);
                        }
                        setForm((f) => ({ ...f, customPlayerSport: "" }));
                      }
                    }}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {20 - ((form as any).customPlayerSport?.length ?? 0)}
                  </span>
                </div>
                <Button type="button" variant="outline" size="sm"
                  disabled={!((form as any).customPlayerSport ?? "").trim()}
                  onClick={() => {
                    const val = ((form as any).customPlayerSport ?? "").trim();
                    if (val && !form.selectedPlayerSports.includes(val)) {
                      toggleList("selectedPlayerSports", val);
                    }
                    setForm((f) => ({ ...f, customPlayerSport: "" }));
                  }}>
                  <Plus className="h-4 w-4" />
                </Button>
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
            </div>
          )}
        </div>

        {/* Player-specific fields */}
        {role !== "trainer" && (
          <>
            <div className="bg-card border rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Player Details</h2>

              {/* Birth year */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Birth year</label>
                <select value={form.birthYear} onChange={(e) => set("birthYear", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select year</option>
                  {birthYears.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>

              {/* Skill level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skill level</label>
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

              {/* Competitive league */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Competitive level / league</label>
                <select value={form.league} onChange={(e) => set("league", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select league</option>
                  {leagues.map((l) => <option key={l}>{l}</option>)}
                </select>
                {form.league === "Other" && (
                  <Input className="mt-2" value={form.leagueOther} onChange={(e) => set("leagueOther", e.target.value)}
                    placeholder="Type your league…" />
                )}
              </div>

              {/* Team */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team / Club</label>
                <Input value={form.team} onChange={(e) => set("team", e.target.value)}
                  placeholder="e.g. NCFC, Charlotte Independence" />
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">What are you looking for? <span className="text-muted-foreground font-normal">(short bio)</span></label>
                <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                  placeholder="e.g. Looking for weekly soccer training sessions to improve my finishing and 1v1 skills…"
                  rows={3} maxLength={300}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300 characters</p>
              </div>

              {/* Video links */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Highlight videos <span className="text-muted-foreground font-normal">(YouTube or Vimeo · up to 6)</span></label>
                <div className="space-y-2">
                  {[0,1,2,3,4,5].map((i) => (
                    <Input key={i}
                      value={form.videoLinks[i] ?? ""}
                      onChange={(e) => {
                        const updated = [...form.videoLinks];
                        updated[i] = e.target.value;
                        setForm((f) => ({ ...f, videoLinks: updated }));
                      }}
                      placeholder={`Video ${i + 1} URL — e.g. https://youtube.com/watch?v=…`}
                    />
                  ))}
                </div>
              </div>
            </div>

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
          </>
        )}

        {/* Trainer coaching profile */}
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

          {/* Players section — available for non-trainers */}
        {role !== "trainer" && (
          <PlayerProfilesList
            initialProfiles={form.childProfiles}
            onChange={(profiles) => setForm((f) => ({ ...f, childProfiles: profiles }))}
          />
        )}

        {/* Visibility toggle — players/parents only */}
        {role !== "trainer" && (
          <div className="bg-card border rounded-2xl p-5">
            <button type="button"
              onClick={() => setForm((f) => ({ ...f, isHidden: !f.isHidden }))}
              className="flex items-center justify-between w-full">
              <div className="text-left">
                <p className="font-semibold text-sm">Hide my profile from Connect</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {form.isHidden ? "Your profile is hidden — only you can see it" : "Your profile is visible to other players and trainers"}
                </p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${form.isHidden ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isHidden ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>
        )}

        {/* Archive — trainers only */}
        {role === "trainer" && (
          <div className="bg-card border rounded-2xl p-5 border-amber-200" style={{ backgroundColor: "#fffbeb" }}>
            <p className="text-sm font-semibold mb-1">Archive your profile</p>
            <p className="text-xs text-muted-foreground mb-3">
              Archiving hides your profile and sessions from all listings. You can un-archive at any time.
            </p>
            <Button variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-50"
              onClick={async () => {
                if (!confirm("Archive your trainer profile? Players won't be able to find you until you un-archive.")) return;
                await fetch("/api/trainer/profile/archive", { method: "POST" });
                alert("Profile archived.");
              }}>
              Archive profile
            </Button>
          </div>
        )}

        {!hasUploadedPhoto && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center font-medium">
            A profile photo is required — upload one above to save.
          </p>
        )}
        <Button className="w-full" style={{ backgroundColor: !hasUploadedPhoto ? "#e5e7eb" : "#DC373E", color: !hasUploadedPhoto ? "#9ca3af" : "white" }}
          disabled={saving || uploadingPhoto} onClick={handleSave}>
          {saving ? "Saving…" : !hasUploadedPhoto ? "Upload a photo to save" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
