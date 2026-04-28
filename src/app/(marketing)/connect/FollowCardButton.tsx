"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, UserCheck, Clock } from "lucide-react";

type FollowStatus = "none" | "pending" | "approved";

export default function FollowCardButton({
  targetClerkId,
  initialFollowing,
}: {
  targetClerkId: string;
  initialFollowing: boolean;
}) {
  const { isSignedIn } = useAuth();
  const [status, setStatus] = useState<FollowStatus>(initialFollowing ? "approved" : "none");
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isSignedIn) { window.location.href = "/sign-in"; return; }
    if (loading) return;
    setLoading(true);
    if (status !== "none") {
      // unfollow
      const res = await fetch("/api/player/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetClerkId, action: "unfollow" }),
      });
      if (res.ok) setStatus("none");
    } else {
      const res = await fetch("/api/player/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetClerkId, action: "follow" }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status === "approved" ? "approved" : "pending");
      }
    }
    setLoading(false);
  }

  const label = status === "approved" ? "Following" : status === "pending" ? "Requested" : "Follow";
  const Icon = status === "approved" ? UserCheck : status === "pending" ? Clock : UserPlus;

  return (
    <button onClick={toggle} disabled={loading}
      title={status !== "none" ? "Unfollow" : "Follow"}
      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-50"
      style={status === "approved"
        ? { backgroundColor: "#f0f4f9", color: "#0F3154", borderColor: "#0F3154" }
        : status === "pending"
        ? { backgroundColor: "#fff7ed", color: "#c2410c", borderColor: "#fed7aa" }
        : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
