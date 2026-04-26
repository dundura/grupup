import Link from "next/link";
import { Shield, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Safety – Grupup" };

const standards = [
  "Background check completed and verified",
  "Coaching certifications confirmed",
  "Identity verified with government-issued ID",
  "Approved by Grupup safety review",
];

const sections = [
  {
    title: "Trainer vetting",
    body: `Every trainer on Grupup goes through a multi-step approval process before they can create or run sessions. This includes identity verification, certification review, and a background check. Trainers who do not meet our standards are not listed on the platform.`,
    bullets: null,
  },
  {
    title: "Session safety",
    body: `All group sessions take place at verified public venues — parks, sports complexes, and recreational facilities. Trainers are required to list the specific venue when creating a session, so you always know where your child will be training before you book.`,
    bullets: null,
  },
  {
    title: "Safe communication",
    body: `All communication between users and trainers happens through the Grupup platform. We do not encourage or allow sharing of personal phone numbers or email addresses before a booking is confirmed. Our support team monitors for any inappropriate contact.`,
    bullets: null,
  },
  {
    title: "For parents",
    body: `We recommend:\n• Reviewing a trainer's full profile, certifications, and parent reviews before booking\n• Attending your child's first session to meet the trainer in person\n• Ensuring your child knows they can tell you if they ever feel uncomfortable\n• Contacting Grupup support immediately if anything feels wrong`,
    bullets: null,
  },
  {
    title: "Reporting a concern",
    body: `If you experience or witness any behavior that makes you feel unsafe — before, during, or after a session — report it to us immediately. We take every report seriously and will investigate promptly. Trainers found to have violated our safety standards are permanently removed from the platform.`,
    bullets: null,
  },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-14">
        <div className="container max-w-3xl">
          <p className="text-white/50 text-sm mb-2">Trust & Safety</p>
          <h1 className="text-4xl font-bold text-white mb-3">Safety on Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span></h1>
          <p className="text-white/70 text-lg max-w-xl">
            Every coach is vetted. Every session is verified. Your family's safety is our first priority.
          </p>
        </div>
      </div>

      <div className="container max-w-3xl py-14 space-y-8">

        {/* Trust badge */}
        <div className="bg-white rounded-2xl border p-6 flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#0F3154" }}>
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg mb-3">Every Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> coach has:</h2>
            <ul className="space-y-2">
              {standards.map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl border p-8 md:p-12 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold mb-3">Contact our safety team</h2>
            <p className="text-muted-foreground leading-relaxed">
              For urgent safety concerns, email{" "}
              <a href="mailto:info@anytime-soccer.com" className="text-foreground font-medium underline">info@anytime-soccer.com</a>.
              {" "}For non-urgent questions, visit our{" "}
              <Link href="/how-it-works" className="text-foreground font-medium underline">How It Works</Link> page or reach out through the Help Center.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
