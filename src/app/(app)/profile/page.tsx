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
const improvementAreaOptions = ["Ball Skills", "Finishing", "Defending", "1v1", "Passing", "Shooting", "Speed & Agility", "Dribbling", "Heading", "Goalkeeping", "Game Sense", "Set Pieces"];
const levelsBySport: Record<string, string[]> = {
  Soccer:            ["Recreational", "Club", "Academy", "Elite"],
  Basketball:        ["Recreational", "AAU", "Varsity", "Elite"],
  Football:          ["Flag", "JV", "Varsity", "Elite"],
  Baseball:          ["Recreational", "Travel Ball", "Select", "Elite"],
  Tennis:            ["Beginner", "Intermediate", "Advanced", "Elite"],
  Lacrosse:          ["Recreational", "Club", "Varsity", "Elite"],
  Volleyball:        ["Recreational", "Club", "Varsity", "Elite"],
  Swimming:          ["Recreational", "Competitive", "Advanced", "Elite"],
  "Speed & Agility": ["Beginner", "Intermediate", "Advanced", "Elite"],
};
const defaultLevels = ["Beginner", "Intermediate", "Advanced", "Elite"];

function getLevels(sports: string[]): string[] {
  if (!sports.length) return defaultLevels;
  // Use the first selected sport's levels
  return levelsBySport[sports[0]] ?? defaultLevels;
}
const leaguesBySport: Record<string, string[]> = {
  Soccer:            ["ECNL", "MLS Next", "NPL (National Premier League)", "USYSA", "US Club Soccer", "Elite Academy", "High School Varsity", "College", "Recreational"],
  Basketball:        ["AAU", "NBA Academy", "Nike EYBL", "High School Varsity", "College", "Recreational"],
  Football:          ["Pop Warner", "USA Football", "High School Varsity", "College", "Recreational"],
  Baseball:          ["Little League", "USSSA", "Perfect Game", "Travel Ball", "High School Varsity", "College", "Recreational"],
  Tennis:            ["USTA", "High School Varsity", "College", "Recreational"],
  Lacrosse:          ["US Lacrosse", "High School Varsity", "College", "Recreational"],
  Volleyball:        ["USA Volleyball", "High School Varsity", "College", "Recreational"],
  Swimming:          ["USA Swimming", "High School Varsity", "College", "Recreational"],
  "Speed & Agility": ["High School Varsity", "College", "Club", "Recreational"],
};
const defaultLeagues = ["High School Varsity", "College", "Club", "Recreational"];

