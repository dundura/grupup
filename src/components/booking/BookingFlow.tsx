"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import {
  Star, MapPin, ShieldCheck, ChevronDown, ChevronRight,
  CheckCircle, CalendarDays, Clock, Users,
} from "lucide-react";

interface Session {
  id: number; title: string; sport: string; sessionType: string;
  city: string; venue: string; dayOfWeek: string; time: string;
  duration: number; pricePerPlayer: number; spotsTotal: number;
  spotsLeft: number; skillLevel: string; ageRange: string; notes: string;
}
interface Trainer {
  id: string; name: string; photo: string; bio: string; city: string;
  state: string; sport: string; sports: string[]; rating: number;
  reviewCount: number; yearsExperience: number; certifications: string[];
}

const STEPS = ["Contact Info", "Package Options", "Schedule", "Checkout"] as const;

const FAQ = [
  { q: "How do group sessions work?", a: "You reserve a spot in a small group session (2–10 players) led by a vetted local coach. You train alongside peers at the same level — better reps, more competition, fraction of the private cost." },
  { q: "Can I contact the coach before booking?", a: "Not yet through the app — but the coach's notes and profile have everything you need. If you have specific questions, reach us at support@grupup.app." },
  { q: "What is the cancellation policy?", a: "Cancel up to 24 hours before the session for a full refund. Within 24 hours the session fee is non-refundable." },
  { q: "Is my payment secure?", a: "Yes. All payments are processed by Stripe with industry-standard encryption. Grupup never stores your card details." },
  { q: "What if the coach cancels?", a: "If a coach cancels a session you've booked, you'll receive a full refund within 3–5 business days." },
];

