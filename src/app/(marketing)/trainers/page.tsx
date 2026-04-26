"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trainers as mockTrainers } from "@/lib/mock-data";

interface TrainerRow {
  id: string;
  name: string;
  photo: string;
  bio: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  specialties: string[];
  certifications: string[];
  skillLevels: string[];
}

const sports = ["All Sports", "Soccer", "Basketball", "Football", "Baseball", "Tennis"];

export default function TrainersPage() {
  const [allTrainers, setAllTrainers] = useState<TrainerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  useEffect(() => {
    fetch("/api/trainers")
      .then((r) => r.json())
      .then((data) => { setAllTrainers(Array.isArray(data) ? data : mockTrainers as TrainerRow[]); setLoading(false); })
      .catch(() => { setAllTrainers(mockTrainers as TrainerRow[]); setLoading(false); });
  }, []);

  const cities = useMemo(() =>
    ["All Cities", ...Array.from(new Set(allTrainers.map((t) => t.city).filter(Boolean))).sort()],
    [allTrainers]
  );

  const filtered = useMemo(() =>
    allTrainers.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.city?.toLowerCase().includes(q) &&
          !(t.specialties ?? []).some((s) => s.toLowerCase().includes(q))) return false;
      }
      if (selectedCity !== "All Cities" && t.city !== selectedCity) return false;
      return true;
    }),
    [allTrainers, search, selectedCity]
  );

  return (
    <div>
      {/* Header */}
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Find a Trainer</h1>
          <p className="text-muted-foreground mb-6">
            {loading ? "Loading trainers…" : `${filtered.length} coach${filtered.length === 1 ? "" : "es"} available near you`}
          </p>

          <div className="flex gap-2 max-w-2xl mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search by name, city, or specialty…"
                value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <button key={c} onClick={() => setSelectedCity(c)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={selectedCity === c
                  ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
                  : { borderColor: "#e2e8f0", color: "#475569" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-lg mb-2">No trainers found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <Link key={t.id} href={`/groups/${t.id}`}
                className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all">
                {/* Header */}
                <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#0F3154" }}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                      <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base leading-tight">{t.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-white/80 text-xs font-semibold">{t.rating}</span>
                        <span className="text-white/40 text-xs">({t.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{t.city}{t.state ? `, ${t.state}` : ""}</span>
                    <span className="mx-1">·</span>
                    <span>{t.yearsExperience} yrs exp</span>
                  </div>

                  {t.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">{t.bio.replace(/<[^>]*>/g, "")}</p>
                  )}

                  {(t.specialties ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(t.specialties ?? []).slice(0, 3).map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                          style={{ backgroundColor: "#0F3154", opacity: 0.85 }}>{s}</span>
                      ))}
                      {(t.specialties ?? []).length > 3 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          +{(t.specialties ?? []).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <div className="text-xs font-semibold text-[#DC373E] hover:underline">View profile & sessions →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
