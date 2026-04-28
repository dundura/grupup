"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function StripeReturnPage() {
  const [status, setStatus] = useState<"loading" | "connected" | "incomplete">("loading");

  useEffect(() => {
    fetch("/api/trainer/stripe/status")
      .then((r) => r.json())
      .then((d) => setStatus(d.connected ? "connected" : "incomplete"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        {status === "connected" ? (
          <>
            <CheckCircle className="h-14 w-14 mx-auto mb-4 text-green-600" />
            <h1 className="text-2xl font-bold mb-2">Stripe connected!</h1>
            <p className="text-muted-foreground mb-8">
              You'll now be paid automatically after each session — 85% of every booking goes straight to your bank.
            </p>
          </>
        ) : (
          <>
            <XCircle className="h-14 w-14 mx-auto mb-4 text-amber-500" />
            <h1 className="text-2xl font-bold mb-2">Almost there</h1>
            <p className="text-muted-foreground mb-8">
              Your Stripe account isn't fully set up yet. Complete the onboarding to start receiving automatic payouts.
            </p>
            <button
              onClick={() => fetch("/api/trainer/stripe/connect", { method: "POST" }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; })}
              className="w-full py-3 rounded-xl text-white font-semibold mb-4"
              style={{ backgroundColor: "#0F3154" }}>
              Continue Stripe Setup
            </button>
          </>
        )}
        <Link href="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
