import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Grupup",
  description: "Grupup's refund, credit, and cancellation policies — designed to be fair to families and coaches.",
};

const sections = [
  {
    title: "Coach No-Show",
    body: [
      "Our coaches are carefully vetted. That said, on rare occasions things happen.",
      "If your coach does not show up for a scheduled session:",
    ],
    bullets: [
      "You may cancel the session and receive a full credit to reschedule at your convenience.",
      "If the coach is no longer the right fit, you may request a full refund — or we'll transfer you to another coach at no additional cost.",
      "You will never pay for a session that doesn't happen due to a coach no-show. We stand behind every booking.",
    ],
  },
  {
    title: "Cancelling a Session",
    body: [
      "We know family schedules change quickly. If you need to cancel:",
    ],
    bullets: [
      "More than 4 hours before the session start time — you may reschedule with no loss of credit.",
      "Less than 4 hours before the session start time — the session is non-refundable, as coaches reserve that time specifically for you.",
    ],
    note: "We use a 4-hour window (not 24) because we know family life is unpredictable.",
  },
  {
    title: "Good Fit Guarantee",
    body: [
      "If after your first session the coach isn't the right fit, contact us at support@grupup.app. We'll apply that first session as a credit and help you find a better match.",
    ],
    bullets: [],
  },
  {
    title: "Refund Window",
    body: [
      "Change of heart after booking?",
    ],
    bullets: [
      "Within 24 hours of purchase — you're eligible for a full refund.",
      "After 24 hours — the payment converts to credit, valid for 12 months, usable with any Grupup coach.",
    ],
  },
  {
    title: "Session Credits",
    body: [
      "Credits are valid for 12 months from the date of purchase and can be applied toward any session on Grupup.",
    ],
    bullets: [],
  },
  {
    title: "Keeping Bookings on Platform",
    body: [
      "All communication and bookings must stay on Grupup. Taking sessions off-platform removes your eligibility for refunds, credits, and our Good Fit Guarantee.",
    ],
    bullets: [],
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Header */}
      <div className="bg-white border-b py-12 px-4">
        <div className="container max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#DC373E" }}>Policy</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our team is made up of coaches, parents, and former athletes — we understand how busy and unpredictable family life can be. These policies are designed to be fair to families while respecting the time our coaches dedicate to every session.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="container max-w-3xl py-12 px-4 space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-3" style={{ color: "#0F3154" }}>{s.title}</h2>
            {s.body.map((line, i) => (
              <p key={i} className="text-muted-foreground text-sm leading-relaxed mb-2">{line}</p>
            ))}
            {s.bullets.length > 0 && (
              <ul className="space-y-2 mt-3 mb-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "#DC373E" }} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {"note" in s && s.note && (
              <p className="text-xs text-muted-foreground bg-blue-50 rounded-lg px-3 py-2 mt-3 border border-blue-100">
                💡 {s.note}
              </p>
            )}
          </div>
        ))}

        {/* Contact */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-2" style={{ color: "#0F3154" }}>Questions?</h2>
          <p className="text-sm text-muted-foreground mb-1">
            We respond to all support requests within 24 hours.
          </p>
          <a href="mailto:support@grupup.app" className="text-sm font-semibold hover:underline" style={{ color: "#DC373E" }}>
            support@grupup.app
          </a>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
