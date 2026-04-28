"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessageButton({
  toClerkId,
  toName,
}: {
  toClerkId: string;
  toName: string;
}) {
  const { user, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isSignedIn || user?.id === toClerkId) return null;

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toClerkId, body: body.trim() }),
    });
    if (res.ok) { setSent(true); setBody(""); }
    setSending(false);
  }

  return (
    <>
      <button onClick={() => { setOpen(true); setSent(false); }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        style={{ backgroundColor: "#DC373E", color: "white" }}>
        <MessageSquare className="h-4 w-4" />
        Message
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Message {toName}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold mb-1">Message sent!</p>
                <p className="text-sm text-muted-foreground mb-4">{toName} will get an email notification.</p>
                <Button onClick={() => setOpen(false)} style={{ backgroundColor: "#0F3154" }} className="w-full">Close</Button>
              </div>
            ) : (
              <>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Write a message to ${toName}…`}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
                  <Button onClick={send} disabled={!body.trim() || sending} className="flex-1"
                    style={{ backgroundColor: "#DC373E" }}>
                    <Send className="h-4 w-4 mr-1.5" />
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
