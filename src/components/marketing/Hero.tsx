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

const highlights = [
  { icon: "🔴", title: "Save Money",  desc: "Up to 60% less than private training" },
  { icon: "📍", title: "Train Nearby", desc: "Convenient local group sessions" },
  { icon: "🟡", title: "Have Fun",    desc: "Get fit together with friends" },
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
    <section className="bg-[#f4f6f9] px-3 sm:px-6 lg:px-8 pt-6 pb-0">
      <div className="relative rounded-2xl max-w-7xl mx-auto overflow-hidden" style={{ backgroundColor: "#0d1f3c" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative px-5 sm:px-8 lg:px-12 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ── Left / main column ── */}
            <div className="flex flex-col gap-4">

              {/* Text block */}
              <div>
                <p className="text-[#DC373E] font-semibold text-xs uppercase tracking-wider mb-2">
                  The only platform built for group sports training
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-1">
                  Group sports training
                </h1>
                <p className="text-[#DC373E] uppercase leading-tight mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[56px]"
                  style={{ fontFamily: "var(--font-barlow-condensed)", fontWeight: 800 }}>
                  Convenient, Affordable, Social
                </p>
                <p className="text-white/80 text-base sm:text-lg font-medium">
                  Train together, split the cost, level up your game.
                </p>
              </div>

              {/* Search bar — stacked on mobile, pill on desktop */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:bg-white sm:rounded-full sm:shadow-md sm:pl-4 sm:pr-1.5 sm:py-1.5">
                {/* Mobile: individual fields */}
                <div className="flex gap-2 sm:contents">
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2.5 sm:bg-transparent sm:rounded-none sm:px-0 sm:py-0">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Sport or keyword..."
                      className="flex-1 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent min-w-0"
                    />
                  </div>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="bg-white rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer sm:bg-transparent sm:rounded-none sm:border-l sm:border-gray-200 sm:pl-3 sm:pr-2"
                  >
                    {sports.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <button type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm text-white whitespace-nowrap"
                  style={{ backgroundColor: "#DC373E" }}>
                  <Search className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Find a Group Session</span>
                  <span className="sm:hidden">Find Sessions</span>
                </button>
              </form>

              {/* Soccer image */}
              <div className="relative rounded-2xl overflow-hidden" style={{ height: "260px" }}>
                <img
                  src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777378113162-feqi88.png"
                  alt="Soccer players training"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 20%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-4 text-white font-bold text-base drop-shadow">Soccer</p>
              </div>

              {/* Highlights — visible on mobile, hidden on lg (shown in right col) */}
              <div className="grid grid-cols-3 gap-2 lg:hidden">
                {highlights.map((item) => (
                  <div key={item.title} className="bg-white rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-gray-900 font-bold text-xs leading-tight">{item.title}</p>
                    <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>


            </div>

            {/* ── Right column (desktop only) ── */}
            <div className="hidden lg:flex flex-col gap-3">

              <div className="flex flex-col gap-2" style={{ height: "380px" }}>
                {/* Basketball with floating pills */}
                <div className="relative" style={{ height: "185px" }}>
                  <div className="relative rounded-2xl overflow-hidden h-full">
                    <img
                      src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777377344723-zsegtl.png"
                      alt="Basketball players"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">Basketball</p>
                  </div>
                  <div className="absolute -top-2 -right-2 rounded-lg shadow-xl px-2 py-1.5 z-10"
                    style={{ backgroundColor: "#0F3154", animation: "heroFloat 5s ease-in-out infinite" }}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      <p className="text-[9px] font-bold text-white/60 uppercase tracking-wide">Session booked</p>
                    </div>
                    <p className="text-[10px] font-semibold text-white">Tue 5:30 PM · 6 players</p>
                    <p className="text-[9px] text-white/60 mt-0.5">Basketball · Cary, NC</p>
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white rounded-lg shadow-xl px-2 py-1.5 z-10"
                    style={{ animation: "heroFloat 5s ease-in-out 2s infinite" }}>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Why group?</p>
                    <p className="text-[10px] font-semibold text-gray-800">60% less than private</p>
                  </div>
                </div>

                {/* Football */}
                <div className="relative rounded-2xl overflow-hidden flex-1">
                  <img
                    src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777377633398-c04se8.png"
                    alt="Football players"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">Football</p>
                </div>
              </div>

              {/* Highlights card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm divide-y divide-gray-100">
                {highlights.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
