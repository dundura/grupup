"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const sports = [
  { label: "All Sports", value: "" },
  { label: "⚽ Soccer", value: "soccer" },
  { label: "🏀 Basketball", value: "basketball" },
  { label: "🏈 Football", value: "football" },
  { label: "⚾ Baseball", value: "baseball" },
  { label: "🎾 Tennis", value: "tennis" },
  { label: "🏊 Swimming", value: "swimming" },
];

const shortcuts = [
  { label: "⚽ Soccer", href: "/groups?sport=soccer" },
  { label: "🏀 Basketball", href: "/groups?sport=basketball" },
  { label: "👥 Group Sessions", href: "/groups?type=group" },
  { label: "🔒 Private Sessions", href: "/groups?type=private" },
  { label: "🎮 Free Play", href: "/free-play" },
  { label: "🤝 Connect", href: "/connect" },
  { label: "👶 Youth", href: "/groups?level=beginner" },
  { label: "🏆 Competitive", href: "/groups?level=advanced" },
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
        className="relative rounded-[20px] overflow-hidden max-w-7xl mx-auto"
        style={{ backgroundColor: "#0F3154" }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative px-6 sm:px-8 lg:px-12 py-16 md:py-24">
          <div className="flex items-center gap-12">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <p className="text-[#DC373E] font-semibold text-sm uppercase tracking-wider mb-4">
                The only platform built for group sports training
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Group training for{" "}
                <span className="text-[#DC373E]">every sport,</span>{" "}
                every crew.
              </h1>

              <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl">
                Find and book group training sessions in soccer, basketball, and more.
                Train with friends, split the cost, and level up together.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6"
              >
                <div className="flex-1 flex items-center gap-2 px-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by city, sport, or coach name..."
                    className="flex-1 py-3 text-gray-800 text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none cursor-pointer sm:w-44"
                >
                  {sports.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-base text-white transition-colors whitespace-nowrap"
                  style={{ backgroundColor: "#DC373E" }}
                >
                  <Search className="h-4 w-4" />
                  Find a Group Session
                </button>
              </form>

              {/* Shortcut pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {shortcuts.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all"
                  >
                    {s.label}
                  </a>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 text-white/50 text-sm">
                <div><span className="text-white font-bold text-xl">8</span> Coaches</div>
                <div><span className="text-white font-bold text-xl">3–8</span> Players/session</div>
                <div><span className="text-white font-bold text-xl">2</span> Sports</div>
                <div><span className="text-white font-bold text-xl">8</span> Cities in NC</div>
              </div>
            </div>

            {/* Right column — image */}
            <div className="hidden lg:block relative w-[420px] shrink-0">
              <img
                src="https://www.soccer-near-me.com/hero-soccer.webp"
                alt="Kids training together in a group sports session"
                className="w-full h-[480px] object-cover rounded-2xl"
              />
              {/* Floating card — top left */}
              <div className="absolute -top-4 -left-8 rounded-xl shadow-xl p-4 w-52" style={{ backgroundColor: "#0F3154" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Session booked</p>
                </div>
                <p className="text-sm font-semibold text-white">Tuesday 5:30 PM · 6 players</p>
                <p className="text-xs text-white/60 mt-1">Marcus Johnson · Soccer · Cary, NC</p>
              </div>
              {/* Floating card — bottom left */}
              <div className="absolute -bottom-4 -left-8 bg-white rounded-xl shadow-xl p-4 w-56">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Why group?</p>
                <p className="text-sm font-semibold text-gray-800">Up to 60% less than private training</p>
                <p className="text-xs text-gray-500 mt-1">Split the cost, keep the quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
