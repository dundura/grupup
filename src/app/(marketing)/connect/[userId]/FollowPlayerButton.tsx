"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

export default function FollowPlayerButton({
  targetClerkId,
  initialFollowing,
}: {
  targetClerkId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/player/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetClerkId, action: following ? "unfollow" : "follow" }),
    });
    if (res.ok) setFollowing(!following);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      style={following
        ? { backgroundColor: "#f0f4f9", color: "#0F3154", border: "1px solid #0F3154" }
        : { backgroundColor: "#0F3154", color: "white" }}>
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
