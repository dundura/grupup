import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, CalendarDays, Users, ShieldCheck,
  Star, ChevronLeft, Award, Minus, Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainers, trainerSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PackageBooking } from "@/components/trainers/PackageBooking";

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

  const sports       = (trainer.sports as string[] | null) ?? (trainer.sport ? [trainer.sport] : []);
  const specialties  = (trainer.certifications as string[] | null) ?? [];
  const location     = [trainer.city, trainer.state].filter(Boolean).join(", ");
  const bioText      = trainer.bio?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
  const skillLevels  = (trainer.skillLevels as string[] | null) ?? [];

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
                <div className="flex items-center gap-2 mt-2">
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
                <p className="text-[11px] text-muted-foreground">Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> trainer</p>
              </div>
            </div>

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

          </div>

          {/* ── RIGHT COLUMN (sidebar) ── */}
          <div className="space-y-5 lg:sticky lg:top-24">

            {/* Trainer card */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
              </div>
            </div>

            {/* Training location card */}
            {location && (
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="font-bold text-sm mb-3">Training Locations</p>
                <div className="h-48 rounded-xl overflow-hidden mb-3 border">
                  <iframe
                    title="Training location map"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed&z=13`}
                  />
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: "#0F3154" }}>1</span>
                  <div>
                    <p className="font-medium">{trainer.city}</p>
                    {trainer.state && <p className="text-xs text-muted-foreground">{trainer.state}</p>}
                  </div>
                </div>
                {sessions[0]?.venue && (
                  <div className="flex items-start gap-2 text-sm mt-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: "#0F3154" }}>2</span>
                    <p className="font-medium">{sessions[0].venue}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Trainer may travel within the local area. Contact for specific field locations.
                </p>
              </div>
            )}

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
