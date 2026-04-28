"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Camera, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhotoCropModal } from "@/components/ui/PhotoCropModal";

const MAX_PROFILES = 6;
const sports = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Swimming", "Lacrosse", "Volleyball", "Speed & Agility"];
const leagues = ["ECNL", "MLS Next", "NPL (National Premier League)", "USYSA", "US Club Soccer", "Elite Academy", "High School Varsity", "College", "Recreational", "Other"];
const levels = ["Beginner", "Intermediate", "Advanced", "Elite"];
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

export interface ChildProfile {
  id: string;
  name: string;
  photo: string;
  sports: string[];
  level: string;
  league: string;
  team: string;
  birthYear: string;
  gender: string;
  bio: string;
  isHidden: boolean;
  slug: string;
}

function emptyProfile(): ChildProfile {
  return {
    id: crypto.randomUUID(),
    name: "", photo: "", sports: [], level: "", league: "",
    team: "", birthYear: "", gender: "", bio: "", isHidden: false,
    slug: "",
  };
}

function generateSlug(name: string, id: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "player";
  return `${base}-${id.slice(0, 6)}`;
}

export default function PlayerProfilesList({
  initialProfiles,
  onChange,
}: {
  initialProfiles: ChildProfile[];
  onChange: (profiles: ChildProfile[]) => void;
}) {
  const [profiles, setProfiles] = useState<ChildProfile[]>(initialProfiles);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cropData, setCropData] = useState<{ profileId: string; src: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function update(id: string, patch: Partial<ChildProfile>) {
    const updated = profiles.map((p) => p.id === id ? { ...p, ...patch } : p);
    setProfiles(updated);
    onChange(updated);
  }

  function toggleSport(id: string, sport: string) {
    const p = profiles.find((x) => x.id === id)!;
    const next = p.sports.includes(sport) ? p.sports.filter((s) => s !== sport) : [...p.sports, sport];
    update(id, { sports: next });
  }

  function addProfile() {
    if (profiles.length >= MAX_PROFILES) return;
    const p = emptyProfile();
    const updated = [...profiles, p];
    setProfiles(updated);
    onChange(updated);
    setExpandedId(p.id);
  }

  function removeProfile(id: string) {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    onChange(updated);
    if (expandedId === id) setExpandedId(null);
  }

  async function handleCropApply(blob: Blob, profileId: string) {
    setCropData(null);
    setUploading(profileId);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: "photo.jpg", contentType: "image/jpeg" }),
      });
      const { uploadUrl, cdnUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": "image/jpeg" } });
      update(profileId, { photo: cdnUrl });
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Players</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{profiles.length}/{MAX_PROFILES} profiles</p>
        </div>
        {profiles.length < MAX_PROFILES && (
          <Button variant="outline" size="sm" onClick={addProfile}>
            <Plus className="h-4 w-4 mr-1" /> Add player
          </Button>
        )}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No player profiles yet. Click "Add player" to get started.
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => {
          const isOpen = expandedId === p.id;
          return (
            <div key={p.id} className="border rounded-xl overflow-hidden">
              {/* Collapsed header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                  {p.photo ? (
                    <Image src={p.photo} alt={p.name || "Player"} fill className="object-cover" sizes="40px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                      {p.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name || "Unnamed player"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[p.sports.slice(0, 2).join(", "), p.birthYear, p.league].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setExpandedId(isOpen ? null : p.id)}
                    className="p-1.5 rounded-lg hover:bg-[#f0f4f9] transition-colors text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => removeProfile(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded edit form */}
              {isOpen && (
                <div className="px-4 py-4 space-y-4 border-t">
                  {/* Photo */}
                  {cropData?.profileId === p.id && (
                    <PhotoCropModal
                      imageSrc={cropData.src}
                      onApply={(blob) => handleCropApply(blob, p.id)}
                      onCancel={() => setCropData(null)}
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="64px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                          {p.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        ref={(el) => { fileRefs.current[p.id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setCropData({ profileId: p.id, src: reader.result as string });
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                      <Button variant="outline" size="sm" disabled={uploading === p.id}
                        onClick={() => fileRefs.current[p.id]?.click()}>
                        {uploading === p.id
                          ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</>
                          : <><Camera className="h-4 w-4 mr-1.5" /> Photo</>}
                      </Button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Player name</label>
                    <Input value={p.name} onChange={(e) => update(p.id, { name: e.target.value, slug: generateSlug(e.target.value, p.id) })}
                      placeholder="e.g. Emma Crawford" />
                  </div>

                  {/* Sports */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sports</label>
                    <div className="flex flex-wrap gap-2">
                      {sports.map((s) => (
                        <button key={s} type="button" onClick={() => toggleSport(p.id, s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                          style={p.sports.includes(s) ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level + Birth year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Skill level</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {levels.map((l) => (
                          <button key={l} type="button" onClick={() => update(p.id, { level: l })}
                            className="py-1.5 rounded-lg text-xs font-medium border transition-colors"
                            style={p.level === l ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Birth year</label>
                      <select value={p.birthYear} onChange={(e) => update(p.id, { birthYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Year</option>
                        {birthYears.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* League + Team */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">League</label>
                      <select value={p.league} onChange={(e) => update(p.id, { league: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select</option>
                        {leagues.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Team / Club</label>
                      <Input value={p.team} onChange={(e) => update(p.id, { team: e.target.value })} placeholder="e.g. NCFC" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gender</label>
                    <div className="flex gap-2 flex-wrap">
                      {["Male", "Female", "Non-binary"].map((g) => (
                        <button key={g} type="button" onClick={() => update(p.id, { gender: g })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                          style={p.gender === g ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" } : { borderColor: "#e2e8f0", color: "#475569" }}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Looking for <span className="text-muted-foreground font-normal">(max 200 chars)</span></label>
                    <textarea value={p.bio} onChange={(e) => update(p.id, { bio: e.target.value.slice(0, 200) })}
                      rows={2} maxLength={200}
                      placeholder="e.g. Looking for group soccer sessions to work on finishing…"
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                    <p className="text-xs text-muted-foreground mt-0.5">{p.bio.length}/200</p>
                  </div>

                  {/* Hide toggle */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <p className="text-sm font-medium">Hide from Connect</p>
                    <button type="button" onClick={() => update(p.id, { isHidden: !p.isHidden })}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${p.isHidden ? "bg-[#0F3154]" : "bg-gray-200"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${p.isHidden ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
