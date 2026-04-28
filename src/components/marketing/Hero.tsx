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

        <div className="relative px-6 sm:px-8 lg:px-12 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-center">

            {/* ── Left column ── */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-tight mb-2">
                Group sports training
              </h1>
              <p className="text-[#DC373E] font-bold text-xs uppercase tracking-widest mb-2">
                Convenient, Affordable, Social
              </p>
              <p className="text-white/60 text-sm mb-6">
                Train together, split the cost, level up your game.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-full shadow-md flex items-center gap-1 pl-4 pr-1.5 py-1.5 mb-5"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm text-white whitespace-nowrap shrink-0"
                  style={{ backgroundColor: "#DC373E" }}
                >
                  Find a Group Session
                </button>
              </form>

              {/* Highlight cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🔴", title: "Save Money",   desc: "Up to 60% less than private training" },
                  { icon: "📍", title: "Train Nearby",  desc: "Convenient local group sessions" },
                  { icon: "🟡", title: "Have Fun",      desc: "Get fit together with friends" },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-2xl p-3.5 flex items-start gap-2.5 shadow-sm">
                    <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-gray-900 font-bold text-xs">{item.title}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column: asymmetric image grid ── */}
            <div className="hidden lg:grid grid-cols-2 gap-2" style={{ height: "380px" }}>

              {/* Left: tall Soccer image */}
              <div className="relative rounded-2xl overflow-hidden row-span-2 h-full">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80"
                  alt="Soccer training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">
                  Soccer
                </p>
              </div>

              {/* Top right: Basketball */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80"
                  alt="Basketball training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">
                  Basketball
                </p>
              </div>

              {/* Bottom right: Football */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80"
                  alt="Football training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">
                  Football
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
