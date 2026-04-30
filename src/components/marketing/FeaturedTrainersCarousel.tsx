"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { trainers } from "@/lib/mock-data";
import type { Trainer } from "@/lib/types";

const FEATURED = trainers.slice(0, 5);
const INTERVAL = 4000;
const CARD_W = 320;
const GAP = 20;

function pill(t: Trainer): { label: string; bg: string; color: string } | null {
  if (t.reviewCount >= 10)                       return { label: "Highly Rebooked", bg: "#DCFCE7", color: "#166534" };
  if (t.reviewCount >= 5 && t.rating >= 4.8)    return { label: "Top Rated",       bg: "#FEF9C3", color: "#854D0E" };
  if (t.yearsExperience >= 10)                   return { label: "Elite Coach",     bg: "#EDE9FE", color: "#5B21B6" };
  if (t.yearsExperience >= 5)                    return { label: "Popular",         bg: "#DBEAFE", color: "#1E40AF" };
  return null;
}

function TrainerListCard({ trainer: t, active }: { trainer: Trainer; active: boolean }) {
  const specialties = t.specialties.slice(0, 3);
  const badge = pill(t);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-500"
      style={{
        width: CARD_W,
        flexShrink: 0,
        borderColor: active ? "#0F3154" : "#E5E7EB",
        boxShadow: active ? "0 8px 32px rgba(15,49,84,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
        opacity: active ? 1 : 0.5,
        transform: active ? "scale(1)" : "scale(0.95)",
      }}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {t.photo ? (
          <Image
            src={t.photo}
            alt={t.name}
            fill
            className="object-cover object-top"
            sizes={`${CARD_W}px`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-white"
            style={{ backgroundColor: "#0F3154" }}>
            {t.name[0]}
          </div>
        )}

        {/* Overlay pills */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{ backgroundColor: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          )}
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
            In Person
          </span>
          {active && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: "#DC373E" }}>
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-4 flex flex-col flex-1">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link href={`/groups/${t.id}`}
            className="font-bold text-lg leading-snug hover:underline truncate"
            style={{ color: "#0F3154" }}>
            {t.name}
          </Link>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{t.rating.toFixed(1)}</span>
            {t.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">({t.reviewCount})</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {t.bio}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#DC373E]" />
            Trains in {t.city}, {t.state}
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#DC373E]" />
            {t.yearsExperience} years coaching experience
          </p>
        </div>

        {/* Specialty tags */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: "#CBD5E1", color: "#334155", backgroundColor: "#F8FAFC" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Sessions from</span>
              <div>
                <span className="text-xl font-extrabold" style={{ color: "#0F3154" }}>
                  ${t.hourlyRate}
                </span>
                <span className="text-xs text-muted-foreground ml-1">/ session</span>
              </div>
            </div>
            <Link href={`/groups/${t.id}`}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
              style={{ backgroundColor: "#DC373E" }}>
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedTrainersCarousel() {
  const [active, setActive] = useState(0);

  const go = useCallback((next: number) => {
    setActive((next + FEATURED.length) % FEATURED.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % FEATURED.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#f7f8fa" }}>
      <div className="container max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#DC373E" }}>
              Featured Trainers
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Meet the coaches behind the{" "}
              <span style={{ color: "#0F3154" }}>results</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(active - 1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Previous trainer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(active + 1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "#0F3154" }}
              aria-label="Next trainer">
              <ChevronRight className="h-5 w-5" />
            </button>
            <Link href="/trainers"
              className="ml-1 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#DC373E" }}>
              Browse All
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded-full mb-6 overflow-hidden bg-gray-200">
          <div key={active} className="h-full rounded-full"
            style={{ backgroundColor: "#DC373E", animation: `grow ${INTERVAL}ms linear forwards` }} />
        </div>

        {/* Carousel track — clips overflow */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: GAP,
              transform: `translateX(calc(-${active} * ${CARD_W + GAP}px))`,
            }}
          >
            {FEATURED.map((trainer, i) => (
              <TrainerListCard key={trainer.id} trainer={trainer} active={i === active} />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {FEATURED.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              aria-label={`Trainer ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? 28 : 10,
                height: 10,
                backgroundColor: i === active ? "#DC373E" : "#CBD5E1",
              }} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes grow {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
}
