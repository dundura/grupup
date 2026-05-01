"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FeaturePlayerButton({
  clerkUserId, initialFeatured, name, photo, city, sport, skillLevel, birthYear, team, bio,
}: {
  clerkUserId: string;
  initialFeatured: boolean;
  name: string;
  photo?: string;
  city?: string;
  sport?: string;
  skillLevel?: string;
  birthYear?: string;
  team?: string;
  bio?: string;
}) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const next = !featured;
    await fetch("/api/admin/feature-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId, featured: next, name, photo, city, sport, skillLevel, birthYear, team, bio }),
    });
    setFeatured(next);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={featured ? "Remove from carousel" : "Feature in carousel"}
      className="absolute top-2 left-2 z-20 flex items-center justify-center w-7 h-7 rounded-full shadow transition-colors border"
      style={{
        backgroundColor: featured ? "#DC373E" : "white",
        borderColor: featured ? "#DC373E" : "#e2e8f0",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Star className="h-3.5 w-3.5" style={{ color: featured ? "white" : "#94a3b8" }} fill={featured ? "white" : "none"} />
    </button>
  );
}
