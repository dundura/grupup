"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Clock } from "lucide-react";

export default function FollowButton({
  trainerClerkId,
  initialIsFollowing,
  initialStatus,
  isSignedIn,
  iconOnly = false,
}: {
  trainerClerkId: string;
  initialIsFollowing: boolean;
  initialStatus?: string | null;
  isSignedIn: boolean;
  iconOnly?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(
    initialIsFollowing ? (initialStatus ?? "approved") : null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    if (status === "pending") return;
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerClerkId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.following ? data.status : null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (iconOnly) {
    const title = status === "approved" ? "Following (click to unfollow)" : status === "pending" ? "Request sent" : "Follow trainer";
    return (
      <button
        onClick={handleClick}
        disabled={loading || status === "pending"}
        title={title}
        className="flex items-center justify-center h-6 w-6 rounded-full transition-colors shrink-0"
        style={
          status === "approved"
            ? { backgroundColor: "#0F3154", color: "white" }
            : { backgroundColor: "transparent", color: "#94a3b8" }
        }>
        {status === "approved" ? (
          <UserCheck className="h-3.5 w-3.5" />
        ) : status === "pending" ? (
          <Clock className="h-3.5 w-3.5" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  if (status === "approved") return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors"
      style={{ backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }}>
      <UserCheck className="h-3 w-3" /> Following
    </button>
  );

  if (status === "pending") return (
    <button disabled
      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border cursor-not-allowed opacity-70"
      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
      <Clock className="h-3 w-3" /> Requested
    </button>
  );

  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors"
      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
      <UserPlus className="h-3 w-3" /> Follow
    </button>
  );
}
