"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";

export default function LateBookingRequest({ sessionId, sessionTitle }: { sessionId: number; sessionTitle: string }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "");
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/sessions/${sessionId}/late-booking-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setDone(true);
    } finally {
      setSending(false);
    }
  }

  if (done) return (
    <div className="text-center py-2">
      <p className="text-sm font-semibold text-green-700">✓ Request sent! We'll be in touch.</p>
    </div>
  );

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-[#0F3154] hover:text-white"
      style={{ borderColor: "#0F3154", color: "#0F3154" }}>
      Request to Join
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
      <p className="text-xs text-muted-foreground">This package has started. Send a request and we'll sort out your spot.</p>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
        placeholder="Anything to add? (optional)"
        className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 py-2 rounded-xl text-sm border font-medium">Cancel</button>
        <button type="submit" disabled={sending || !name.trim() || !email.trim()}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#DC373E" }}>
          {sending ? "Sending…" : "Send Request"}
        </button>
      </div>
    </form>
  );
}
