import Link from "next/link";
import Image from "next/image";
import { Search, CalendarCheck, Zap, Users, RefreshCw, ShieldCheck, Star, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Grupup",
  description: "Find vetted local coaches running small-group sessions — affordable, flexible, and built around your schedule.",
};

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Find a Session",
    body: "Browse group training sessions by sport, location, skill level, and schedule. Every coach on Grupup is vetted — real profiles, real reviews. Filter by city or specialty to find exactly what your athlete needs.",
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
    cta: { label: "Browse sessions", href: "/groups" },
  },
  {
    n: "02",
    icon: CalendarCheck,
    title: "Reserve Your Spot",
    body: "See open spots, pick the session that fits your schedule, and pay securely in seconds. No back-and-forth with the coach, no waiting for confirmation. Your spot is locked the moment you pay.",
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
    cta: { label: "Find a trainer", href: "/trainers" },
  },
  {
    n: "03",
    icon: Zap,
    title: "Train & Improve",
    body: "Show up, work hard, and let the coach do their thing. Small groups mean more reps, real competition, and direct feedback — every session. Track your progress and book your next one in the same place.",
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
    cta: null,
  },
];

const types = [
  { icon: Users,       title: "Small Group Sessions", desc: "2–6 players with one coach. Real competition, more reps, fraction of the private price. The most popular format on Grupup." },
  { icon: RefreshCw,   title: "Training Plans",        desc: "Book a multi-week plan upfront — pay once, attend every session. Coaches offer a discount, players get consistency." },
  { icon: Zap,         title: "Clinics",               desc: "Larger group sessions (7–20 players) focused on one skill or topic. Great for introducing new players to a training environment." },
];

const benefits = [
  { icon: Users,        title: "Vetted Local Coaches",  desc: "Every trainer on Grupup has a profile, specialties, and verified reviews from real players and parents." },
  { icon: ShieldCheck,  title: "Secure Payments",       desc: "All payments processed by Stripe. No need to bring cash, write checks, or chase invoices." },
  { icon: Star,         title: "GrupUp Guarantee",      desc: "If your first session doesn't meet expectations, we'll help you find a better match or refund your booking." },
  { icon: CalendarCheck,title: "Flexible Scheduling",   desc: "One-off sessions, weekly recurring, or multi-week training plans — book what fits your schedule." },
  { icon: RefreshCw,    title: "Easy Cancellation",     desc: "Cancel up to 24 hours before a session for a full refund. No questions asked." },
  { icon: Search,       title: "All Sports",            desc: "Soccer, basketball, football, tennis, lacrosse, and more — all in one place." },
];

const testimonials = [
  {
    quote: "After the first session my son's confidence on the ball completely changed. The small group format meant the coach could actually watch him and give real feedback — not just shout drills.",
    name: "Maria T.", role: "Soccer parent · Cary NC",
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
  },
  {
    quote: "I was paying $90/hr for private training. Group sessions on Grupup cost me $25 and honestly the level of training is just as good — maybe better because there's actual competition.",
    name: "James K.", role: "Player · U16",
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="text-white text-center py-16 md:py-24 px-4" style={{ backgroundColor: "#0F3154" }}>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">How Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> Works</h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
          The easiest way to find vetted local coaches running small-group sessions — affordable, flexible, and built around your schedule.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/groups" className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "#DC373E" }}>Browse sessions</Link>
          <Link href="/trainers" className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">
            Find a trainer
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white py-16 md:py-20 px-4">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Three steps to leveling up</h2>
          <div className="space-y-16">
            {steps.map((s, i) => (
              <div key={s.n}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="relative w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-md shrink-0">
                  <Image src={s.img} alt={s.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                  <div className="absolute top-4 left-4 text-6xl font-black text-white/20 select-none leading-none">{s.n}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#0F3154" }}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step {s.n}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">{s.body}</p>
                  {s.cta && (
                    <Link href={s.cta.href} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                      style={{ color: "#DC373E" }}>
                      {s.cta.label} <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training types */}
      <div className="py-16 md:py-20 px-4 bg-[#f7f8fa]">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Training formats</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Choose the format that fits your athlete's goals and schedule.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {types.map((t) => (
              <div key={t.title} className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: "#0F3154" }}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 md:py-20 px-4 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What players & parents say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#f7f8fa] rounded-2xl p-6 border">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image src={t.img} alt={t.name} fill className="object-cover" sizes="40px" unoptimized />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 md:py-20 px-4 bg-[#f7f8fa]">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border p-5 shadow-sm flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: "#f0f4f9" }}>
                  <b.icon className="h-5 w-5" style={{ color: "#0F3154" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-white text-center py-16 px-4" style={{ backgroundColor: "#0F3154" }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to find your session?</h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">Join players and families training smarter with small-group coaching.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/groups" className="px-8 py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#DC373E" }}>
            Browse group sessions
          </Link>
          <Link href="/for-trainers" className="px-8 py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">
            I'm a coach →
          </Link>
        </div>
      </div>

    </div>
  );
}
