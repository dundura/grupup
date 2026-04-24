import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to find your trainer?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join hundreds of sports families finding elite group training sessions. Book your spot today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/trainers">
                Browse Trainers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/for-trainers">I&apos;m a Trainer</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
