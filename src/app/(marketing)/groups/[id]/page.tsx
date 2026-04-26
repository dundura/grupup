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
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="container max-w-3xl py-8 px-4">

        {/* Back */}
        <Link href="/trainers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> All trainers
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5">

          {/* Header strip */}
          <div className="h-20 w-full" style={{ backgroundColor: "#0F3154" }} />

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0">
                {trainer.photo ? (
                  <Image src={trainer.photo} alt={trainer.name} fill className="object-cover" sizes="80px" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {trainer.name?.[0] ?? "T"}
                  </div>
                )}
              </div>
              <div className="pb-1 min-w-0">
                <h1 className="text-xl font-bold leading-tight">{trainer.name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                  {(trainer.city || trainer.state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[trainer.city, trainer.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{trainer.rating?.toFixed(1)}</span>
                    <span>({trainer.reviewCount} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {trainer.yearsExperience ? (
                <div className="text-center bg-[#f7f8fa] rounded-xl p-3">
                  <p className="text-lg font-bold">{trainer.yearsExperience}</p>
                  <p className="text-xs text-muted-foreground">Years exp</p>
                </div>
              ) : null}
              {trainer.hourlyRate ? (
                <div className="text-center bg-[#f7f8fa] rounded-xl p-3">
                  <p className="text-lg font-bold">${trainer.hourlyRate}</p>
                  <p className="text-xs text-muted-foreground">Private /hr</p>
                </div>
              ) : null}
              <div className="text-center bg-[#f7f8fa] rounded-xl p-3">
                <p className="text-lg font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Active sessions</p>
              </div>
            </div>

            {/* Sports */}
            {(trainer.sports ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(trainer.sports ?? []).map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "#0F3154", color: "white" }}>{s}</span>
                ))}
              </div>
            )}

            {/* Bio */}
            {trainer.bio && (
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: trainer.bio }} />
            )}
          </div>
        </div>

        {/* Specialties + certs */}
        {((trainer.specialties ?? []).length > 0 || (trainer.certifications ?? []).length > 0) && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-5 space-y-4">
            {(trainer.specialties ?? []).length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1.5">
                  {(trainer.specialties ?? []).map((s) => (
                    <Badge key={s} variant="outline" className="text-sm">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {(trainer.certifications ?? []).length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(trainer.certifications ?? []).map((c) => (
                    <Badge key={c} variant="secondary" className="text-sm">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sessions */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> Available Sessions
          </p>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold mb-1">No sessions posted yet</p>
              <p className="text-sm text-muted-foreground">Check back soon or browse other coaches.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.sessionType.replace("-", " ")} · {s.sport}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">${s.pricePerPlayer}</p>
                      <p className="text-xs text-muted-foreground">per player</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-3">
                    {s.dayOfWeek && s.time && (
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{s.dayOfWeek} at {s.time}</span>
                    )}
                    {s.duration && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration} min</span>
                    )}
                    {s.city && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{s.spotsLeft} of {s.spotsTotal} spots left
                    </span>
                  </div>
                  <Button size="sm" style={{ backgroundColor: "#DC373E" }} asChild>
                    <Link href="/groups">Book this session</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
