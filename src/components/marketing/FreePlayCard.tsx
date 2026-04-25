"use client";

import { MapPin, Clock, Users, Share2, CalendarDays } from "lucide-react";
import type { FreePlayEvent } from "@/lib/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

interface Props {
  event: FreePlayEvent;
}

export function FreePlayCard({ event }: Props) {
  const spotsLeft = event.playersNeeded - event.playersConfirmed;
  const almostFull = spotsLeft <= 2 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;
  const fillPct = Math.round((event.playersConfirmed / event.playersNeeded) * 100);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/free-play/${event.id}`);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header band */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#0F3154" }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{event.sportEmoji}</span>
            <span className="text-white/60 text-sm font-medium">{event.sport}</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-600 text-white shrink-0">
            Free Play
          </span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-1">{event.title}</h3>

        {/* Date/time — prominent */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-white/70 shrink-0" />
            <span className="text-white font-semibold text-sm">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-white/70 shrink-0" />
            <span className="text-white font-semibold text-sm">{event.time}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.venue}, {event.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {event.duration} min
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">Level:</span>{" "}
            {event.competitiveTier}
          </span>
          <span>
            <span className="font-medium text-foreground">Ages:</span>{" "}
            {event.ageRange}
          </span>
        </div>

        {/* Players */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Users className="h-3.5 w-3.5" />
              {event.playersConfirmed} of {event.playersNeeded} confirmed
            </span>
            {isFull ? (
              <span className="text-xs font-bold text-gray-500">Full</span>
            ) : almostFull ? (
              <span className="text-xs font-bold text-[#DC373E]">
                {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {spotsLeft} spots open
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                backgroundColor: isFull ? "#6B7280" : almostFull ? "#DC373E" : "#15803D",
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          disabled={isFull}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: isFull ? "#6B7280" : "#DC373E" }}
        >
          {isFull ? "Game Full" : "RSVP"}
        </button>
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-muted transition-colors shrink-0"
          aria-label="Copy link"
          title="Copy link"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
