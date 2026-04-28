"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Star, MapPin, Clock, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface TrainerProfile {
  id: string; name: string; photo: string; city: string; state: string;
  hourlyRate: number; rating: number; reviewCount: number; yearsExperience: number;
  sports: string[];
}

function getDiscount(count: number) {
  if (count >= 8) return 20;
  if (count >= 5) return 15;
  if (count >= 3) return 10;
  return 0;
}

export default function BookPrivatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    athleteName: "", notes: "",
  });

  useEffect(() => {
    fetch(`/api/trainers/${id}`)
      .then((r) => r.json())
      .then((t) => { setTrainer(t); setLoading(false); })
      .catch(() => setLoading(false));
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
      }));
    }
  }, [id, user]);

  function setF(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleCheckout() {
    if (!trainer) return;
    setSubmitting(true);
    try {
      const playerPrice = Math.round(trainer.hourlyRate / 0.85);
      const discountPercent = getDiscount(sessionCount);
      const totalPrice = Math.round(playerPrice * sessionCount * (1 - discountPercent / 100));
      const res = await fetch("/api/checkout/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainer.id,
          trainerName: trainer.name,
          pricePerSession: playerPrice,
          sessionCount,
          discountPercent,
          totalPrice,
          contactName: `${form.firstName} ${form.lastName}`.trim(),
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          athleteName: form.athleteName,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (!trainer) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Trainer not found.</p></div>;

  const playerPrice = Math.round(trainer.hourlyRate / 0.85);
  const discountPercent = getDiscount(sessionCount);
  const totalPrice = Math.round(playerPrice * sessionCount * (1 - discountPercent / 100));
  const location = [trainer.city, trainer.state].filter(Boolean).join(", ");
  const isValid = form.firstName.trim() && form.email.trim() && form.phone.trim() && form.athleteName.trim();

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container py-3">
          <Link href={`/groups/${trainer.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to trainer profile
          </Link>
        </div>
      </div>

      <div className="container max-w-4xl py-8 px-4">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* Left — form */}
          <div className="space-y-5">
            <h1 className="text-2xl font-bold">Book a Private Session</h1>

            {/* Session count */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="font-semibold text-base mb-4">How many sessions?</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setSessionCount((c) => Math.max(1, c - 1))}
                  disabled={sessionCount <= 1}
                  className="h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors hover:border-[#0F3154] disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold w-8 text-center">{sessionCount}</span>
                <button
                  onClick={() => setSessionCount((c) => Math.min(8, c + 1))}
                  disabled={sessionCount >= 8}
                  className="h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors hover:border-[#0F3154] disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {discountPercent > 0 ? (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                    🎉 Save {discountPercent}% — multi-session discount
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Book 3+ sessions to save 10%</span>
                )}
              </div>
              {discountPercent === 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {[3, 5, 8].map((n) => (
                    <button key={n} onClick={() => setSessionCount(n)}
                      className="text-xs px-2.5 py-1 rounded-full border border-dashed text-muted-foreground hover:border-[#0F3154] hover:text-[#0F3154] transition-colors">
                      {n} sessions — save {getDiscount(n)}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-base">Your contact info</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">First name *</label>
                  <Input value={form.firstName} onChange={(e) => setF("firstName", e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Last name</label>
                  <Input value={form.lastName} onChange={(e) => setF("lastName", e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email *</label>
                <Input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                <Input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="(919) 555-0123" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-base">About the athlete</h2>
                <p className="text-xs text-muted-foreground mt-1">Once payment is confirmed, {trainer.name.split(" ")[0]} will reach out directly to arrange a date and time.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Athlete name *</label>
                <Input value={form.athleteName} onChange={(e) => setF("athleteName", e.target.value)} placeholder="Who is this session for?" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes for {trainer.name.split(" ")[0]} <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={3}
                  placeholder="Goals, skill level, preferred location, availability…"
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>

            <Button size="lg" className="w-full text-base" disabled={!isValid || submitting}
              onClick={handleCheckout}
              style={{ backgroundColor: "#DC373E" }}>
              {submitting ? "Redirecting to checkout…" : `Reserve & Pay $${totalPrice}`}
            </Button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Secure checkout · GrupUp Guarantee
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Can't agree on a time or place? You'll receive a <strong>100% refund</strong> — no questions asked.
            </p>
          </div>

          {/* Right — trainer summary */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden sticky top-28">
            <div className="relative h-48 w-full">
              {trainer.photo ? (
                <Image src={trainer.photo} alt={trainer.name} fill className="object-cover object-top" sizes="340px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                  {trainer.name[0]}
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="font-bold text-base">{trainer.name}</p>
                {location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{location}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(trainer.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                ))}
                <span className="font-bold text-sm">{trainer.rating?.toFixed(1) ?? "5.0"}</span>
                <span className="text-muted-foreground text-xs">· {trainer.reviewCount ?? 0} reviews</span>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f0f4f9" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {sessionCount} × 1-on-1 session
                  </span>
                  <span className="text-muted-foreground">${playerPrice} ea</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-xs border-t pt-2">
                    <span className="text-green-700 font-medium">Save {discountPercent}%</span>
                    <span className="text-green-700 font-medium">−${Math.round(playerPrice * sessionCount * discountPercent / 100)}</span>
                  </div>
                )}
                <div className={`flex justify-between text-sm font-bold border-t pt-2`} style={{ color: "#0F3154" }}>
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
