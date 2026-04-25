import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Calendar, Award, MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrainerDetailHero } from "@/components/trainers/TrainerDetailHero";
import { trainers } from "@/lib/mock-data";
import { formatReviewDate } from "@/lib/utils";

export function generateStaticParams() {
  return trainers.map((t) => ({ id: t.id }));
}

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainer = trainers.find((t) => t.id === id);
  if (!trainer) notFound();

  return (
    <div>
      <div className="container pt-6">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All trainers
        </Link>
      </div>

      <TrainerDetailHero trainer={trainer} />

      <div className="container py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {trainer.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-sm py-1.5 px-3">
                    {cert}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Upcoming availability
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {trainer.availability.map((slot) => (
                  <div key={slot.id} className="bg-card border rounded-xl p-4">
                    <div className="font-semibold">
                      {new Date(slot.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Reviews ({trainer.reviewCount})
              </h2>
              <div className="space-y-5">
                {trainer.reviews.map((review) => (
                  <div key={review.id} className="bg-card border rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{review.parentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.kidName}&apos;s parent, age {review.kidAge}
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? "h-4 w-4 fill-accent text-accent"
                                : "h-4 w-4 fill-muted text-muted"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-relaxed mb-3">{review.comment}</p>
                    <div className="text-xs text-muted-foreground">{formatReviewDate(review.date)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-card border rounded-2xl p-6 shadow-lg">
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${trainer.hourlyRate}</span>
                    <span className="text-muted-foreground">/ session</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{trainer.rating}</span>
                    <span className="text-muted-foreground">· {trainer.reviewCount} reviews</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-3">
                  Book a Session
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  Message {trainer.name.split(" ")[0]}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free cancellation up to 24 hours before
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 bg-background border-t p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">${trainer.hourlyRate}</span>
              <span className="text-sm text-muted-foreground">/ session</span>
            </div>
            <div className="text-xs text-muted-foreground">Free cancel 24h before</div>
          </div>
          <Button size="lg" className="shrink-0">
            Book a Session
          </Button>
        </div>
      </div>
    </div>
  );
}
