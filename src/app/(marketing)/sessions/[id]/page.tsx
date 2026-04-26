import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Clock, Shield, Users, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupSessions, trainers } from "@/lib/mock-data";
import { SESSION_TYPE_LABELS, SESSION_TYPE_SPOTS } from "@/lib/types";
import { BookButton } from "@/components/BookButton";

const skillColors: Record<string, string> = {
  Beginner:     "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced:     "bg-orange-100 text-orange-700",
  Elite:        "bg-purple-100 text-purple-700",
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = groupSessions.find((s) => s.id === id);
  if (!session) notFound();

  const trainer = trainers.find((t) => t.id === session.trainer.id);
  const trainerSessions = groupSessions.filter(
    (s) => s.trainer.id === session.trainer.id && s.id !== session.id
  );

  const offer = session.specialOffer;
  const discountedPrice = offer
    ? offer.discountPct === 100 ? 0 : Math.round(session.pricePerPlayer * (1 - offer.discountPct / 100))
    : null;

  const displayPrice = discountedPrice !== null ? discountedPrice : session.pricePerPlayer;
  const isPrivate = session.sessionType === "private";
  const spotsFilled = session.totalSpots - session.spotsLeft;
  const fillPct = Math.round((spotsFilled / session.totalSpots) * 100);
  const almostFull = session.spotsLeft <= 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background sticky top-16 z-10">
        <div className="container py-3">
          <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sessions
          </Link>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl overflow-hidden border shadow-sm">
              <div className="px-6 pt-6 pb-6" style={{ backgroundColor: "#0F3154" }}>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
                  {session.sport} · {session.city}, {session.state}
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0 border-white/30">
                    <Image src={session.trainer.photo} alt={session.trainer.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{session.trainer.name}</h1>
                    {trainer && (
                      <div className="flex items-center gap-2 mt-1.5 text-white/70 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-white">{trainer.rating}</span>
                        <span>· {trainer.reviewCount} reviews · {trainer.yearsExperience} yrs experience</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative px-6 pb-6 pt-5 border-t">
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { icon: Calendar, text: `${session.dayOfWeek}s · ${session.time}` },
                    { icon: Clock, text: `${session.duration} min · ${session.date}` },
                    { icon: MapPin, text: `${session.venue}, ${session.city}` },
                    { icon: Users, text: `Ages ${session.ageRange} · ${SESSION_TYPE_SPOTS[session.sessionType]}` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 shrink-0" />{text}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${skillColors[session.skillLevel]}`}>
                    {session.skillLevel}
                  </span>
                  {session.recurring && <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">Weekly</span>}
                </div>

                {!isPrivate && (
                  <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className={almostFull ? "font-bold" : "text-muted-foreground"} style={almostFull ? { color: "#DC373E" } : {}}>
                        {almostFull ? `⚡ Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left!` : `${session.spotsLeft} of ${session.totalSpots} spots open`}
                      </span>
                      <span className="text-muted-foreground">{spotsFilled}/{session.totalSpots} joined</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: almostFull ? "#DC373E" : "#0F3154" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {trainer && (
              <div className="rounded-2xl border p-6">
                <h3 className="font-bold text-lg mb-3">About {trainer.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
                {trainer.certifications.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" style={{ color: "#0F3154" }} />Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map((c) => (
                        <span key={c} className="text-xs px-3 py-1 rounded-full border font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {trainer.specialties.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specialties.map((s) => (
                        <span key={s} className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ backgroundColor: "#0F3154" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {trainer?.videoUrl && (() => {
              const ytMatch = trainer.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
              const videoId = ytMatch?.[1];
              if (!videoId) return null;
              return (
                <div className="rounded-2xl border overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe src={`https://www.youtube.com/embed/${videoId}`} title={`${trainer.name} training video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="w-full h-full" />
                  </div>
                </div>
              );
            })()}

            {trainerSessions.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">More sessions by {session.trainer.name}</h3>
                <div className="space-y-3">
                  {trainerSessions.slice(0, 4).map((s) => (
                    <Link key={s.id} href={`/sessions/${s.id}`}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{SESSION_TYPE_LABELS[s.sessionType]} · {s.dayOfWeek}s {s.time} · {s.city}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <p className="font-bold text-sm" style={{ color: "#0F3154" }}>${s.pricePerPlayer}</p>
                          <p className="text-xs text-muted-foreground">{s.sessionType === "private" ? "/ session" : "/ player"}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {trainer && trainer.reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="font-bold text-lg">Reviews</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{trainer.rating}</span>
                    <span className="text-muted-foreground">({trainer.reviewCount})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {trainer.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-sm">{r.parentName}</p>
                          <p className="text-xs text-muted-foreground">for {r.kidName}, age {r.kidAge}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">{r.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl overflow-hidden border shadow-sm">
                <div className="px-5 py-4" style={{ backgroundColor: "#0F3154" }}>
                  <p className="text-white font-bold text-lg">
                    {offer && discountedPrice !== null ? (
                      <>
                        <span className="line-through text-white/50 text-sm mr-2">${session.pricePerPlayer}</span>
                        {discountedPrice === 0 ? "FREE" : `$${discountedPrice}`}
                      </>
                    ) : `$${session.pricePerPlayer}`}
                  </p>
                  <p className="text-white/60 text-xs">
                    {isPrivate ? "per session" : "per player"} · {SESSION_TYPE_LABELS[session.sessionType]}
                  </p>
                </div>

                <div className="p-5 space-y-3">
                  {offer && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: "#DC373E" }}>
                      🏷️ {offer.label}
                    </div>
                  )}

                  {!isPrivate && (
                    <div className="text-sm text-muted-foreground">
                      <span className={`font-semibold ${almostFull ? "text-[#DC373E]" : ""}`}>
                        {almostFull ? `⚡ ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left` : `${session.spotsLeft} of ${session.totalSpots} spots open`}
                      </span>
                    </div>
                  )}

                  <BookButton
                    sessionId={session.id}
                    disabled={session.spotsLeft === 0}
                    label={session.spotsLeft === 0 ? "Session Full" : isPrivate ? "Book Private Session" : "Reserve My Spot"}
                  />

                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout · Cancel up to 24h before
                  </p>
                </div>
              </div>

              {(() => {
                const groupOfferings = groupSessions.filter(
                  (s) => s.trainer.id === session.trainer.id && s.sessionType !== "private" && s.id !== session.id
                );
                if (groupOfferings.length === 0) return null;
                return (
                  <div className="rounded-2xl overflow-hidden border shadow-sm">
                    <div className="px-5 py-4" style={{ backgroundColor: "#0F3154" }}>
                      <p className="text-white font-bold text-sm">More by {session.trainer.name.split(" ")[0]}</p>
                      <p className="text-white/60 text-xs mt-0.5">Split the cost · same quality</p>
                    </div>
                    <div className="divide-y">
                      {groupOfferings.slice(0, 3).map((s) => (
                        <Link key={s.id} href={`/sessions/${s.id}`}
                          className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-accent/5 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-snug">{s.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{SESSION_TYPE_LABELS[s.sessionType]} · {s.dayOfWeek}s {s.time}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-sm" style={{ color: "#0F3154" }}>${s.pricePerPlayer}</p>
                            <p className="text-xs text-muted-foreground">/ player</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
