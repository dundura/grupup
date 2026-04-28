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
      <div
        className="relative rounded-[20px] max-w-7xl mx-auto overflow-hidden"
        style={{ backgroundColor: "#0d1f3c" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative px-6 sm:px-8 lg:px-12 py-10 md:py-12">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-4">
              {/* Text */}
              <div>
                <p className="text-[#DC373E] font-semibold text-sm uppercase tracking-wider mb-3">
                  The only platform built for group sports training
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-2">
                  Group sports training
                </h1>
                <p
                  className="text-[#DC373E] uppercase leading-tight mb-3 text-4xl md:text-5xl lg:text-[56px]"
                  style={{ fontFamily: "var(--font-barlow-condensed)", fontWeight: 800 }}
                >
                  Convenient, Affordable, Social
                </p>
                <p className="text-white text-xl font-medium">
                  Train together, split the cost, level up your game.
                </p>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-full shadow-md flex items-center gap-1 pl-4 pr-1.5 py-1.5"
              >
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by sport..."
                  className="flex-1 py-1.5 px-2 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent min-w-0"
                />
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer pr-2 border-l border-gray-200 pl-3"
                >
                  {sports.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm text-white whitespace-nowrap shrink-0"
                  style={{ backgroundColor: "#DC373E" }}
                >
                  Find a Group Session
                </button>
              </form>

              {/* Big soccer image */}
              <div className="relative rounded-2xl overflow-hidden h-52">
                <img
                  src="https://www.soccer-near-me.com/hero-soccer.webp"
                  alt="Soccer players training"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-4 text-white font-bold text-base drop-shadow">Soccer</p>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="hidden lg:flex flex-col gap-3">

              {/* Two stacked images */}
              <div className="grid grid-cols-1 gap-2" style={{ height: "320px" }}>
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80"
                    alt="Basketball players"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">Basketball</p>

                  {/* Floating pill — top right */}
                  <div className="absolute top-3 right-3 rounded-xl shadow-xl px-3 py-2"
                    style={{ backgroundColor: "#0F3154", animation: "heroFloat 5s ease-in-out infinite" }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Session booked</p>
                    </div>
                    <p className="text-xs font-semibold text-white">Tuesday 5:30 PM · 6 players</p>
                    <p className="text-[10px] text-white/60 mt-0.5">Basketball · Cary, NC</p>
                  </div>

                  {/* Floating pill — bottom left */}
                  <div className="absolute bottom-8 left-3 bg-white rounded-xl shadow-xl px-3 py-2"
                    style={{ animation: "heroFloat 5s ease-in-out 2s infinite" }}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Why group?</p>
                    <p className="text-xs font-semibold text-gray-800">Up to 60% less than private</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1599676551100-b5d55dd2fb39?w=800&q=80"
                    alt="Football players"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">Football</p>
                </div>
              </div>

              {/* Single white highlights card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm divide-y divide-gray-100">
                {[
                  { icon: "🔴", title: "Save Money",   desc: "Up to 60% less than private training" },
                  { icon: "📍", title: "Train Nearby",  desc: "Convenient local group sessions" },
                  { icon: "🟡", title: "Have Fun",      desc: "Get fit together with friends" },
                ].map((item) => (
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
