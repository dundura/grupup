export const metadata = { title: "Terms of Service – Grupup" };

const sections = [
  {
    title: "Acceptance of terms",
    body: `By creating a Grupup account or using the platform, you agree to these Terms of Service. If you do not agree, do not use the platform. We may update these terms from time to time — continued use of Grupup after changes are posted constitutes acceptance of the updated terms.`,
  },
  {
    title: "Who can use Grupup",
    body: `Grupup is available to individuals 18 and older. Parents or guardians may create accounts to book sessions on behalf of minors. By creating an account, you represent that the information you provide is accurate and that you have the legal authority to agree to these terms.`,
  },
  {
    title: "Coaches and trainers",
    body: `Coaches who create profiles and offer sessions on Grupup ("Trainers") are independent contractors, not employees or agents of Grupup. Grupup provides the platform for Trainers to list and manage group sessions, but does not employ, supervise, or control the training activities themselves.\n\nTrainers are responsible for:\n• The accuracy of their profile, certifications, and session descriptions\n• Conducting sessions in a safe, professional, and appropriate manner\n• Compliance with applicable laws and licensing requirements\n• Maintaining appropriate insurance`,
  },
  {
    title: "Bookings and payments",
    body: `When you book a session, you agree to pay the listed price per player. All payments are processed securely by Stripe. Grupup collects a 15% platform fee on all transactions; the remainder is paid to the Trainer.\n\nFor group sessions (semi-private, small group, clinic), pricing is set by the platform and is fixed. For private (1-on-1) sessions, pricing is set by the Trainer and displayed clearly before booking.`,
  },
  {
    title: "Cancellations and refunds",
    body: `You may cancel a booking free of charge up to 24 hours before the scheduled session start time. Cancellations made within 24 hours of the session may be subject to a fee of up to 50% of the session price, at the Trainer's discretion.\n\nIf a Trainer cancels a session, you will receive a full refund. Grupup reserves the right to issue refunds in cases of verified misconduct or platform error.`,
  },
  {
    title: "Prohibited conduct",
    body: `You agree not to:\n• Provide false information on your profile\n• Use the platform to harass, harm, or discriminate against any person\n• Circumvent Grupup's booking or payment system by arranging off-platform transactions\n• Scrape, reverse engineer, or misuse the platform\n• Post false or misleading reviews\n\nViolation of these rules may result in account suspension or termination.`,
  },
  {
    title: "Limitation of liability",
    body: `Grupup provides a technology platform to connect players and trainers. We are not responsible for the quality, safety, or outcomes of training sessions. To the maximum extent permitted by law, Grupup's liability for any claim arising from use of the platform is limited to the amount you paid for the session in question.`,
  },
  {
    title: "Governing law",
    body: `These Terms are governed by the laws of the State of North Carolina, without regard to its conflict-of-law provisions. Any disputes shall be resolved in the courts of Wake County, North Carolina.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-14">
        <div className="container max-w-3xl">
          <p className="text-white/50 text-sm mb-2">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-white/60 text-sm">Last updated April 23, 2026</p>
        </div>
      </div>

      <div className="container max-w-3xl py-14">
        <div className="bg-white rounded-2xl border p-8 md:p-12 space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service govern your use of the Grupup platform. Please read them carefully before creating an account or booking a session.
          </p>

          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? Email us at{" "}
              <a href="mailto:legal@grupup.com" className="text-foreground font-medium underline">legal@grupup.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
