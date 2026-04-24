import Link from "next/link";
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
    description: "Soccer families actively search our platform for group training sessions. No more cold outreach.",
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
  "Apply with proof of coaching certifications and experience",
  "Complete a short onboarding call with our team",
  "Set up your Stripe account for secure payouts",
  "Build your profile, set your rates, start booking sessions",
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
    a: "Yes. You set your hourly rate based on your experience and demand. Most trainers on the platform charge between $50-$120 per session.",
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
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b">
        <div className="container py-16 md:py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-semibold mb-6">
            <span>Now accepting applications</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Do what you love.{" "}
            <span className="text-primary">Get paid for it.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join a platform built for private soccer trainers. We handle bookings, payments, and marketing. You do what you do best.
          </p>
          <Button size="lg" asChild>
            <Link href="#apply">Apply Now</Link>
          </Button>
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
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-card border rounded-xl p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-lg pt-1.5">{step}</p>
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
          <Button size="lg">Start Application</Button>
        </div>
      </section>
    </div>
  );
}