export function BookingFlow({ session, trainer }: { session: Session; trainer: Trainer | null }) {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    phone: "",
    athleteName: "",
    notes: "",
  });
  const [confirmed, setConfirmed] = useState(false);

  function setF(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  const typeName = session.sessionType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const step1Valid = form.firstName.trim() && form.email.trim();
  const step2Valid = form.athleteName.trim();

  async function handleCheckout() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          athleteName: form.athleteName,
          contactName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
          <CheckCircle className="h-14 w-14 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl font-bold mb-2">You're booked!</h1>
          <p className="text-muted-foreground mb-6">
            Confirmation sent to {form.email}. See you at {session.title}.
          </p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "#0F3154" }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Step progress bar */}
      <div className="bg-white border-b sticky top-16 z-20">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-10" />
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={label} className="flex flex-col items-center gap-1 min-w-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors ${
                    done ? "bg-green-600 border-green-600 text-white"
                      : active ? "text-white border-transparent" : "bg-white border-gray-300 text-gray-400"
                  }`} style={active ? { backgroundColor: "#0F3154", borderColor: "#0F3154" } : undefined}>
                    {done ? <CheckCircle className="h-4 w-4" /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-[#0F3154]" : done ? "text-green-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 px-4">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── Main content ── */}
          <div className="space-y-5">

            {/* Step 1: Contact Info */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-lg font-bold mb-5">Contact Info</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">First name</label>
                      <Input value={form.firstName} onChange={(e) => setF("firstName", e.target.value)} placeholder="Alex" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Last name</label>
                      <Input value={form.lastName} onChange={(e) => setF("lastName", e.target.value)} placeholder="Smith" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email address</label>
                    <Input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <button
                  onClick={() => step1Valid && setStep(2)}
                  disabled={!step1Valid}
                  className="mt-6 w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#0F3154" }}>
                  Next Step <ChevronRight className="h-4 w-4 inline ml-1" />
                </button>
              </div>
            )}

            {/* Step 2: Package Options */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-lg font-bold mb-1">Your Package Selection</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  <Link href={`/sessions/${session.id}`} className="hover:underline" style={{ color: "#0F3154" }}>
                    View other package options
                  </Link>
                </p>

                {/* Selected package */}
                <div className="rounded-xl border overflow-hidden mb-5">
                  <div className="px-4 py-3 text-white font-semibold text-sm" style={{ backgroundColor: "#0F3154" }}>
                    {typeName} — {session.title}
                  </div>
                  <div className="p-4 space-y-1 text-sm text-muted-foreground">
                    {session.dayOfWeek && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{session.dayOfWeek}s at {session.time}</p>}
                    {session.duration && <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{session.duration} min session</p>}
                    {session.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{session.venue ? `${session.venue}, ` : ""}{session.city}</p>}
                    {session.skillLevel && <p className="flex items-center gap-2"><Users className="h-4 w-4" />{session.skillLevel} level · max {session.spotsTotal} players</p>}
                    {session.notes && <p className="mt-2 italic">"{session.notes}"</p>}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-xl border p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{typeName} session</span>
                    <span>${session.pricePerPlayer}.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                    <span>Total</span>
                    <span>${session.pricePerPlayer}.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No service fees during beta 🎉</p>
                </div>

                {/* Athlete name */}
                <div className="mb-5">
                  <label className="text-sm font-medium mb-1.5 block">Athlete Name</label>
                  <Input value={form.athleteName} onChange={(e) => setF("athleteName", e.target.value)}
                    placeholder="Who is this session for?" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button onClick={() => step2Valid && setStep(3)} disabled={!step2Valid}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: "#0F3154" }}>
                    Next Step <ChevronRight className="h-4 w-4 inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-lg font-bold mb-5">Confirm Schedule</h2>

                <div className="rounded-xl bg-[#f0f4f9] p-5 space-y-3 mb-5">
                  {session.dayOfWeek && session.time && (
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#0F3154" }} />
                      <div>
                        <p className="font-semibold text-sm">{session.dayOfWeek}s at {session.time}</p>
                        <p className="text-xs text-muted-foreground">Recurring weekly session</p>
                      </div>
                    </div>
                  )}
                  {session.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 shrink-0" style={{ color: "#0F3154" }} />
                      <p className="font-semibold text-sm">{session.duration} minutes</p>
                    </div>
                  )}
                  {(session.venue || session.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#0F3154" }} />
                      <div>
                        {session.venue && <p className="font-semibold text-sm">{session.venue}</p>}
                        <p className="text-sm text-muted-foreground">{session.city}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <label className="text-sm font-medium mb-1.5 block">Notes for the coach <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={3}
                    placeholder="Any goals, injuries, or things the coach should know…"
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep(4)}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
                    style={{ backgroundColor: "#0F3154" }}>
                    Next Step <ChevronRight className="h-4 w-4 inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Checkout */}
            {step === 4 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="text-lg font-bold mb-5">Checkout</h2>

                {/* Order summary */}
                <div className="rounded-xl border overflow-hidden mb-5">
                  <div className="px-4 py-3 text-white text-sm font-semibold" style={{ backgroundColor: "#0F3154" }}>
                    Order Summary
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{typeName} — {session.title}</span>
                      <span className="font-semibold">${session.pricePerPlayer}.00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Athlete</span>
                      <span>{form.athleteName}</span>
                    </div>
                    {session.dayOfWeek && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Schedule</span>
                        <span>{session.dayOfWeek}s at {session.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                      <span>Total due today</span>
                      <span>${session.pricePerPlayer}.00</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm mb-5">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Secured by Stripe · Cancel up to 24h before for a full refund
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="px-5 py-3 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
                    style={{ backgroundColor: "#DC373E" }}>
                    {submitting ? "Redirecting to payment…" : `Pay $${session.pricePerPlayer} & Reserve Spot`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-32">

            {/* Your Coach card */}
            {trainer && (
              <div className="rounded-2xl overflow-hidden border shadow-sm">
                <div className="px-5 py-4 text-white" style={{ backgroundColor: "#0F3154" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">Your Coach</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                      {trainer.photo ? (
                        <Image src={trainer.photo} alt={trainer.name} fill className="object-cover" sizes="56px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                          {trainer.name?.[0] ?? "T"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{trainer.name}</p>
                      <p className="text-white/70 text-xs">{trainer.sports?.[0] ?? trainer.sport}</p>
                      {trainer.city && (
                        <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{[trainer.city, trainer.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(trainer.rating) ? "fill-amber-400 text-amber-400" : "fill-white/20 text-white/20"}`} />
                      ))}
                    </div>
                    <span className="text-white/70 text-xs">{trainer.rating?.toFixed(1)} ({trainer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-green-300 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" /> Background check verified
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/groups/${trainer.id}`}
                    className="flex items-center justify-center gap-1 w-full py-2.5 rounded-lg border text-sm font-semibold hover:bg-muted transition-colors">
                    View full profile <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* FAQ accordion */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b">
                <p className="font-semibold text-sm">Frequently Asked Questions</p>
              </div>
              <div className="divide-y">
                {FAQ.map((item, i) => (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium pr-3">{item.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                    </button>
                    {faqOpen === i && (
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 text-sm">
              <p className="font-semibold mb-1">Need help?</p>
              <p className="text-muted-foreground text-xs mb-1">support@grupup.app</p>
              <p className="text-muted-foreground text-xs">Mon–Fri · 9am–6pm ET</p>
            </div>

            {/* Guarantee */}
            <div className="rounded-2xl border shadow-sm p-5 text-sm text-center" style={{ backgroundColor: "#f0f4f9" }}>
              <ShieldCheck className="h-8 w-8 mx-auto mb-2" style={{ color: "#0F3154" }} />
              <p className="font-bold text-sm mb-1" style={{ color: "#0F3154" }}>Grupup Guarantee</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If your first session doesn't meet expectations, we'll help you find a better match or refund your booking.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
