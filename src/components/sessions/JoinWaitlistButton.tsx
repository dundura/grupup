"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";

export default function JoinWaitlistButton({
  sessionId, sessionTitle, waitlistCount, initialJoined = false,
}: { sessionId: number; sessionTitle: string; waitlistCount: number; initialJoined?: boolean }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(initialJoined);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
      setEmail((prev) => prev || (user.emailAddresses?.[0]?.emailAddress ?? ""));
    }
  }, [user]);
  const [leaving, setLeaving] = useState(false);
  const [left, setLeft] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/sessions/${sessionId}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      setDone(true);
    } finally {
      setSending(false);
    }
  }

  async function handleLeave() {
    if (!email.trim()) return;
    setLeaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}/waitlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setLeft(true);
    } finally {
      setLeaving(false);
    }
  }

  if (left) return (
    <p className="text-xs text-center text-muted-foreground">You've been removed from the RSVP list.</p>
  );

  if (done) return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200">
        <span className="text-sm font-semibold text-green-700">✓ You've expressed interest!</span>
      </div>
      <p className="text-xs text-center text-muted-foreground">We'll email you when booking opens.</p>
      <button onClick={handleLeave} disabled={leaving}
        className="w-full text-xs text-muted-foreground hover:text-red-600 transition-colors py-1 underline">
        {leaving ? "Removing…" : "Remove my RSVP"}
      </button>
    </div>
  );

  return (
    <div className="space-y-2">
      {waitlistCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">{waitlistCount} {waitlistCount === 1 ? "person has" : "people have"} expressed interest</p>
      )}
      {!open ? (
        <button
          onClick={async () => {
            if (email.trim()) {
              // Signed-in user: one-click submit
              setSending(true);
              try {
                await fetch(`/api/sessions/${sessionId}/waitlist`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, sessionTitle }),
                });
                setDone(true);
              } finally { setSending(false); }
            } else {
              setOpen(true);
            }
          }}
          disabled={sending}
          className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-[#0F3154] hover:text-white disabled:opacity-60"
          style={{ borderColor: "#0F3154", color: "#0F3154" }}>
          {sending ? "Sending…" : "Express Interest"}
        </button>
      ) : (
        <form onSubmit={handleJoin} className="space-y-2.5">
          <p className="text-xs text-muted-foreground">No charge — we'll email you when booking opens.</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required />
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-sm border font-medium">Cancel</button>
            <button type="submit" disabled={sending || !email.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#0F3154" }}>
              {sending ? "Sending…" : "RSVP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
