import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "After the first session my son's confidence on the ball completely changed. The small group format meant the coach could actually watch him and give real feedback — not just shout drills.",
    name: "Maria T.",
    role: "Soccer parent",
    city: "Cary, NC",
    rating: 5,
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
    imgPosition: "object-center",
  },
  {
    id: 2,
    quote: "I was paying $90/hr for private training. Group sessions on Grupup cost me $25 and honestly the level of training is just as good — maybe better because there's actual competition.",
    name: "James K.",
    role: "U16 Player",
    city: "Charlotte, NC",
    rating: 5,
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
    imgPosition: "object-top",
  },
  {
    id: 3,
    quote: "Finding a good coach used to take weeks of searching and DMs. I found one on Grupup, booked in 2 minutes, and my daughter was on the field the next Saturday.",
    name: "Denise R.",
    role: "Soccer parent",
    city: "Durham, NC",
    rating: 5,
    img: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
    imgPosition: "object-top",
  },
];

export function Testimonials() {
  return (
    <section className="pt-4 pb-16 md:pt-6 md:pb-20 bg-white">
      <div className="container max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Parents love the results</h2>
          <p className="text-muted-foreground">Real reviews from real sports families.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-[#f7f8fa] border rounded-2xl overflow-hidden shadow-sm flex flex-col">
              {/* Photo */}
              <div className="relative h-44 w-full">
                <Image
                  src={t.img}
                  alt={t.name}
                  fill
                  className={`object-cover ${t.imgPosition}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 relative">
                <Quote className="h-6 w-6 text-[#0F3154]/15 absolute top-4 right-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-3 border-t">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
