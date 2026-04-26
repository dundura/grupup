import Link from "next/link";
import { ArrowRight, Users, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Users,
    title: "Train with others",
    desc: "Split the cost of a great coach with 2–6 players. Same quality, fraction of the price.",
  },
  {
    icon: Zap,
    title: "Book in seconds",
    desc: "Find a session, pick your spot, pay online. No back-and-forth, no waiting.",
  },
  {
    icon: Calendar,
    title: "Flexible formats",
    desc: "One-off sessions, weekly recurring, or multi-week training plans — your choice.",
  },
];

export function FeaturedTrainers() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Group training, done right
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Grupup connects players and parents with vetted local coaches running
            small-group sessions — affordable, flexible, and built around your schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-background rounded-2xl border p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                style={{ backgroundColor: "#f0f4f9" }}>
                <Icon className="h-5 w-5" style={{ color: "#0F3154" }} />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/groups">
              Browse sessions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
