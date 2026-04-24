"use client";

import { useState } from "react";
import { Bell, MessageCircle, MapPin, User } from "lucide-react";
import { PlayerProfile } from "@/lib/types";

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  "MLS Next":             { bg: "rgba(251,191,36,0.2)",  text: "#FCD34D" },
  "ECNL / ECNL Regional": { bg: "rgba(167,139,250,0.2)", text: "#C4B5FD" },
  "NPL / USYS":           { bg: "rgba(96,165,250,0.2)",  text: "#93C5FD" },
  "Club Travel":          { bg: "rgba(52,211,153,0.2)",  text: "#6EE7B7" },
  "High School Varsity":  { bg: "rgba(251,113,133,0.2)", text: "#FCA5A5" },
  "High School JV":       { bg: "rgba(251,113,133,0.15)", text: "#FCA5A5" },
  "Recreational":         { bg: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.6)" },
};

interface PlayerCardProps {
  player: PlayerProfile;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [following, setFollowing] = useState(false);
  const [imgError, setImgError] = useState(false);

  const tierColor = TIER_COLORS[player.competitiveTier] ?? { bg: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.6)" };

  return (
    <div className="relative group pt-16">
      {/* Circular avatar overlapping top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        {!imgError && player.photo ? (
          <img
            src={player.photo}
            alt={player.firstName}
            onError={() => setImgError(true)}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: "#1a4a73" }}
          >
            {player.firstName[0]}
          </div>
        )}
      </div>

      {/* Dark navy card top */}
      <div
        className="rounded-t-2xl pt-16 pb-5 px-5 text-center"
        style={{ backgroundColor: "#0F3154" }}
      >
        {/* Name */}
        <h3 className="text-base font-bold text-white uppercase tracking-wide mt-1">
          {player.firstName} {player.lastName}
        </h3>

        {/* Location · Position · Sport row */}
        <div className="flex items-center justify-center gap-4 mt-2 text-white/70 text-xs flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {player.city}, {player.state}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {player.position}
          </span>
          <span>{player.sportEmoji} {player.sport}</span>
        </div>

        {/* Competitive tier badge + team */}
        <div className="flex flex-col items-center gap-1.5 mt-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: tierColor.bg, color: tierColor.text }}
          >
            {player.competitiveTier}
          </span>
          <p className="text-xs text-white/50 leading-snug text-center">{player.team}</p>
        </div>
      </div>

      {/* White bottom section */}
      <div className="bg-white rounded-b-2xl border border-t-0 px-5 py-4">
        {/* Looking for */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          <span className="font-semibold" style={{ color: "#0F3154" }}>Looking for: </span>
          {player.lookingFor}
        </p>

        {/* Action buttons */}
        {following && (
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mb-2">
            <Bell className="h-3 w-3" />
            Notified when they book or post
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setFollowing((v) => !v)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={following
              ? { backgroundColor: "#0F3154", color: "#fff" }
              : { border: "1px solid #0F3154", color: "#0F3154", backgroundColor: "transparent" }
            }
          >
            <Bell className="h-3.5 w-3.5" />
            {following ? "Following" : "Follow"}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#DC373E" }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
