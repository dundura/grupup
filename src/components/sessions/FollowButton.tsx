"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";

export default function FollowButton({
  trainerClerkId,
  initialIsFollowing,
  isSignedIn,
}: {
  trainerClerkId: string;
  initialIsFollowing: boolean;
  isSignedIn: boolean;
}) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerClerkId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors"
      style={
        following
          ? { backgroundColor: "#0F3154", color: "white", borderColor: "#0F3154" }
          : { color: "#0F3154", borderColor: "#0F3154" }
      }>
      {following
        ? <><UserCheck className="h-3 w-3" /> Following</>
        : <><UserPlus className="h-3 w-3" /> Follow</>}
    </button>
  );
}
