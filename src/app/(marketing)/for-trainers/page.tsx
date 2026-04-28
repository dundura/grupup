import Link from "next/link";
import Image from "next/image";
import { DollarSign, Users, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const benefits = [
  {
    icon: DollarSign,
    title: "Keep 85% of every session",
    description: "We take a flat 15% platform fee. No hidden costs. Direct Stripe payouts to your bank.",
  },
  {
    icon: Users,
    title: "We bring you the clients",
    description: "Sports families actively search our platform for group training sessions. No more cold outreach.",
  },
  {
    icon: Calendar,
    title: "Control your schedule",
    description: "Set your own availability. Accept or decline bookings. Work as much or little as you want.",
  },
  {
    icon: TrendingUp,
    title: "Grow your reputation",
    description: "Build a public profile with reviews that follows you. Top-rated trainers get featured.",
  },
];

const steps = [
  { n: 1, title: "Create your account", desc: "Sign up in 30 seconds. No credit card required." },
  { n: 2, title: "Build your trainer profile", desc: "Add your photo, bio, sport, location, and experience. This is what players see." },
  { n: 3, title: "Post at least one group session", desc: "Create your first semi-private, small group, or clinic session. This is required to be listed on the platform." },
  { n: 4, title: "Submit for approval", desc: "Our team reviews your profile within 1–2 business days. Once approved, your sessions go live." },
  { n: 5, title: "Get booked & get paid", desc: "Players book directly. Stripe deposits land in your account 24 hours after each session." },
];

const faqs = [
  {
    q: "What qualifications do I need?",
    a: "At minimum, we look for a coaching license (USSF D License or equivalent) and demonstrable experience working with youth players. Collegiate or professional playing experience is a plus.",
  },
  {
    q: "How do I get paid?",
    a: "Payments are handled through Stripe Connect. When a parent books and pays, funds are held until 24 hours after the session is completed, then automatically transferred to your bank account.",
  },
  {
    q: "Do I set my own rates?",
    a: "For private sessions, yes — you set your own rate based on your experience and demand. For group formats (semi-private, small group, clinic), the platform sets the per-player rate. You choose the format and schedule; we handle the pricing.",
  },
  {
    q: "Is there an exclusivity requirement?",
    a: "No. You can continue training players through other channels. Grupup is designed to supplement your existing work with consistent new bookings.",
  },
  {
    q: "What about insurance?",
    a: "Trainers are independent contractors responsible for their own liability insurance. We can recommend affordable policies during onboarding.",
  },
];

export default function ForTrainersPage() {
  return (
    <div>
      {/* Hero — matches homepage style */}
      <section className="bg-[#f4f6f9] px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <div className="relative rounded-[20px] max-w-7xl mx-auto" style={{ backgroundColor: "#0F3154" }}>
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-5 rounded-[20px] overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="relative px-6 sm:px-8 lg:px-12 py-16 md:py-24">
            <div className="flex items-center gap-12">

              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-[#DC373E] font-semibold text-sm uppercase tracking-wider mb-4">
                  Now accepting applications
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                  Do what you love.{" "}
                  <span style={{ color: "#DC373E" }}>Get paid for it.</span>
                </h1>
                <p className="text-white/70 text-lg md:text-xl mb-8 max-w-xl">
                  Join a platform built for group sports coaches. We handle bookings, payments, and marketing — you just coach.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/sign-up"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base"
                    style={{ backgroundColor: "#DC373E" }}>
                    Apply Now
                  </Link>
                  <Link href="/trainer/new-session"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                    Create a Session →
                  </Link>
                </div>
              </div>

              {/* Right — photo + floating card */}
              <div className="hidden lg:block relative w-[420px] shrink-0">
                <div className="relative w-full h-[460px] rounded-2xl overflow-hidden">
                  <Image
                    src="https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg"
                    alt="Coach leading a group training session"
                    fill
                    className="object-cover object-top"
                    sizes="420px"
                    unoptimized
                  />
                </div>
                {/* Floating card — earnings */}
                <div className="absolute -top-4 right-4 rounded-xl shadow-xl p-4 w-52"
                  style={{ backgroundColor: "#0F3154", animation: "heroFloat 5s ease-in-out infinite" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Session payout</p>
                  </div>
                  <p className="text-sm font-semibold text-white">6 players × $25 = $150</p>
                  <p className="text-xs text-white/60 mt-1">You keep $127 · 85% payout</p>
                </div>
                {/* Floating card — bookings */}
                <div className="absolute -bottom-4 left-4 bg-white rounded-xl shadow-xl p-4 w-52"
                  style={{ animation: "heroFloat 5s ease-in-out 2.5s infinite" }}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">New booking</p>
                  <p className="text-sm font-semibold text-gray-800">Tuesday Finishing Clinic</p>
                  <p className="text-xs text-gray-500 mt-1">3 of 6 spots filled · Cary, NC</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why trainers choose us</h2>
            <p className="text-lg text-muted-foreground">
              The highest payout in the industry with the tools to run your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card border rounded-2xl p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">You keep 85%.</h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
            That&apos;s it. No subscription. No listing fees. A flat 15% per booking covers payment processing, platform maintenance, and marketing that brings you clients.
          </p>
          <div className="inline-flex items-baseline gap-2 bg-primary-foreground/10 rounded-2xl px-8 py-6">
            <span className="text-5xl font-bold">85%</span>
            <span className="text-xl opacity-80">payout per session</span>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">How to get started</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.n} className="flex items-start gap-4 bg-card border rounded-xl p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold shrink-0 text-white" style={{ backgroundColor: "#0F3154" }}>
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-base">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/30 border-y">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Common questions</h2>
          <Accordion type="single" collapsible className="bg-card border rounded-2xl px-6">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base md:text-lg">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="apply" className="py-16 md:py-24 text-center">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Apply today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Applications reviewed within 3 business days. Start earning in 1-2 weeks.
          </p>
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base"
            style={{ backgroundColor: "#DC373E" }}>
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
