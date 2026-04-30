import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, CalendarDays, Users, ShieldCheck,
  Star, ChevronLeft, Award, Minus, Plus, Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainers, trainerSessions, trainerFollows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { PackageBooking } from "@/components/trainers/PackageBooking";
import MessageButton from "@/components/messaging/MessageButton";
import FollowButton from "@/components/sessions/FollowButton";
import RequestSessionModal from "@/components/trainers/RequestSessionModal";
import TrainerPlansSection from "@/components/trainers/TrainerPlansSection";

export const dynamic = "force-dynamic";

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let trainer;
  let sessions: typeof trainerSessions.$inferSelect[] = [];
  let followStatus: string | null = null;

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

  const { userId } = await auth();
  if (userId && trainer.clerkId) {
    try {
      const [follow] = await db.select({ status: trainerFollows.status })
        .from(trainerFollows)
        .where(and(eq(trainerFollows.followerClerkId, userId), eq(trainerFollows.trainerClerkId, trainer.clerkId)));
      followStatus = follow?.status ?? null;
    } catch {}
  }

  const sports       = (trainer.sports as string[] | null) ?? (trainer.sport ? [trainer.sport] : []);
  const specialties  = (trainer.certifications as string[] | null) ?? [];
  const location     = [trainer.city, trainer.state].filter(Boolean).join(", ");
  const bioText      = trainer.bio?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
  const skillLevels  = (trainer.skillLevels as string[] | null) ?? [];
  const hasGroupSession = sessions.some((s) => s.sessionType !== "private");

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="container max-w-5xl py-8 px-4">

        {/* Back link */}
        <Link href="/trainers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to search results
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Hero text */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-snug mb-2">
                Book {sports[0] ?? "Sports"} Sessions with {trainer.name}
              </h1>
              {sports.length > 0 && (
                <p className="text-muted-foreground text-base">
                  {sports.join(" · ")} Coach{location ? ` · ${location}` : ""}
                  {trainer.yearsExperience ? ` · ${trainer.yearsExperience} years experience` : ""}
                </p>
              )}
              {trainer.rating != null && (
                <div className="hidden lg:flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(trainer.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-sm">{trainer.rating?.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({trainer.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Mobile-only trainer card */}
            <div className="lg:hidden bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="relative h-56 w-full">
                {trainer.photo ? (
                  <Image src={trainer.photo} alt={trainer.name} fill className="object-cover object-top" sizes="100vw" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                    {trainer.name?.[0] ?? "T"}
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.round(trainer.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground">{trainer.rating?.toFixed(1)} · {trainer.reviewCount} reviews</span>
                  {(trainer.yearsExperience ?? 0) > 0 && (
                    <span className="text-xs text-muted-foreground">· {trainer.yearsExperience} yrs exp</span>
                  )}
                </div>
                {trainer.clerkId && (
                  <FollowButton trainerClerkId={trainer.clerkId} initialIsFollowing={!!followStatus} initialStatus={followStatus} isSignedIn={!!userId} />
                )}
              </div>
            </div>

            {/* 4-column overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {location && (
                <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center gap-2">
                  <MapPin className="h-5 w-5" style={{ color: "#0F3154" }} />
                  <p className="text-xs font-medium leading-snug">{location}</p>
                  <p className="text-[11px] text-muted-foreground">Training location</p>
                </div>
              )}
              {sessions.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center gap-2">
                  <CalendarDays className="h-5 w-5" style={{ color: "#0F3154" }} />
                  <p className="text-xs font-medium">{sessions.length} session{sessions.length === 1 ? "" : "s"}</p>
                  <p className="text-[11px] text-muted-foreground">Available now</p>
                </div>
              )}
              {skillLevels.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center gap-2">
                  <Users className="h-5 w-5" style={{ color: "#0F3154" }} />
                  <p className="text-xs font-medium leading-snug">{skillLevels.slice(0, 2).join(", ")}</p>
                  <p className="text-[11px] text-muted-foreground">Skill levels</p>
                </div>
              )}
              <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium">Verified</p>
                <p className="text-[11px] text-muted-foreground">GrupUp trainer</p>
              </div>
            </div>

            {/* About section */}
            {bioText && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About {trainer.name.split(" ")[0]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {bioText.length > 400 ? `${bioText.slice(0, 400)}…` : bioText}
                </p>
              </div>
            )}

            {/* No sessions — request CTA */}
            {sessions.length === 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#f0f4f9" }}>
                  <CalendarDays className="h-7 w-7" style={{ color: "#0F3154" }} />
                </div>
                <h3 className="font-bold text-base mb-1">No sessions available right now</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {trainer.name.split(" ")[0]} isn't running any group sessions at the moment. Send a request and we'll let them know you're interested.
                </p>
                <RequestSessionModal trainerId={trainer.id} trainerName={trainer.name} />
                <p className="text-xs text-muted-foreground mt-3">We'll follow up within 24 hours.</p>
              </div>
            )}

            {/* Package booking — client component */}
            <PackageBooking
              trainerId={trainer.id}
              trainerName={trainer.name}
              sessions={sessions.map((s) => ({
                id: s.id,
                title: s.title,
                pricePerPlayer: s.pricePerPlayer,
                sessionType: s.sessionType,
                dayOfWeek: s.dayOfWeek ?? "",
                time: s.time ?? "",
                duration: s.duration ?? 60,
                city: s.city ?? "",
                spotsLeft: s.spotsLeft,
                spotsTotal: s.spotsTotal,
              }))}
            />

            {/* Gauge Interest — below group sessions */}
            <TrainerPlansSection trainerId={trainer.id} />

          </div>

          {/* ── RIGHT COLUMN (sidebar) ── */}
          <div className="space-y-5 lg:sticky lg:top-24">

            {/* Trainer card — desktop only */}
            <div className="hidden lg:block bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="relative h-64 w-full">
                {trainer.photo ? (
                  <Image src={trainer.photo} alt={trainer.name} fill className="object-cover object-top" sizes="320px" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {trainer.name?.[0] ?? "T"}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="font-bold text-base">{trainer.name}</p>
                {/* Rating row */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(trainer.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-sm">{trainer.rating?.toFixed(1) ?? "5.0"}</span>
                  <span className="text-muted-foreground text-xs">· {trainer.reviewCount ?? 0} reviews</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {(trainer.yearsExperience ?? 0) > 0 && (
                    <p>· {trainer.yearsExperience} yrs exp</p>
                  )}
                  {location && (
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</p>
                  )}
                </div>
                {trainer.clerkId && (
                  <div className="mt-2 space-y-2">
                    <FollowButton
                      trainerClerkId={trainer.clerkId}
                      initialIsFollowing={!!followStatus}
                      initialStatus={followStatus}
                      isSignedIn={!!userId}
                    />
                    <MessageButton toClerkId={trainer.clerkId} toName={trainer.name} />
                  </div>
                )}
                {/* Private booking — only visible if trainer has at least one group session */}
                {hasGroupSession && (trainer.hourlyRate ?? 0) > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1-on-1 Private</span>
                      <span className="font-extrabold text-lg" style={{ color: "#0F3154" }}>
                        ${trainer.hourlyRate ?? 85}<span className="text-xs font-medium text-muted-foreground">/hr</span>
                      </span>
                    </div>
                    <Link href={`/trainers/${trainer.id}/book-private`}
                      className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "#DC373E" }}>
                      View & Book Private Session
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Training location card */}
            {(() => {
              const locs = (trainer as any).coachingLocations as Array<{ name: string; city?: string; logo?: string }> | undefined;
              const hasCustomLocs = locs && locs.length > 0;
              if (!location && !hasCustomLocs) return null;
              const mapQuery = hasCustomLocs ? `${locs![0].name} ${locs![0].city ?? ""}`.trim() : location;
              const displayLocs = hasCustomLocs ? locs! : [{ name: trainer.city!, city: trainer.state ?? undefined, logo: undefined }];
              return (
                <div className="bg-white rounded-2xl border shadow-sm p-5">
                  <p className="font-bold text-sm mb-3">Where I Coach</p>
                  <div className="h-48 rounded-xl overflow-hidden mb-4 border">
                    <iframe title="Training location map" width="100%" height="100%" loading="lazy"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=13`} />
                  </div>
                  <div className="space-y-3">
                    {displayLocs.map((loc, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {loc.logo ? (
                          <img src={loc.logo} alt={loc.name} className="h-10 w-10 rounded-lg object-contain border bg-white shrink-0" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: "#0F3154" }}>{i + 1}</span>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{loc.name}</p>
                          {loc.city && <p className="text-xs text-muted-foreground">{loc.city}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Trainer may travel within the local area. Contact for specific field locations.
                  </p>
                </div>
              );
            })()}

            {/* Guarantee */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 text-sm text-center">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-bold mb-1">Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> Guarantee</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If your first session doesn't meet expectations, we'll help you find a better match or refund your booking.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
