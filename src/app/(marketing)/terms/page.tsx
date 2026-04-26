import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Grupup",
  description: "Grupup site terms and conditions of use.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h2 className="font-bold text-base mb-3" style={{ color: "#0F3154" }}>{title}</h2>
      {children}
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="bg-white border-b py-10 px-4">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-1">Site Terms</h1>
          <p className="text-sm text-muted-foreground">Grupup, Inc. · Last Modified: April 26, 2026</p>
        </div>
      </div>

      <div className="container max-w-3xl py-10 px-4 space-y-5 text-sm leading-relaxed text-muted-foreground">

        <Section title="Section A — Terms of Use">
          <p>Grupup provides an online platform that connects athletes and families with independent sports coaches and trainers ("Platform"). These Terms of Use ("Terms") govern your access to and use of the Grupup Platform and any related content or services.</p>
          <p className="mt-3 font-semibold text-foreground">PLEASE READ THESE TERMS CAREFULLY. THEY CONSTITUTE A LEGAL AGREEMENT BETWEEN YOU AND GRUPUP.</p>
          <p className="mt-3">By registering for an account you confirm your agreement to be bound by these Terms. If you do not agree, you may not access or use the Platform. Grupup may terminate these Terms or your access at any time for any reason.</p>
        </Section>

        <Section title="The Platform & Services">
          <p>Grupup operates an online technology platform that enables users to find, browse, and book independent sports coaching and training services. The Platform also includes supporting services such as payment processing and customer support.</p>
          <p className="mt-3 font-semibold text-foreground">GRUPUP IS A TECHNOLOGY PLATFORM AND DOES NOT DIRECTLY PROVIDE COACHING OR TRAINING SERVICES. INDEPENDENT COACHES ARE NOT AGENTS OR EMPLOYEES OF GRUPUP.</p>
        </Section>

        <Section title="User Accounts">
          <p>You must be at least 18 years of age to register for an account. You are responsible for all activity under your account and for maintaining the security of your login credentials. You may only hold one account at a time.</p>
        </Section>

        <Section title="Coach Accounts">
          <p>Grupup reviews all coach applications and reserves the right to approve or deny access at its sole discretion. Coaches must be at least 18 years of age. Grupup may revoke platform access at any time if new information comes to light.</p>
        </Section>

        <Section title="Payment">
          <p>There is no cost to sign up. Session fees are set by individual coaches. All transactions must be completed through the Grupup Platform — off-platform payments void your eligibility for refunds, credits, and our Good Fit Guarantee. Grupup retains a 15% platform fee from each booking, which is reflected in the price shown to users.</p>
        </Section>

        <Section title="Refund, Credit & Cancellation">
          <p>See our full <Link href="/refund-policy" className="underline text-foreground">Refund & Cancellation Policy</Link>. Key terms:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Coach no-shows: full credit or refund.</li>
            <li>Cancellations with 4+ hours notice: reschedule at no cost.</li>
            <li>Cancellations within 4 hours: session is non-refundable.</li>
            <li>Good Fit Guarantee: if your first session isn't the right fit, we credit it and help you find a better match.</li>
            <li>Full refunds within 24 hours of purchase. After 24 hours, payments convert to credits valid for 12 months.</li>
          </ul>
        </Section>

        <Section title="Disclaimers">
          <p className="font-semibold text-foreground">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE." GRUPUP DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. GRUPUP DOES NOT GUARANTEE THE QUALITY, SAFETY, OR SUITABILITY OF ANY THIRD-PARTY COACH. USE OF THE PLATFORM IS AT YOUR OWN RISK.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p className="font-semibold text-foreground">GRUPUP SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. GRUPUP'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU THROUGH THE PLATFORM IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
        </Section>

        <Section title="Indemnification">
          <p>You agree to indemnify and hold Grupup and its officers, directors, and employees harmless from any claims, damages, or expenses arising from your use of the Platform, your breach of these Terms, or your violation of any third-party rights.</p>
        </Section>

        <Section title="Section B — Website Use">
          <p>You may not use the Grupup website for any unlawful purpose, to distribute malware, to scrape content without written consent, to impersonate Grupup or other users, or in any way that violates applicable law. Grupup reserves the right to suspend or terminate your access for any violation of these Terms.</p>
        </Section>

        <Section title="Intellectual Property">
          <p>All content, features, and functionality on the Grupup platform — including text, graphics, logos, and software — are owned by Grupup or its licensors. You may not reproduce, distribute, or create derivative works without prior written permission.</p>
        </Section>

        <Section title="Governing Law & Dispute Resolution">
          <p>These Terms are governed by the laws of the State of North Carolina. Any disputes shall be resolved through binding arbitration on an individual basis in accordance with AAA rules. Class actions are not permitted.</p>
        </Section>

        <Section title="Changes to These Terms">
          <p>Grupup may update these Terms at any time. Material changes will be communicated by email or through the Platform. Continued use after changes take effect constitutes acceptance of the revised Terms.</p>
        </Section>

        <Section title="Contact">
          <p className="mb-2">For questions about these Terms:</p>
          <a href="mailto:info@anytime-soccer.com" className="font-semibold underline text-foreground">info@anytime-soccer.com</a>
          <p className="mt-4 flex gap-4">
            <Link href="/privacy" className="underline">Privacy Policy</Link>
            <Link href="/refund-policy" className="underline">Refund & Cancellation</Link>
          </p>
        </Section>

      </div>
    </div>
  );
}
