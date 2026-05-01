import Link from "next/link";
import Image from "next/image";
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
      <div className="w-full px-4 pt-10 pb-0" style={{ backgroundColor: "#0F3154" }}>
        <div className="max-w-5xl mx-auto">

          {/* Text */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#DC373E" }}>
              Group Sports Training
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
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

          {/* Photo strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-0">
            <div className="relative col-span-2 sm:col-span-1 rounded-t-2xl overflow-hidden" style={{ height: "260px" }}>
              <Image
                src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777378113162-feqi88.png"
                alt="Soccer group training"
                fill
                className="object-cover"
                style={{ objectPosition: "center 35%" }}
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-sm drop-shadow">⚽ Soccer</p>
            </div>
            <div className="relative rounded-t-2xl overflow-hidden hidden sm:block" style={{ height: "260px" }}>
              <Image
                src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777377344723-zsegtl.png"
                alt="Basketball group training"
                fill
                className="object-cover"
                sizes="33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-sm drop-shadow">🏀 Basketball</p>
            </div>
            <div className="relative rounded-t-2xl overflow-hidden hidden sm:block" style={{ height: "260px" }}>
              <Image
                src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777377633398-c04se8.png"
                alt="Football group training"
                fill
                className="object-cover"
                sizes="33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-sm drop-shadow">🏈 Football</p>
            </div>
          </div>

        </div>
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
      <div className="w-full max-w-3xl px-4 pb-14">
        <div className="flex flex-col sm:flex-row items-stretch gap-0 rounded-2xl overflow-hidden shadow-md">
          {/* Quote side */}
          <div className="flex-1 bg-[#0F3154] px-8 py-10 flex flex-col justify-center">
            <p className="text-white/90 text-lg italic leading-relaxed mb-6">
              "I was paying $90/hr for private training. Group sessions on Grupup cost me $25 and honestly the level of training is just as good — maybe better because there's actual competition."
            </p>
            <p className="text-white font-bold text-sm">Sarah M.</p>
            <p className="text-white/50 text-xs mt-0.5">Soccer Parent · Cary, NC</p>
          </div>
          {/* Image side */}
          <div className="relative w-full sm:w-56 shrink-0" style={{ minHeight: "260px" }}>
            <Image
              src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1777608895405-gn6vh9.png"
              alt="Sarah M."
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 224px"
              unoptimized
            />
          </div>
        </div>
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
