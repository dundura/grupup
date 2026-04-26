"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users, ChevronRight, ShieldCheck } from "lucide-react";

interface SessionPackage {
  id: number;
  title: string;
  pricePerPlayer: number;
  sessionType: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  city: string;
  spotsLeft: number;
  spotsTotal: number;
}

interface Props {
  trainerId: string;
  trainerName: string;
  sessions: SessionPackage[];
}

export function PackageBooking({ trainerId, trainerName, sessions }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(sessions[0]?.id ?? null);
  const firstName = trainerName.split(" ")[0];

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
        <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold mb-1">No sessions available yet</p>
        <p className="text-sm text-muted-foreground">Check back soon — {firstName} is setting up their schedule.</p>
      </div>
    );
  }

  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const isFull   = selected.spotsLeft <= 0;

  function formatType(t: string) {
    return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h2 className="font-bold text-base mb-4">Choose a Session Package</h2>

      {/* Package cards */}
      <div className={`grid gap-3 mb-5 ${sessions.length === 1 ? "grid-cols-1" : sessions.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        {sessions.map((s) => {
          const isSelected = s.id === selectedId;
          const full = s.spotsLeft <= 0;
          return (
            <button
              key={s.id}
              type="button"
              disabled={full}
              onClick={() => setSelectedId(s.id)}
              className="rounded-xl border-2 p-4 text-left transition-all relative disabled:opacity-50"
              style={isSelected
                ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                : { borderColor: "#e2e8f0" }}>

              {/* Type badge */}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                style={isSelected
                  ? { backgroundColor: "#0F3154", color: "white" }
                  : { backgroundColor: "#f1f5f9", color: "#475569" }}>
                {formatType(s.sessionType)}
              </span>

              <p className="font-semibold text-sm leading-snug mb-1">{s.title}</p>

              <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                {s.dayOfWeek && s.time && (
                  <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{s.dayOfWeek}s · {s.time}</p>
                )}
                {s.duration > 0 && (
                  <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration} min</p>
                )}
                {s.city && (
                  <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</p>
                )}
                <p className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {full ? "Session full" : `${s.spotsLeft} of ${s.spotsTotal} spots left`}
                </p>
              </div>

              <p className="font-extrabold text-xl" style={{ color: "#0F3154" }}>
                ${s.pricePerPlayer}
                <span className="text-xs font-semibold text-muted-foreground ml-1">/ player</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        {isFull ? (
          <div className="w-full py-3.5 rounded-xl text-center text-sm font-semibold text-white opacity-60 cursor-not-allowed"
            style={{ backgroundColor: "#0F3154" }}>
            Session Full
          </div>
        ) : (
          <Link
            href={`/sessions/${selected.id}/book`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#DC373E" }}>
            Book session with {firstName} <ChevronRight className="h-4 w-4" />
          </Link>
        )}

        <Link href={`/sessions/${selected.id}`}
          className="flex items-center justify-center gap-1 text-sm font-medium hover:underline"
          style={{ color: "#0F3154" }}>
          View full session details →
        </Link>

        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Grupup Guarantee — full refund if your first session doesn't deliver
        </p>
      </div>
    </div>
  );
}