function getLeagues(sports: string[]): string[] {
  if (!sports.length) return defaultLeagues;
  const set = new Set<string>();
  for (const s of sports) {
    for (const l of (leaguesBySport[s] ?? defaultLeagues)) set.add(l);
  }
  set.add("Other");
  return Array.from(set);
}
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
    state?: string; zipCode?: string; profileSlug?: string;
    availableForFreePlay?: boolean; openToTrain?: boolean;
    position?: string; improvementAreas?: string[];
    socials?: { instagram?: string; tiktok?: string; twitter?: string; youtube?: string; facebook?: string; snapchat?: string };
    playerSports?: string[]; videoLinks?: string[]; childProfiles?: ChildProfile[];
  };

  function buildForm(u: typeof user) {
    const m = (u?.publicMetadata ?? {}) as typeof meta;
    return {
      firstName: u?.firstName ?? "",
      lastName: u?.lastName ?? "",
      country: m.country ?? "",
      state: m.state ?? "",
      city: m.city ?? "",
      zipCode: m.zipCode ?? "",
      sport: m.sport ?? "",
      selectedSports: (m.sports ?? []) as string[],
      selectedPlayerSports: (m.playerSports ?? (m.sport ? [m.sport] : [])) as string[],
      level: m.level ?? "",
      bio: m.bio || (m.role !== "trainer" ? "Looking for group training sessions to improve my skills and connect with other players near me." : ""),
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
      availableForFreePlay: m.availableForFreePlay ?? false,
      openToTrain: m.openToTrain ?? false,
      disableMessages: (m as any).disableMessages ?? false,
      position: m.position ?? "",
      improvementAreas: (m.improvementAreas ?? ["Ball Skills"]) as string[],
      socials: m.socials ?? {},
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

  function toggleList(key: "selectedCerts" | "selectedSpecialties" | "selectedSports" | "selectedPlayerSports" | "improvementAreas", val: string) {
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
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleReCrop() {
    if (!form.photo) { fileRef.current?.click(); return; }
    try {
      const res = await fetch(form.photo);
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setCropSrc(dataUrl);
    } catch {
      fileRef.current?.click();
    }
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
    if (role !== "trainer" && form.selectedPlayerSports.length === 0) {
      alert("Please select at least one sport before saving.");
      return;
    }
    if (role !== "trainer" && !form.level) {
      alert("Please select a skill level before saving.");
      return;
    }
    setSaving(true);
    const leagueValue = form.league === "Other" ? form.leagueOther : form.league;
    const cleanedVideos = form.videoLinks.map((v) => v.trim()).filter(Boolean);
    const improvementAreas = ((form as any).improvementAreas as string[]).filter(Boolean);
    await completeOnboarding({ role: meta.role, ...form, league: leagueValue, videoLinks: cleanedVideos, childProfiles: (form as any).childProfiles, state: (form as any).state, zipCode: (form as any).zipCode, customSlug: (form as any).customSlug, position: (form as any).position, improvementAreas: improvementAreas.length ? improvementAreas : ["Ball Skills"], socials: (form as any).socials });
    setSaved(true);
    setSaving(false);
  }

  if (!isLoaded) return <div className="py-12 text-muted-foreground">Loading…</div>;

  const role = meta.role ?? "player";
  const photoSrc = form.photo || user?.imageUrl || "";
  const profileExists = !!(meta as any).onboardingComplete;

  // If no onboarding done yet, show a simple prompt
  if (!profileExists && !meta.role) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-5xl mb-4">👤</div>
        <h1 className="text-2xl font-bold mb-2">Add your profile</h1>
        <p className="text-muted-foreground mb-6">Choose whether you're a player or a coach to get started.</p>
        <Button style={{ backgroundColor: "#DC373E" }} asChild>
          <Link href="/onboarding">Add Profile</Link>
        </Button>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">{profileExists ? "My Profile" : "Add Profile"}</h1>
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

        {/* Players section — parents only, shown first */}
        {role === "parent" && (
          <PlayerProfilesList
            initialProfiles={(form as any).childProfiles ?? []}
            onChange={(profiles) => setForm((f) => ({ ...f, childProfiles: profiles }))}
          />
        )}

        {/* Photo upload */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Profile Photo</h2>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" onClick={handleReCrop} disabled={uploadingPhoto}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-[#f0f4f9] shrink-0 group cursor-pointer">
              {photoSrc ? (
                <Image src={photoSrc} alt="Profile" fill className="object-cover" sizes="96px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: "#0F3154" }}>
                  {(form.firstName?.[0] ?? "?").toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={uploadingPhoto} onClick={() => fileRef.current?.click()}>
                  {uploadingPhoto ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</> : <><Camera className="h-4 w-4 mr-1.5" /> Change photo</>}
                </Button>
                {hasUploadedPhoto && (
                  <Button variant="outline" size="sm" disabled={uploadingPhoto} onClick={handleReCrop}>
                    Re-crop
                  </Button>
                )}
              </div>
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
          {(form as any).country && (form as any).country !== "Other" && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">
                {(form as any).country === "Canada" ? "Province / Territory" :
                 (form as any).country === "United Kingdom" ? "Region" : "State / Province"}
              </label>
              {["United States","Canada","United Kingdom","Australia"].includes((form as any).country) ? (
                <select value={(form as any).state ?? ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select</option>
                  {((form as any).country === "United States" ? ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington D.C."] :
                    (form as any).country === "Canada" ? ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"] :
                    (form as any).country === "United Kingdom" ? ["England","Scotland","Wales","Northern Ireland"] :
                    ["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania","Australian Capital Territory","Northern Territory"]
                  ).map((s: string) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <Input value={(form as any).state ?? ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="State / Province / Region" />
              )}
            </div>
          )}
          <div className="mb-4">
            <label className="text-sm font-medium mb-1.5 block">City</label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Cary" />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-1.5 block">Zip / Postal code</label>
            <Input value={(form as any).zipCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
              placeholder="e.g. 27513" className="max-w-[180px]" />
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
                <label className="text-sm font-medium mb-2 block">Skill level <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {getLevels(form.selectedPlayerSports).map((l) => (
                    <button key={l} type="button" onClick={() => set("level", l)}
                      className="py-2 rounded-lg text-sm font-medium border transition-colors text-xs sm:text-sm"
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
                <div className="relative">
                  <Input
                    value={form.league}
                    onChange={(e) => set("league", e.target.value.slice(0, 40))}
                    placeholder="e.g. ECNL, AAU, High School Varsity…"
                    maxLength={40}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {40 - form.league.length}
                  </span>
                </div>
              </div>

              {/* Team */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team / Club</label>
                <Input value={form.team} onChange={(e) => set("team", e.target.value)}
                  placeholder="e.g. NCFC, Charlotte Independence" />
              </div>

              {/* Position */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Position</label>
                <Input value={(form as any).position ?? ""} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  placeholder="e.g. Striker, Midfielder, Defender…" />
              </div>

              {/* Focus Areas */}
              <div>
                <label className="text-sm font-medium mb-2 block">Focus Areas <span className="text-muted-foreground font-normal">(what you want to improve)</span></label>
                <div className="flex flex-wrap gap-2">
                  {improvementAreaOptions.map((a) => (
                    <button key={a} type="button" onClick={() => toggleList("improvementAreas", a)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={(form as any).improvementAreas?.includes(a)
                        ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                        : { borderColor: "#e2e8f0", color: "#475569" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability pills */}
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <div className="space-y-2">
                  {[
                    { key: "availableForFreePlay", label: "Seeking Free Play", desc: "Show on your card that you're open for free play events" },
                    { key: "openToTrain", label: "Seeking Training", desc: "Show on your card that you're looking for training sessions" },
                  ].map(({ key, label, desc }) => (
                    <button key={key} type="button"
                      onClick={() => setForm((f) => ({ ...f, [key]: !(f as any)[key] }))}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left"
                      style={(form as any)[key]
                        ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                        : { borderColor: "#e2e8f0" }}>
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${(form as any)[key] ? "border-[#0F3154] bg-[#0F3154]" : "border-gray-300"}`}>
                        {(form as any)[key] && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
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

              {/* Socials */}
              <div>
                <label className="text-sm font-medium mb-2 block">Social links <span className="text-muted-foreground font-normal">(optional)</span></label>
                <div className="space-y-2">
                  {[
                    { key: "instagram", label: "Instagram", placeholder: "instagram.com/username" },
                    { key: "tiktok",    label: "TikTok",    placeholder: "tiktok.com/@username" },
                    { key: "twitter",   label: "X / Twitter", placeholder: "x.com/username" },
                    { key: "youtube",   label: "YouTube",   placeholder: "youtube.com/@channel" },
                    { key: "facebook",  label: "Facebook",  placeholder: "facebook.com/username" },
                    { key: "snapchat",  label: "Snapchat",  placeholder: "snapchat.com/add/username" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-20 shrink-0 text-muted-foreground">{label}</span>
                      <Input
                        value={(form as any).socials?.[key] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, socials: { ...(f as any).socials, [key]: e.target.value } }))}
                        placeholder={placeholder}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
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

  
        {/* Profile slug — players/parents only */}
        {role !== "trainer" && (
          <div className="bg-card border rounded-2xl p-5 space-y-3">
            <div>
              <label className="text-sm font-semibold block mb-1">Your Connect URL</label>
              <p className="text-xs text-muted-foreground mb-2">
                grupup.app/connect/<strong>{(meta.profileSlug ?? user?.id ?? "").slice(0, 28)}</strong>
              </p>
              <div className="flex gap-2 items-center">
                <Input
                  value={(form as any).customSlug ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                    setForm((f) => ({ ...f, customSlug: val }));
                  }}
                  placeholder="custom-url-slug"
                  className="text-sm max-w-[240px]"
                />
                <span className="text-xs text-muted-foreground">Letters, numbers, hyphens only</span>
              </div>
            </div>
          </div>
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

        <Button className="w-full" style={{ backgroundColor: "#DC373E" }}
          disabled={saving || uploadingPhoto} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
