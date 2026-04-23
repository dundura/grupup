import { Star, Quote } from "lucide-react";
import { testimonials } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Parents love the results
          </h2>
          <p className="text-lg text-muted-foreground">
            Real reviews from real soccer families.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-card border rounded-2xl p-8 relative">
              <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < t.rating
                        ? "h-4 w-4 fill-accent text-accent"
                        : "h-4 w-4 fill-muted text-muted"
                    }
                  />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>

              <div className="pt-4 border-t">
                <div className="font-semibold">{t.parentName}</div>
                <div className="text-sm text-muted-foreground">
                  {t.kidName}&apos;s parent, age {t.kidAge} · {t.city}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
