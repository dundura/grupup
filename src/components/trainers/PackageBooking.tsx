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
      <h2 className="font-bold text-base mb-4">Group Sessions</h2>

      {/* Session cards with inline CTAs */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const full = s.spotsLeft <= 0;
          return (
            <div key={s.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                    {formatType(s.sessionType)}
                  </span>
                  <p className="font-semibold text-sm leading-snug">{s.title}</p>
                  <div className="text-xs text-muted-foreground space-y-0.5 mt-1.5">
                    {s.dayOfWeek && s.time && (
                      <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{s.dayOfWeek}s · {s.time} · {s.duration} min</p>
                    )}
                    {s.city && (
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {full ? "Session full" : `${s.spotsLeft} of ${s.spotsTotal} spots left`}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-xl shrink-0" style={{ color: "#0F3154" }}>
                  ${s.pricePerPlayer}<span className="text-xs font-semibold text-muted-foreground">/player</span>
                </p>
              </div>

              {full ? (
                <div className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white opacity-60 cursor-not-allowed"
                  style={{ backgroundColor: "#0F3154" }}>Session Full</div>
              ) : (
                <Link href={`/sessions/${s.id}/book`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: "#DC373E" }}>
                  Book session with {firstName} <ChevronRight className="h-4 w-4" />
                </Link>
              )}
              <Link href={`/sessions/${s.id}`}
                className="flex items-center justify-center gap-1 text-xs font-medium hover:underline"
                style={{ color: "#0F3154" }}>
                View full session details →
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 mt-4">
        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
        GrupUp Guarantee — full refund if your first session doesn't deliver
      </p>
    </div>
  );
}
