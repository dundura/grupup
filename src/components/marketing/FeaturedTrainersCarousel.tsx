"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SessionCard } from "@/components/marketing/SessionCard";
import type { GroupSession } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

const INTERVAL = 4500;
const CARD_W = 300;
const GAP = 20;
const ADMIN_EMAIL = "neil@anytime-soccer.com";

export function FeaturedTrainersCarousel() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [active, setActive] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isAdmin = user?.emailAddresses?.some(
    (e) => e.emailAddress === ADMIN_EMAIL
  ) ?? false;

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data: GroupSession[]) => {
        if (!Array.isArray(data)) return;
        const featured = data.filter((s) => s.isFeatured);
        setSessions(featured.length > 0 ? featured : data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const go = useCallback((next: number) => {
    if (sessions.length === 0) return;
    setActive((next + sessions.length) % sessions.length);
  }, [sessions.length]);

  useEffect(() => {
    if (sessions.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % sessions.length), INTERVAL);
    return () => clearInterval(id);
  }, [sessions.length]);

  async function toggleFeatured(e: React.MouseEvent, session: GroupSession) {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId === session.id) return;
    setTogglingId(session.id);
    const newVal = !session.isFeatured;
    try {
      const res = await fetch("/api/admin/feature-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, featured: newVal }),
      });
      if (res.ok) {
        // Refresh session list
        const data: GroupSession[] = await fetch("/api/sessions").then((r) => r.json());
        if (Array.isArray(data)) {
          const featured = data.filter((s) => s.isFeatured);
          setSessions(featured.length > 0 ? featured : data.slice(0, 5));
          setActive(0);
        }
      }
    } finally {
      setTogglingId(null);
    }
  }

  if (sessions.length === 0) return null;

  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: "#f7f8fa" }}>
      <div className="container max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#DC373E" }}>
              Featured Group Sessions
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Train together,{" "}
              <span style={{ color: "#0F3154" }}>save together</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(active - 1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(active + 1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "#0F3154" }}
              aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
            <a href="/groups"
              className="ml-1 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#DC373E" }}>
              Browse All
            </a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded-full mb-6 overflow-hidden bg-gray-200">
          <div key={active} className="h-full rounded-full"
            style={{ backgroundColor: "#DC373E", animation: `grow ${INTERVAL}ms linear forwards` }} />
        </div>

        {/* Carousel track */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: GAP,
              transform: `translateX(calc(-${active} * ${CARD_W + GAP}px))`,
            }}
          >
            {sessions.map((session, i) => {
              const isActive = i === active;
              return (
                <div
                  key={session.id}
                  className="relative transition-all duration-500"
                  style={{
                    width: CARD_W,
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.5,
                    transform: isActive ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  <SessionCard session={session} compact />

                  {/* Admin star — only neil@anytime-soccer.com sees this */}
                  {isAdmin && (
                    <button
                      onClick={(e) => toggleFeatured(e, session)}
                      disabled={togglingId === session.id}
                      title={session.isFeatured ? "Remove from featured" : "Feature this session"}
                      className="absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full shadow-lg border transition-colors"
                      style={{
                        backgroundColor: session.isFeatured ? "#DC373E" : "white",
                        borderColor: session.isFeatured ? "#DC373E" : "#e2e8f0",
                      }}
                    >
                      <Star
                        className="h-4 w-4"
                        style={{ color: session.isFeatured ? "white" : "#94a3b8" }}
                        fill={session.isFeatured ? "white" : "none"}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {sessions.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Session ${i + 1}`}
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
