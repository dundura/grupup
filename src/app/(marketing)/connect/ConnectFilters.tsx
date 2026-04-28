"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const SPORTS = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Lacrosse", "Volleyball", "Speed & Agility"];

export default function ConnectFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const sport = params.get("sport") ?? "";
  const [city, setCity] = useState(params.get("city") ?? "");
  const [zip, setZip] = useState(params.get("zip") ?? "");

  useEffect(() => {
    setCity(params.get("city") ?? "");
    setZip(params.get("zip") ?? "");
  }, [params]);

  const push = useCallback((overrides: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (!v) next.delete(k); else next.set(k, v);
    }
    router.push(`/connect?${next.toString()}`, { scroll: false });
  }, [params, router]);

  function applyText() {
    push({ city: city.trim() || null, zip: zip.trim() || null });
  }

  const hasFilters = sport || params.get("city") || params.get("zip");

  return (
    <div className="space-y-3">
      {/* Location inputs */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={city} onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyText()}
          placeholder="City"
          className="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/30 w-32"
        />
        <input
          value={zip} onChange={(e) => setZip(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyText()}
          placeholder="Zip code"
          className="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/30 w-28"
        />
        {(city !== (params.get("city") ?? "") || zip !== (params.get("zip") ?? "")) && (
          <button onClick={applyText}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: "#0F3154" }}>
            Search
          </button>
        )}
      </div>

      {/* Sport chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {SPORTS.map((s) => (
          <button key={s} onClick={() => push({ sport: sport === s ? null : s })}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            style={sport === s
              ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
              : { backgroundColor: "white", borderColor: "#e2e8f0", color: "#475569" }}>
            {s}
          </button>
        ))}
        {hasFilters && (
          <button onClick={() => { setCity(""); setZip(""); router.push("/connect", { scroll: false }); }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
