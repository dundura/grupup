"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, UserCheck, Clock, X } from "lucide-react";

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
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function toggle() {
    if (!isSignedIn) { window.location.href = "/sign-in"; return; }
    if (loading) return;
    if (status === "pending") { showToast("Request already sent — waiting for approval."); return; }
    setLoading(true);
    if (status === "approved") {
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
        const newStatus = data.status === "approved" ? "approved" : "pending";
        setStatus(newStatus);
        showToast(newStatus === "pending"
          ? "Follow request sent! They'll be notified to approve."
          : "You're now following this player!");
      }
    }
    setLoading(false);
  }

  const Icon = status === "approved" ? UserCheck : status === "pending" ? Clock : UserPlus;

  return (
    <div className="relative shrink-0">
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

      {toast && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-64 bg-[#0F3154] text-white text-xs font-medium px-3 py-2.5 rounded-xl shadow-lg flex items-start gap-2">
          <span className="flex-1 leading-relaxed">{toast}</span>
          <button onClick={() => setToast(null)} className="shrink-0 mt-0.5 opacity-70 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
