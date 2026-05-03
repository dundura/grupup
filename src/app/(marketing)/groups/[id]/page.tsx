import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, CalendarDays, Users, ShieldCheck,
  Star, ChevronLeft, Award, Minus, Plus, Mail, Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainers, trainerSessions, trainerFollows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import MessageButton from "@/components/messaging/MessageButton";
import FollowButton from "@/components/sessions/FollowButton";
import TrainerPlansSection from "@/components/trainers/TrainerPlansSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [trainer] = await db.select({ name: trainers.name, photo: trainers.photo, sport: trainers.sport, city: trainers.city, state: trainers.state })
      .from(trainers).where(eq(trainers.id, id));
    if (!trainer) return {};
    const image = trainer.photo || "https://www.grupup.app/og-default.png";
    const location = [trainer.city, trainer.state].filter(Boolean).join(", ");
    const title = `${trainer.name} — ${trainer.sport ?? "Sports"} Trainer${location ? ` in ${location}` : ""} | GrupUp`;
    const description = `Book group training sessions with ${trainer.name} on GrupUp.`;
    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "profile" },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch { return {}; }
}

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
  let isAdmin = false;
  if (userId && trainer.clerkId) {
    try {
      const [follow] = await db.select({ status: trainerFollows.status })
        .from(trainerFollows)
        .where(and(eq(trainerFollows.followerClerkId, userId), eq(trainerFollows.trainerClerkId, trainer.clerkId)));
      followStatus = follow?.status ?? null;
    } catch {}
    try {
      const client = await clerkClient();
      const me = await client.users.getUser(userId);
      const email = me.emailAddresses.find((e) => e.id === me.primaryEmailAddressId)?.emailAddress ?? "";
      isAdmin = ["neil@anytime-soccer.com", "nmciq2@gmail.com"].includes(email);
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

        {/* Back link + admin edit */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/trainers"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to search results
          </Link>
          {isAdmin && trainer.clerkId && (
            <Link
              href={`/admin/edit/${trainer.clerkId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0F3154" }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Hero text */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-snug mb-2">
                {trainer.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 mb-1">
                <span className="text-amber-500 text-lg">✦</span>
                <p className="text-xl font-extrabold" style={{ color: "#DC373E" }}>Gauge Interest</p>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#DC373E" }}>These are potential sessions — not yet confirmed.</p>
              <p className="text-sm text-muted-foreground">
                {trainer.name.split(" ")[0]} is considering offering these dates and would like to know if there&apos;s enough interest before committing. Tap <strong>I&apos;m interested</strong> to let them know — the more interest, the more likely they&apos;ll launch it.
              </p>
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
              <div className="p-4 flex items-center justify-end">
                {trainer.clerkId && (
                  <FollowButton trainerClerkId={trainer.clerkId} initialIsFollowing={!!followStatus} initialStatus={followStatus} isSignedIn={!!userId} />
                )}
              </div>
            </div>

            {/* About — trainer's overview text */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">More About Upcoming Sessions</p>
              <p className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: (trainer as any).plansAbout?.trim()
                  ? (trainer as any).plansAbout
                  : "I am considering offering future events and want to gauge interest before launching them. Please express interest and I will be in touch." }} />
            </div>

            {/* Gauge Interest */}
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
                <div>
                  <p className="font-bold text-base">{trainer.name}</p>
                </div>
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
