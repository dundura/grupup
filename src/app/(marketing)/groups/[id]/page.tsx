import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Award, CalendarDays, ChevronLeft, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainers, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let trainer;
  let sessions: typeof trainerSessions.$inferSelect[] = [];

  try {
    const [row] = await db.select().from(trainers).where(eq(trainers.id, id));
    if (!row) notFound();
    trainer = row;

    sessions = await db
      .select()
      .from(trainerSessions)
      .where(and(eq(trainerSessions.trainerClerkId, trainer.clerkId!), eq(trainerSessions.isActive, true)));
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="container pt-6">
        <Link href="/trainers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          All trainers
        </Link>
      </div>

      {/* Hero */}
      <div className="border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container py-10">
          <div className="flex items-start gap-6">
            {trainer.photo && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0">
                <Image src={trainer.photo} alt={trainer.name} fill className="object-cover" sizes="96px" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{trainer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm mb-3">
                {(trainer.city || trainer.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[trainer.city, trainer.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {trainer.yearsExperience ? <span>{trainer.yearsExperience} yrs experience</span> : null}
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {trainer.rating?.toFixed(1)} ({trainer.reviewCount} reviews)
                </span>
              </div>
              {(trainer.sports ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(trainer.sports ?? []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 text-white">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14">
          <div className="space-y-10">

            {/* Bio */}
            {trainer.bio && (
              <section>
                <h2 className="text-xl font-bold mb-3">About {trainer.name.split(" ")[0]}</h2>
                <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: trainer.bio }} />
              </section>
            )}

            {/* Specialties */}
            {(trainer.specialties ?? []).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {(trainer.specialties ?? []).map((s) => (
                    <Badge key={s} variant="outline" className="text-sm py-1.5 px-3">{s}</Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {(trainer.certifications ?? []).length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(trainer.certifications ?? []).map((c) => (
                    <Badge key={c} variant="secondary" className="text-sm py-1.5 px-3">{c}</Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Sessions */}
            {sessions.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Available Sessions
                </h2>
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="border rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold">{s.title}</p>
                          <p className="text-sm text-muted-foreground">{s.sessionType} · {s.sport}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg">${s.pricePerPlayer}</p>
                          <p className="text-xs text-muted-foreground">per player</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {s.dayOfWeek && s.time && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {s.dayOfWeek} at {s.time}
                          </span>
                        )}
                        {s.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {s.duration} min
                          </span>
                        )}
                        {s.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {s.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {s.spotsLeft} of {s.spotsTotal} spots left
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
                          <Link href={`/groups?trainer=${trainer.id}`}>Book this session</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sessions.length === 0 && (
              <div className="border rounded-2xl p-8 text-center">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-semibold mb-1">No sessions posted yet</p>
                <p className="text-sm text-muted-foreground">Check back soon or browse other coaches.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{trainer.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">· {trainer.reviewCount} reviews</span>
              </div>
              {trainer.hourlyRate && (
                <div className="mb-5">
                  <span className="text-2xl font-bold">${trainer.hourlyRate}</span>
                  <span className="text-muted-foreground text-sm"> / hr (private rate)</span>
                </div>
              )}
              <Button size="lg" className="w-full mb-3" style={{ backgroundColor: "#DC373E" }} asChild>
                <Link href="/groups">Browse all sessions</Link>
              </Button>
              {(trainer.skillLevels ?? []).length > 0 && (
                <div className="mt-5 pt-5 border-t">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Coaches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(trainer.skillLevels ?? []).map((l) => (
                      <span key={l} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden sticky bottom-0 bg-background border-t p-4 shadow-lg">
        <Button size="lg" className="w-full" style={{ backgroundColor: "#DC373E" }} asChild>
          <Link href="/groups">Browse sessions</Link>
        </Button>
      </div>
    </div>
  );
}
