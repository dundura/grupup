"use client";

import { useState } from "react";
import { Bell, MessageCircle, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerProfile } from "@/lib/types";

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  "MLS Next":             { bg: "#FEF3C7", color: "#92400E" },
  "ECNL / ECNL Regional": { bg: "#EDE9FE", color: "#5B21B6" },
  "NPL / USYS":           { bg: "#DBEAFE", color: "#1E40AF" },
  "Club Travel":          { bg: "#D1FAE5", color: "#065F46" },
  "High School Varsity":  { bg: "#FFE4E6", color: "#9F1239" },
  "High School JV":       { bg: "#FEE2E2", color: "#B91C1C" },
  "Recreational":         { bg: "#F3F4F6", color: "#374151" },
};

interface PlayerCardProps {
  player: PlayerProfile;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [following, setFollowing] = useState(false);

  const tierStyle = TIER_STYLES[player.competitiveTier] ?? { bg: "#F3F4F6", color: "#374151" };
  const lastName = player.lastName ? player.lastName[0] + "." : "";

  return (
    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
      {/* Top accent bar — navy */}
      <div className="h-1.5" style={{ backgroundColor: "#0F3154" }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: "#0F3154" }}
          >
            {player.firstName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight">
              {player.firstName} {lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {player.sport} {player.sportEmoji} · {player.position}
            </p>
          </div>

          {/* Competitive tier badge */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: tierStyle.bg, color: tierStyle.color }}
          >
            {player.competitiveTier}
          </span>
        </div>

        {/* Team */}
        <p className="text-sm font-semibold text-foreground leading-snug -mt-1">
          {player.team}
        </p>

        {/* Location + age */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {player.city}, {player.state}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Age {player.age}
          </span>
        </div>

        {/* Looking for */}
        <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
          <span className="font-medium text-foreground">Looking for: </span>
          {player.lookingFor}
        </p>

        {/* Actions */}
        {following && (
          <p className="text-xs text-muted-foreground -mt-1 flex items-center gap-1">
            <Bell className="h-3 w-3" />
            You'll be notified when they book or post a session
          </p>
        )}
        <div className="flex gap-2 mt-auto pt-1">
          <Button
            size="sm"
            variant={following ? "default" : "outline"}
            className="flex-1 gap-1.5 text-xs"
            style={following ? { backgroundColor: "#0F3154", color: "#fff" } : {}}
            onClick={() => setFollowing((v) => !v)}
          >
            <Bell className="h-3.5 w-3.5" />
            {following ? "Following" : "Follow"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
