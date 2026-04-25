"use client";

import { Users, MapPin, Share2 } from "lucide-react";
import type { Squad } from "@/lib/types";

function tierColor(tier: string): { bg: string; text: string } {
  switch (tier) {
    case "MLS Next":
      return { bg: "#B45309", text: "#FEF3C7" }; // amber
    case "ECNL / ECNL Regional":
      return { bg: "#7C3AED", text: "#EDE9FE" }; // purple
    case "NPL / USYS":
      return { bg: "#1D4ED8", text: "#DBEAFE" }; // blue
    case "Club Travel":
      return { bg: "#0369A1", text: "#E0F2FE" }; // sky
    case "High School / JV":
      return { bg: "#0F766E", text: "#CCFBF1" }; // teal
    case "Recreational":
      return { bg: "#15803D", text: "#DCFCE7" }; // green
    case "Adult League":
      return { bg: "#6B7280", text: "#F3F4F6" }; // gray
    default:
      return { bg: "#15803D", text: "#DCFCE7" };
  }
}

interface Props {
  squad: Squad;
}

export function SquadCard({ squad }: Props) {
  const { bg, text } = tierColor(squad.competitiveTier);
  const fillPct = Math.round((squad.memberCount / squad.maxMembers) * 100);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/squads/${squad.id}`);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header band */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#0F3154" }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{squad.sportEmoji}</span>
            <span className="text-white/60 text-sm font-medium">{squad.sport}</span>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: bg, color: text }}
          >
            {squad.competitiveTier}
          </span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-1">{squad.name}</h3>
        <p className="text-white/60 text-sm line-clamp-2">{squad.description}</p>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {squad.city}, {squad.state}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Ages {squad.ageRange}
          </span>
        </div>

        {/* Members */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-foreground">
              {squad.memberCount} of {squad.maxMembers} members
            </span>
            {squad.maxMembers - squad.memberCount <= 2 && (
              <span className="text-xs font-bold text-[#DC373E]">Almost full!</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fillPct}%`, backgroundColor: "#0F3154" }}
            />
          </div>
        </div>

        {squad.lookingForTrainer && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 self-start">
            Looking for a trainer
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#DC373E" }}
        >
          Request to Join
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
