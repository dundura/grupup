"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, Star, Bell, Share2, Check } from "lucide-react";
import type { GroupSession } from "@/lib/types";
import { SESSION_TYPE_LABELS, SESSION_TYPE_SPOTS } from "@/lib/types";

const skillColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-orange-100 text-orange-700",
  Elite: "bg-purple-100 text-purple-700",
};

interface SessionCardProps {
  session: GroupSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const [interested, setInterested] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleInterested(e: React.MouseEvent) {
    e.preventDefault();
    setInterested((v) => !v);
    // When marked interested, followers are notified so they can join together
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.origin}/sessions/${session.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const spotsFilled = session.totalSpots - session.spotsLeft;
  const fillPct = Math.round((spotsFilled / session.totalSpots) * 100);
  const almostFull = session.spotsLeft <= 2;

  const offer = session.specialOffer;
  const discountedPrice = offer
    ? offer.discountPct === 100
      ? 0
      : Math.round(session.pricePerPlayer * (1 - offer.discountPct / 100))
    : null;

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group block bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
    >
      {/* Cover photo */}
      {session.coverPhoto && (
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image src={session.coverPhoto} alt={session.title} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" sizes="400px" unoptimized />
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        {offer && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: "#DC373E", color: "#fff" }}>
            🏷️ {offer.label}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl leading-none">{session.sportEmoji}</span>
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{session.sport}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs font-semibold">{SESSION_TYPE_LABELS[session.sessionType]}</span>
            </div>
            <h3 className="font-bold text-base leading-tight">{session.title}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{session.focus}</p>
          </div>
          <div className="text-right shrink-0">
            {offer && discountedPrice !== null ? (
              <>
                <div className="text-muted-foreground text-sm line-through leading-none">${session.pricePerPlayer}</div>
                <div className="font-extrabold text-xl leading-none" style={{ color: "#DC373E" }}>
                  {discountedPrice === 0 ? "FREE" : `$${discountedPrice}`}
                </div>
              </>
            ) : (
              <div className="font-extrabold text-xl leading-none" style={{ color: "#0F3154" }}>${session.pricePerPlayer}</div>
            )}
            <div className="text-muted-foreground text-xs mt-0.5">
              {session.sessionType === "private" ? "/ session" : "/ player"}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Trainer row */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
            {session.trainer.photo ? (
              <Image
                src={session.trainer.photo}
                alt={session.trainer.name}
                fill
                className="object-cover"
                sizes="32px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#0F3154" }}>
                {session.trainer.name?.[0] ?? "T"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{session.trainer.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium">{session.trainer.rating}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{session.dayOfWeek}s</span>
            <span>·</span>
            <span>{session.time}</span>
            <span>·</span>
            <span>{session.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{session.venue}, {session.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Ages {session.ageRange}</span>
          </div>
        </div>

        {/* Skill level + age */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${skillColors[session.skillLevel]}`}>
            {session.skillLevel}
          </span>
          {session.recurring && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Weekly</span>
          )}
        </div>

        {/* Spots progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={almostFull ? "font-bold text-[#DC373E]" : "text-muted-foreground"}>
              {almostFull ? `⚡ Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left!` : `${session.spotsLeft} of ${session.totalSpots} spots open`}
            </span>
            <span className="text-muted-foreground">{spotsFilled}/{session.totalSpots} joined</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                backgroundColor: almostFull ? "#DC373E" : "#0F3154",
              }}
            />
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="px-5 pb-5 flex gap-2">
        <div
          className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
          style={{ backgroundColor: "#DC373E" }}
        >
          View & Book
        </div>
        <button
          onClick={handleInterested}
          title={interested ? "You're interested — your followers have been notified" : "Mark as interested — notifies your followers"}
          className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shrink-0"
          style={interested
            ? { backgroundColor: "#0F3154", borderColor: "#0F3154" }
            : { borderColor: "#e2e8f0" }}
        >
          <Bell className="h-4 w-4" style={{ color: interested ? "white" : "#94a3b8" }} />
        </button>
        <button
          onClick={handleShare}
          title="Copy invite link"
          className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shrink-0"
          style={{ borderColor: "#e2e8f0" }}
        >
          {copied
            ? <Check className="h-4 w-4 text-green-500" />
            : <Share2 className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>
    </Link>
  );
}
