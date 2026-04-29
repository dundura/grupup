"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, User, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TrainingRequest {
  id: number; playerName: string; playerEmail: string;
  trainingType?: string; groupSize?: string;
  sport?: string; level?: string; preferredDate?: string;
  preferredTime?: string; sessions?: string; budget?: string;
  message?: string; status: string; createdAt: string;
}

export default function AcceptRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<TrainingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposedRate, setProposedRate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/trainer/requests/${id}`)
      .then((r) => r.json())
      .then((d) => { setRequest(d); setProposedRate(d.budget ?? ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleAccept() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trainer/requests/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedRate, message }),
      });
      const d = await res.json();
      if (d.ok && d.redirect) {
        window.location.href = d.redirect;
      } else if (d.ok) {
        setDone(true);
      } else {
        alert(d.error ?? "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Request not found.</p></div>;

  if (done) return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        <CheckCircle className="h-14 w-14 mx-auto mb-4 text-green-600" />
        <h1 className="text-2xl font-bold mb-2">Request accepted!</h1>
        <p className="text-muted-foreground mb-6">{request.playerName} has been sent a payment link to complete the booking.</p>
        <button onClick={() => router.push("/dashboard")}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#0F3154" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-12">
      <div className="max-w-lg mx-auto space-y-5">

        <h1 className="text-2xl font-bold">Accept Session Request</h1>

        {/* Request details */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Request Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">{request.playerName}</span><span className="text-muted-foreground">{request.playerEmail}</span></div>
            {request.trainingType && <p><span className="text-muted-foreground">Type:</span> <strong className="capitalize">{request.trainingType === "group" ? `Group Training` : "Individual / Private"}</strong></p>}
            {request.groupSize && <p><span className="text-muted-foreground">Group size:</span> {request.groupSize} players</p>}
            {request.sport && <p><span className="text-muted-foreground">Sport:</span> {request.sport}</p>}
            {request.level && <p><span className="text-muted-foreground">Level:</span> {request.level}</p>}
            {(request.preferredDate || request.preferredTime) && (
              <p className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" />{[request.preferredDate, request.preferredTime].filter(Boolean).join(" at ")}</p>
            )}
            {request.sessions && <p><span className="text-muted-foreground">Sessions:</span> {request.sessions}</p>}
            {request.budget && <p className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Player budget:</span> <strong>{request.budget}/session</strong></p>}
            {request.message && <p className="italic text-muted-foreground">"{request.message}"</p>}
          </div>
        </div>

        {/* Response */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Your Response</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Rate per session <span className="text-muted-foreground font-normal text-xs">(pre-filled from player's budget)</span></label>
            <Input value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} placeholder="e.g. $35" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message to player <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="Confirm details, introduce yourself, suggest a meeting spot…"
              className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="rounded-xl bg-[#f0f4f9] px-4 py-3 text-sm text-[#0F3154]">
            {request.trainingType === "group"
              ? <>Accepting will redirect you to create a group session. Once it's live, <strong>{request.playerName}</strong> will be notified to book.</>
              : <>Accepting will send <strong>{request.playerName}</strong> a payment link. Once they pay, the booking is confirmed.</>
            }
          </div>

          <button onClick={handleAccept} disabled={submitting || !proposedRate.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#DC373E" }}>
            {submitting
              ? "Processing…"
              : request.trainingType === "group"
                ? "Accept & Create Group Session"
                : "Accept & Send Payment Link"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
