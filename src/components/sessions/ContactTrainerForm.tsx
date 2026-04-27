"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle } from "lucide-react";

export default function ContactTrainerForm({
  sessionId,
  sessionTitle,
  trainerName,
  defaultMessage = "",
  ctaLabel = "Questions? Contact Trainer",
  ctaStyle = "outline",
}: {
  sessionId: number;
  sessionTitle: string;
  trainerName: string;
  defaultMessage?: string;
  ctaLabel?: string;
  ctaStyle?: "outline" | "highlight";
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, sessionTitle }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to send. Please try again.");
      }
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
        <p className="text-sm text-green-700 font-medium">Message sent to {trainerName.split(" ")[0]}!</p>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        ctaStyle === "highlight" ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm transition-colors text-white"
            style={{ backgroundColor: "#0F3154" }}>
            🎉 {ctaLabel}
          </button>
        ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-muted"
          style={{ color: "#0F3154", borderColor: "#0F3154" }}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {ctaLabel}
        </button>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Message {trainerName.split(" ")[0]}
          </p>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm"
            required
          />
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm"
            required
          />
          <textarea
            placeholder="Ask about the session, availability, etc."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-input hover:bg-muted transition-colors">
              Cancel
            </button>
            <Button
              type="submit"
              disabled={sending || !name.trim() || !email.trim() || !message.trim()}
              className="flex-1 text-sm"
              style={{ backgroundColor: "#0F3154" }}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
