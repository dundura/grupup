import Link from "next/link";
import { Search, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const steps = [
  {
    icon: Search,
    title: "1. Find Your Trainer",
    description: "Browse vetted private trainers by location, specialty, price, and skill level.",
    details: [
      "Filter by city, price, and training focus",
      "Read authentic reviews from soccer parents",
      "See certifications and years of experience",
      "Compare trainers side by side",
    ],
  },
  {
    icon: Calendar,
    title: "2. Book a Session",
    description: "Pick a time, pay securely, and confirm. No awkward back-and-forth.",
    details: [
      "Transparent pricing - see rates upfront",
      "Secure payment with Stripe",
      "Pick from trainer's live availability",
      "Free cancellation up to 24 hours before",
    ],
  },
  {
    icon: Trophy,
    title: "3. Train & Improve",
    description: "Meet at an agreed location. Train. Get a personalized recap.",
    details: [
      "Focused 1-on-1 attention",
      "Session notes sent after training",
      "Track progress over multiple sessions",
      "Rate and review your experience",
    ],
  },
];

const faqs = [
  {
    q: "How do you vet trainers?",
    a: "Every trainer submits proof of certifications, coaching experience, and a background check. We verify credentials and review coaching style before approving them to offer sessions on the platform.",
  },
  {
    q: "What ages do you train?",
    a: "Most of our trainers work with players ages 6-18. Each trainer lists the age groups and skill levels they specialize in on their profile.",
  },
  {
    q: "Where do sessions take place?",
    a: "Sessions happen at public fields, parks, or facilities agreed upon by the trainer and parent. Some trainers have preferred locations listed on their profile.",
  },
  {
    q: "What if I need to cancel?",
    a: "Free cancellation up to 24 hours before your session. Cancellations within 24 hours may incur a 50% fee, at the trainer's discretion.",
  },
  {
    q: "How much does it cost?",
    a: "Session rates are set by individual trainers, typically between $40-$120 per session depending on experience and demand. The price you see on the trainer's profile is what you pay.",
  },
  {
    q: "Is this just for elite players?",
    a: "Not at all. We have trainers who love working with beginners as much as elite-level players. Filter by skill level to find the right match for your player.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b">
        <div className="container py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            How <span className="text-primary">Grupup</span> works
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps from finding a trainer to getting better on the field.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="space-y-16">
            {steps.map((step) => (
              <div key={step.title} className="grid md:grid-cols-[80px_1fr] gap-6">
                <div className="flex md:block">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h2>
                  <p className="text-lg text-muted-foreground mb-5">{step.description}</p>
                  <ul className="space-y-2.5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/30 border-y">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Frequently asked questions</h2>
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

      <section className="py-16 md:py-24 text-center">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">Browse trainers in your area and book your first session.</p>
          <Button size="lg" asChild>
            <Link href="/trainers">Find a Trainer</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
