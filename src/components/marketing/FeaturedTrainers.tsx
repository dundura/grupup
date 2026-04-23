import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainerCard } from "./TrainerCard";
import { trainers } from "@/lib/mock-data";

export function FeaturedTrainers() {
  const featured = trainers.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Featured trainers</h2>
            <p className="text-lg text-muted-foreground">
              Top-rated trainers in your area, ready to book.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start">
            <Link href="/trainers">
              View all trainers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="md:hidden flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory">
          {featured.map((trainer) => (
            <div key={trainer.id} className="min-w-[280px] snap-start">
              <TrainerCard trainer={trainer} />
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </div>
    </section>
  );
}
