"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Method = "stripe" | "cashapp" | "venmo" | "zelle" | "";

const methods: { value: Method; label: string; icon: typeof DollarSign; desc: string; placeholder: string }[] = [
  { value: "cashapp", label: "Cash App",    icon: Smartphone,  desc: "Fastest — Grupup sends your payout to your $cashtag within 2 business days.", placeholder: "$cashtag" },
  { value: "venmo",   label: "Venmo",       icon: Smartphone,  desc: "Grupup sends your payout to your Venmo handle within 2 business days.",       placeholder: "@username" },
  { value: "zelle",   label: "Zelle",       icon: DollarSign,  desc: "Grupup sends your payout via Zelle to your registered phone or email.",        placeholder: "Phone or email" },
  { value: "stripe",  label: "Stripe (Bank / Debit)", icon: CreditCard, desc: "Direct deposit to your bank or debit card via Stripe Connect. Setup required.", placeholder: "" },
];

const COMMISSION = 15;

export default function PayoutSettingsPage() {
  const [selected, setSelected]   = useState<Method>("");
  const [handle, setHandle]       = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/trainer/payout")
      .then((r) => r.json())
      .then((d) => {
        if (d?.payoutMethod) setSelected(d.payoutMethod as Method);
        if (d?.payoutHandle) setHandle(d.payoutHandle);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/trainer/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutMethod: selected, payoutHandle: handle }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  const currentMethod = methods.find((m) => m.value === selected);
  const needsHandle = !!selected && selected !== "stripe";

  if (loading) {
    return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Payout Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose how you want to receive your earnings. Grupup keeps {COMMISSION}% — you keep {100 - COMMISSION}%.
          </p>
        </div>

        {/* Earnings explainer */}
        <div className="bg-white rounded-2xl border p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">How payouts work</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Player pays per session</span>
              <span className="font-medium">$X / player</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Grupup platform fee ({COMMISSION}%)</span>
              <span>− ${COMMISSION}% of total</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-1">
              <span>You receive</span>
              <span style={{ color: "#0F3154" }}>{100 - COMMISSION}% of session revenue</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Payouts are processed within 2 business days after a session is completed. Stripe payouts may take 1–3 additional days depending on your bank.
          </p>
        </div>

        {/* Method selection */}
        <div className="bg-white rounded-2xl border p-6 mb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Select your payout method</p>
          <div className="space-y-3">
            {methods.map((m) => (
              <button key={m.value} type="button" onClick={() => { setSelected(m.value); setHandle(""); }}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={selected === m.value
                  ? { borderColor: "#0F3154", backgroundColor: "#f0f4f9" }
                  : { borderColor: "#e2e8f0" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: selected === m.value ? "#0F3154" : "#f1f5f9" }}>
                  <m.icon className="h-5 w-5" style={{ color: selected === m.value ? "white" : "#64748b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
                {selected === m.value && <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#0F3154" }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Handle input */}
        {needsHandle && currentMethod && (
          <div className="bg-white rounded-2xl border p-6 mb-5">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Your {currentMethod.label} {currentMethod.value === "zelle" ? "phone or email" : "username"}
            </label>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={currentMethod.placeholder}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Make sure this matches your {currentMethod.label} account exactly — payouts go directly here.
            </p>
          </div>
        )}

        {/* Stripe note */}
        {selected === "stripe" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-sm">
            <p className="font-semibold text-blue-800 mb-1">Stripe Connect setup required</p>
            <p className="text-blue-700 leading-relaxed">
              To receive payouts via direct deposit, you'll need to complete Stripe's identity verification. This takes about 5 minutes.
              Once your account is approved, payouts arrive automatically 1–2 business days after a session.
            </p>
            <p className="text-blue-600 text-xs mt-2 font-medium">Coming soon — we'll email you when Stripe Connect is live.</p>
          </div>
        )}

        {/* Cancellation policy notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Cancellation Policy</p>
          <ul className="text-sm text-amber-800 space-y-1.5 leading-relaxed">
            <li>• Players who cancel <strong>more than 24 hours</strong> before a session receive a full refund.</li>
            <li>• Players who cancel <strong>within 24 hours</strong> are not refunded — you still receive your payout.</li>
            <li>• If <strong>you cancel</strong> a session, all players are automatically refunded and your account may be flagged.</li>
            <li>• Sessions with zero bookings 2 hours before start are automatically cancelled without penalty.</li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Button className="flex-1" size="lg" disabled={!selected || saving || (needsHandle && !handle.trim())}
            style={{ backgroundColor: "#DC373E" }} onClick={handleSave}>
            {saving ? "Saving…" : "Save payout settings"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
