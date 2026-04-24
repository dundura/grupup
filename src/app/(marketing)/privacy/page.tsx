export const metadata = { title: "Privacy Policy – Grupup" };

const sections = [
  {
    title: "Information we collect",
    body: `When you create a profile on Grupup, we collect the information you provide directly — such as your name, email address, city, sport preferences, and skill level. If you are a parent booking sessions for a child, we also collect your child's first name and age for the purpose of matching appropriate sessions.\n\nWhen you use the platform, we automatically collect certain usage data including pages visited, session searches, and booking interactions. We use this data to improve recommendations and the overall experience.`,
  },
  {
    title: "How we use your information",
    body: `We use your information to:\n• Create and manage your Grupup profile\n• Match you with relevant group sessions based on sport, city, and skill level\n• Send booking confirmations and session reminders\n• Notify you when a trainer you follow opens a new session\n• Improve and personalize the platform\n• Communicate important updates about your account or the service\n\nWe do not sell your personal information to third parties.`,
  },
  {
    title: "Sharing your information",
    body: `We share limited information with trainers when you book or join a session — specifically your name and, if applicable, your child's name and age. This is necessary for the trainer to manage their group session roster.\n\nWe may share data with trusted service providers (payment processing, email delivery, analytics) who are contractually required to protect your information and use it only to provide services on our behalf.`,
  },
  {
    title: "Payments",
    body: `All payment processing is handled by Stripe. Grupup does not store your credit card or payment details. When you complete a booking, your payment information is transmitted directly to Stripe via their secure infrastructure. Please review Stripe's privacy policy for details on how they handle payment data.`,
  },
  {
    title: "Your choices",
    body: `You can update or delete your profile information at any time from your account settings. You may opt out of marketing emails by clicking "unsubscribe" in any email we send. Booking confirmations and safety notifications cannot be opted out of while you have an active booking.\n\nYou may request deletion of your account and associated data by contacting us at privacy@grupup.com.`,
  },
  {
    title: "Children's privacy",
    body: `Grupup is not directed at children under 13. We do not knowingly collect personal information directly from children under 13. Parents or guardians create accounts and manage bookings on behalf of their children. If you believe we have inadvertently collected information from a child under 13, please contact us immediately.`,
  },
  {
    title: "Changes to this policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page and, for material changes, notify you by email or a notice on the platform.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-14">
        <div className="container max-w-3xl">
          <p className="text-white/50 text-sm mb-2">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/60 text-sm">Last updated April 23, 2026</p>
        </div>
      </div>

      <div className="container max-w-3xl py-14">
        <div className="bg-white rounded-2xl border p-8 md:p-12 space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Grupup ("we", "us", or "our") operates the Grupup platform, which connects players, parents, and coaches for group sports training sessions. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
          </p>

          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold mb-3">{s.title}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</div>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or your personal data, contact us at{" "}
              <a href="mailto:privacy@grupup.com" className="text-foreground font-medium underline">privacy@grupup.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
