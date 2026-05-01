import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Soccer Training Near You | Grupup",
  description: "Book a coached group session from $22/player. Up to 65% less than private training. Find sessions near you.",
};

const benefits = [
  {
    emoji: "💰",
    title: "From $22 per player",
    desc: "Split the cost with other players. Up to 65% less than private training — same vetted coach, same quality.",
  },
  {
    emoji: "⚽",
    title: "Small groups, real reps",
    desc: "2–6 players per session. More touches, more competition, and direct feedback from the coach every time.",
  },
  {
    emoji: "📍",
    title: "Local, vetted coaches",
    desc: "Every coach on Grupup is reviewed and experienced. Find sessions near you and book a spot in minutes.",
  },
  {
    emoji: "📅",
    title: "Flexible booking",
    desc: "One session or a weekly series — book what fits your schedule. Cancel up to 24 hours before for a full refund.",
  },
];

export default function ForParentsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">

      {/* Hero */}
      <div className="w-full text-center px-4 pt-16 pb-12" style={{ backgroundColor: "#0F3154" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#DC373E" }}>
          Group Sports Training
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 max-w-2xl mx-auto">
          Expert coaching.<br />A fraction of the price.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
          Book a coached group session from <span className="text-white font-bold">$22/player</span>. Train with others near you and level up your game.
        </p>
        <Link
          href="/groups?sport=soccer"
          className="inline-block px-10 py-4 rounded-2xl font-bold text-white text-base"
          style={{ backgroundColor: "#DC373E" }}
        >
          Find Sessions Near Me →
        </Link>
        <p className="text-white/40 text-xs mt-4">No account needed to browse</p>
      </div>

      {/* Benefits */}
      <div className="w-full max-w-3xl px-4 py-14">
        <div className="grid sm:grid-cols-2 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="bg-[#f7f8fa] rounded-2xl p-6 flex flex-col gap-2">
              <span className="text-3xl">{b.emoji}</span>
              <p className="font-bold text-base" style={{ color: "#0F3154" }}>{b.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="w-full max-w-2xl px-4 pb-14 text-center">
        <p className="text-lg italic text-gray-600 leading-relaxed mb-4">
          "I was paying $90/hr for private training. Group sessions on Grupup cost me $25 and honestly the level of training is just as good — maybe better because there's actual competition."
        </p>
        <p className="text-sm font-semibold" style={{ color: "#0F3154" }}>James K. — Player, U16</p>
      </div>

      {/* Bottom CTA */}
      <div className="w-full bg-[#f7f8fa] py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "#0F3154" }}>
          Ready to find a session?
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Browse sessions near you and book a spot in minutes.</p>
        <Link
          href="/sign-up"
          className="inline-block px-10 py-4 rounded-2xl font-bold text-white text-base mb-4"
          style={{ backgroundColor: "#DC373E" }}
        >
          Create Free Account
        </Link>
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline" style={{ color: "#0F3154" }}>Sign in</Link>
        </p>
      </div>

    </div>
  );
}
