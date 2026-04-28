"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const sports = [
  { label: "All Sports", value: "" },
  { label: "⚽ Soccer", value: "soccer" },
  { label: "🏀 Basketball", value: "basketball" },
  { label: "🏈 Football", value: "football" },
  { label: "⚾ Baseball", value: "baseball" },
  { label: "🎾 Tennis", value: "tennis" },
  { label: "🏊 Swimming", value: "swimming" },
];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (sport) params.set("sport", sport);
    router.push(`/groups${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="bg-[#f4f6f9] px-4 sm:px-6 lg:px-8 pt-6 pb-0">
      <div className="relative rounded-[20px] max-w-7xl mx-auto overflow-hidden" style={{ backgroundColor: "#0F3154" }}>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative px-6 sm:px-8 lg:px-12 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-center">

            {/* ── Left: content ── */}
            <div>
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white leading-tight mb-2">
                Group sports training
              </h1>
              <p className="text-[#DC373E] font-bold text-sm uppercase tracking-widest mb-3">
                Convenient, Affordable, Social
              </p>
              <p className="text-white/70 text-base mb-7">
                Train together, split the cost, level up your game.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch}
                className="bg-white rounded-xl shadow-lg p-1.5 flex flex-col sm:flex-row gap-1.5 mb-7">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by sport..."
                    className="flex-1 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none cursor-pointer sm:w-36"
                >
                  {sports.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white whitespace-nowrap"
                  style={{ backgroundColor: "#DC373E" }}>
                  Find a Group Session
                </button>
              </form>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "🔴", title: "Save Money",   desc: "Up to 60% less than private training" },
                  { icon: "📍", title: "Train Nearby",  desc: "Convenient local group sessions" },
                  { icon: "🟡", title: "Have Fun",      desc: "Get fit together with friends" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5 bg-white/10 border border-white/10 rounded-xl p-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-xs">{item.title}</p>
                      <p className="text-white/60 text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: image grid ── */}
            <div className="hidden lg:grid grid-cols-2 gap-2 h-[400px]">
              {/* Large left image — Soccer */}
              <div className="relative rounded-2xl overflow-hidden row-span-2">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80"
                  alt="Soccer training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm">Soccer</p>
              </div>
              {/* Top right — Basketball */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80"
                  alt="Basketball training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm">Basketball</p>
              </div>
              {/* Bottom right — Running */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80"
                  alt="Running training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm">Running</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
