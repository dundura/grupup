import { Search, Calendar, Trophy } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Find Your Trainer",
    description: "Browse group training sessions by location, specialty, and skill level. Read reviews from real parents.",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Book a Session",
    description: "Pick a time that works for you. Secure booking with transparent pricing. Cancel free up to 24 hours before.",
  },
  {
    icon: Trophy,
    number: "03",
    title: "Train & Improve",
    description: "Meet your trainer, crush the session, and get a personalized recap. Track progress over time.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps from finding a trainer to getting better on the field.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative bg-card border rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="text-4xl font-bold text-muted-foreground/20">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
