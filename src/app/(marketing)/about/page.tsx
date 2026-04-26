import Link from "next/link";
import { ShieldCheck, Users, Heart, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Grupup",
  description: "Grupup was built by people who believe great coaching changes lives. Learn about our story, our team, and our mission.",
};

const pillars = [
  {
    icon: Heart,
    title: "Built by Coaches & Parents",
    body: "Grupup was created by people who've been on both sides of the session — as trainers logging thousands of hours, and as parents trying to find the right fit for their kids. We know what athletes, families, and coaches actually need.",
  },
  {
    icon: ShieldCheck,
    title: "Selective by Design",
    body: "We're deliberate about who coaches on Grupup. Every trainer goes through a review process and must demonstrate real experience working with youth athletes. Quality over volume — always.",
  },
  {
    icon: Users,
    title: "Mission Driven",
    body: "In a youth sports world that can feel transactional and overwhelming, we aim to be something different. Every coach-athlete connection on Grupup matters to us. Hearing from athletes who reach their goals because of a coach they found here — that's what drives us.",
  },
];

const founders = [
  {
    name: "Neil Crawford",
    title: "Founder & CEO",
    bio: "Neil has spent years coaching youth athletes and building communities around sport. He created Grupup after seeing firsthand how hard it was for families to find quality, affordable group training — and how isolated great local coaches were from the players who needed them most.",
    memory: "\"The moment a player gets it — when something clicks after weeks of work. There's nothing like it.\"",
    initials: "NC",
  },
];

const team = [
  {
    name: "Jordan Ellis",
    title: "Head of Community",
    bio: "Multi-sport athlete turned community builder. Jordan manages coach onboarding and makes sure every trainer on Grupup is set up to succeed.",
    memory: "\"My first travel tournament. Three days, new city, new friends — that was the moment I fell in love with team sports.\"",
    initials: "JE",
  },
  {
    name: "Priya Shah",
    title: "Product",
    bio: "Youth soccer parent who got tired of the back-and-forth of finding coaches. Priya joined Grupup to build the booking experience she always wished existed.",
    memory: "\"Watching my daughter score her first goal. She looked up at me from across the field and we both just started laughing.\"",
    initials: "PS",
  },
  {
    name: "Marcus Webb",
    title: "Engineering",
    bio: "Former college athlete who now builds the platform. Marcus keeps Grupup fast, reliable, and ready for whenever the next session drops.",
    memory: "\"Running out of the tunnel for my first home game. Pure noise, pure adrenaline.\"",
    initials: "MW",
  },
];

const advisors = [
  { name: "Sandra Okafor", note: "Youth sports operations expert with 15+ years running regional training programs across the Southeast." },
  { name: "David Park", note: "Co-founded a marketplace platform connecting coaches and athletes across multiple sports verticals." },
  { name: "Renata Voss", note: "Managing Director at a sports-focused venture fund. Former collegiate swimmer and youth swim coach." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="text-white py-16 md:py-24 px-4" style={{ backgroundColor: "#0F3154" }}>
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#DC373E" }}>Our Story & Team</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
            We believe great coaching changes lives.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Whether your goal is to make the team, learn the fundamentals, build confidence, or simply enjoy the game — we're here to support every step of the journey.
          </p>
        </div>
      </div>

      {/* 3 pillars */}
      <div className="bg-white py-16 md:py-20 px-4">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: "#f0f4f9" }}>
                  <Icon className="h-6 w-6" style={{ color: "#0F3154" }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder */}
      <div className="bg-[#f7f8fa] py-16 md:py-20 px-4">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Meet the Founder</h2>
          <div className="flex justify-center">
            {founders.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl border shadow-sm p-8 max-w-lg w-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white shrink-0"
                    style={{ backgroundColor: "#0F3154" }}>
                    {p.initials}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-sm font-semibold" style={{ color: "#DC373E" }}>{p.title}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{p.bio}</p>
                <div className="border-l-4 pl-4" style={{ borderColor: "#0F3154" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Favorite sports memory</p>
                  <p className="text-sm italic text-muted-foreground">{p.memory}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership team */}
      <div className="bg-white py-16 md:py-20 px-4">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((p) => (
              <div key={p.name} className="bg-[#f7f8fa] rounded-2xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-white shrink-0"
                    style={{ backgroundColor: "#0F3154" }}>
                    {p.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs font-semibold" style={{ color: "#DC373E" }}>{p.title}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4">{p.bio}</p>
                <div className="border-l-2 pl-3" style={{ borderColor: "#e2e8f0" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Favorite memory</p>
                  <p className="text-xs italic text-muted-foreground">{p.memory}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisors */}
      <div className="bg-[#f7f8fa] py-16 px-4">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Advisors</h2>
          <div className="space-y-4">
            {advisors.map((a) => (
              <div key={a.name} className="bg-white rounded-xl border p-5 flex gap-4 items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: "#0F3154" }}>
                  {a.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-white text-center py-16 px-4" style={{ backgroundColor: "#0F3154" }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to find your trainer?</h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          Browse vetted coaches running small-group sessions near you — and book in minutes.
        </p>
        <Link href="/trainers"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ backgroundColor: "#DC373E" }}>
          Find a Trainer <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}
