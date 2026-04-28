"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ShieldOff, Shield } from "lucide-react";

export default function BlockButton({
  targetClerkId,
  targetName,
  initialBlocked,
}: {
  targetClerkId: string;
  targetName: string;
  initialBlocked: boolean;
}) {
  const { isSignedIn } = useAuth();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (!isSignedIn) return null;

  async function toggle() {
    if (!blocked && !confirm) { setConfirm(true); return; }
    setConfirm(false);
    setLoading(true);
    const res = await fetch("/api/user/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedClerkId: targetClerkId, action: blocked ? "unblock" : "block" }),
    });
    if (res.ok) setBlocked(!blocked);
    setLoading(false);
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Block {targetName}?</span>
        <button onClick={toggle} disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
          style={{ backgroundColor: "#DC373E" }}>Yes</button>
        <button onClick={() => setConfirm(false)} className="px-2.5 py-1 rounded-lg text-xs font-semibold border">No</button>
      </div>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      title={blocked ? `Unblock ${targetName}` : `Block ${targetName}`}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50"
      style={blocked
        ? { backgroundColor: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5" }
        : { backgroundColor: "white", color: "#6b7280", borderColor: "#e5e7eb" }}>
      {blocked ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
      {blocked ? "Blocked" : "Block"}
    </button>
  );
}
