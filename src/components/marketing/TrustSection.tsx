import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Medal } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Vetted, Experienced Trainers",
    href: "/trainers",
    text: "Every trainer on Grupup is reviewed and brings real coaching experience to every session.",
  },
  {
    icon: Zap,
    title: "Easy Group Booking",
    href: "/groups",
    text: "Book group sessions in minutes. Split the cost with other families and get great training at a fraction of the price.",
  },
  {
    icon: Medal,
    title: "Better Results, Lower Cost",
    href: "/how-it-works",
    text: "Group training builds competition, accountability, and skill — while keeping sessions affordable for every family.",
  },
];

export function TrustSection() {
  return (
    <>
      {/* ── Trust columns ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "#f7f8fa" }}>
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Train Together. Grow Together.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              <strong>Grup<span style={{ color: "#DC373E" }}>Up</span></strong> makes it easy to find local sports trainers and book affordable group sessions for your child.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, href, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col items-start hover:shadow-md transition-shadow">
                {/* Navy top accent */}
                <div className="w-full h-1 rounded-full mb-6" style={{ backgroundColor: "#0F3154" }} />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
                  style={{ backgroundColor: "#0F3154" }}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  <Link href={href} className="hover:underline" style={{ color: "#0F3154" }}>
                    {title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Grupup Works split ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

            {/* Text */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#DC373E" }}>
                How It Works
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-5 leading-tight tracking-tight">
                How Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> Works
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                Find a vetted local trainer, book a spot in minutes, and train with friends who push you to get better — every session, every week.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/trainers"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: "#DC373E" }}>
                  Find a Trainer
                </Link>
                <Link href="/how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Learn more →
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg"
                alt="Youth soccer group training session"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-2.5 shadow-md">
                <p className="text-xs text-muted-foreground">Sessions from</p>
                <p className="text-xl font-extrabold leading-none" style={{ color: "#0F3154" }}>
                  $20<span className="text-sm font-semibold text-muted-foreground">/player</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
