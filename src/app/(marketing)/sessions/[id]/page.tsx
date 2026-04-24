import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Clock, Shield, Users, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupSessions, trainers } from "@/lib/mock-data";
import { SESSION_TYPE_LABELS, SESSION_TYPE_SPOTS } from "@/lib/types";

const skillColors: Record<string, string> = {
  Beginner:     "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced:     "bg-orange-100 text-orange-700",
  Elite:        "bg-purple-100 text-purple-700",
};

export default function SessionPage({ params }: { params: { id: string } }) {
  const session = groupSessions.find((s) => s.id === params.id);
  if (!session) notFound();

  const trainer = trainers.find((t) => t.id === session.trainer.id);

  // All sessions by this trainer
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
      {/* Back nav */}
      <div className="border-b bg-background sticky top-16 z-10">
        <div className="container py-3">
          <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sessions
          </Link>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* ── Left: Trainer profile ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero card */}
            <div className="rounded-2xl overflow-hidden border shadow-sm">
              {/* Navy header */}
              <div className="px-6 pt-6 pb-6" style={{ backgroundColor: "#0F3154" }}>
                {offer && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white mb-4" style={{ backgroundColor: "#DC373E" }}>
                    🏷️ {offer.label}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
                      {session.sport} · {SESSION_TYPE_LABELS[session.sessionType]}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{session.title}</h1>
                    <p className="text-white/60 mt-1">{session.focus}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {offer && discountedPrice !== null && (
                      <p className="text-white/40 text-sm line-through">${session.pricePerPlayer}</p>
                    )}
                    <p className="font-extrabold text-3xl" style={{ color: discountedPrice === 0 ? "#6EE7B7" : "#fff" }}>
                      {discountedPrice === 0 ? "FREE" : `$${displayPrice}`}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">{isPrivate ? "/ session" : "/ player"}</p>
                  </div>
                </div>
              </div>

              {/* Trainer info — below hero */}
              <div className="relative px-6 pb-6 pt-5 border-t">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: "#0F3154" }}>
                    <Image src={session.trainer.photo} alt={session.trainer.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{session.trainer.name}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{session.trainer.rating}</span>
                      {trainer && <span>· {trainer.reviewCount} reviews</span>}
                      {trainer && <span>· {trainer.yearsExperience} yrs exp</span>}
                    </div>
                  </div>
                </div>

                {/* Session details */}
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { icon: Calendar, text: `${session.dayOfWeek}s · ${session.time}` },
                    { icon: Clock, text: `${session.duration} min · ${session.date}` },
                    { icon: MapPin, text: `${session.venue}, ${session.city}` },
                    { icon: Users, text: `Ages ${session.ageRange} · ${SESSION_TYPE_SPOTS[session.sessionType]}` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                {/* Skill level + recurring */}
                <div className="flex items-center gap-2 mb-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${skillColors[session.skillLevel]}`}>
                    {session.skillLevel}
                  </span>
                  {session.recurring && (
                    <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">Weekly</span>
                  )}
                </div>

                {/* Spots bar (group sessions only) */}
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

            {/* Bio */}
            {trainer && (
              <div className="rounded-2xl border p-6">
                <h3 className="font-bold text-lg mb-3">About {trainer.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>

                {/* Certifications */}
                {trainer.certifications.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" style={{ color: "#0F3154" }} />
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map((c) => (
                        <span key={c} className="text-xs px-3 py-1 rounded-full border font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
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

            {/* Other sessions by this trainer */}
            {trainerSessions.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">More sessions by {session.trainer.name}</h3>
                <div className="space-y-3">
                  {trainerSessions.slice(0, 4).map((s) => (
                    <Link
                      key={s.id}
                      href={`/sessions/${s.id}`}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all"
                    >
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

            {/* Reviews */}
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

          {/* ── Right: Group offerings + booking ──────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">

              {/* Group sessions — primary emphasis */}
              {(() => {
                const groupOfferings = groupSessions.filter(
                  (s) => s.trainer.id === session.trainer.id && s.sessionType !== "private"
                );
                if (groupOfferings.length === 0) return null;
                return (
                  <div className="rounded-2xl overflow-hidden border shadow-sm">
                    <div className="px-5 py-4" style={{ backgroundColor: "#0F3154" }}>
                      <p className="text-white font-bold text-sm">Group sessions with {session.trainer.name.split(" ")[0]}</p>
                      <p className="text-white/60 text-xs mt-0.5">Split the cost · same quality</p>
                    </div>
                    <div className="divide-y">
                      {groupOfferings.map((s) => {
                        const sOffer = s.specialOffer;
                        const sDiscounted = sOffer
                          ? sOffer.discountPct === 100 ? 0 : Math.round(s.pricePerPlayer * (1 - sOffer.discountPct / 100))
                          : null;
                        const sHot = s.spotsLeft <= 2;
                        return (
                          <Link
                            key={s.id}
                            href={`/sessions/${s.id}`}
                            className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              {sOffer && (
                                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white mb-1" style={{ backgroundColor: "#DC373E" }}>
                                  🏷️ {sOffer.label}
                                </span>
                              )}
                              <p className="font-semibold text-sm leading-snug">{s.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {SESSION_TYPE_LABELS[s.sessionType]} · {s.dayOfWeek}s {s.time}
                              </p>
                              <p className="text-xs mt-1" style={{ color: sHot ? "#DC373E" : "#6B7280" }}>
                                {sHot ? `⚡ ${s.spotsLeft} spot${s.spotsLeft === 1 ? "" : "s"} left` : `${s.spotsLeft} of ${s.totalSpots} spots open`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {sOffer && sDiscounted !== null && (
                                <p className="text-xs line-through text-muted-foreground">${s.pricePerPlayer}</p>
                              )}
                              <p className="font-bold text-base" style={{ color: sDiscounted === 0 ? "#059669" : "#0F3154" }}>
                                {sDiscounted === 0 ? "FREE" : `$${sDiscounted ?? s.pricePerPlayer}`}
                              </p>
                              <p className="text-xs text-muted-foreground">/ player</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="px-5 pb-4 pt-2">
                      <Button asChild className="w-full text-white" style={{ backgroundColor: "#DC373E" }}>
                        <Link href={`/groups?trainer=${session.trainer.id}`}>See all group sessions</Link>
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Book this session (compact) */}
              <div className="rounded-2xl border p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {isPrivate ? "Book private session" : "Join this session"}
                </p>
                <div className="flex items-end gap-1 mb-3">
                  {offer && discountedPrice !== null && (
                    <span className="text-muted-foreground line-through mr-1">${session.pricePerPlayer}</span>
                  )}
                  <span className="font-extrabold text-2xl" style={{ color: discountedPrice === 0 ? "#059669" : "#0F3154" }}>
                    {discountedPrice === 0 ? "FREE" : `$${displayPrice}`}
                  </span>
                  <span className="text-muted-foreground text-sm mb-0.5">{isPrivate ? "/ session" : "/ player"}</span>
                </div>
                <Button
                  className="w-full text-white font-bold mb-2"
                  style={{ backgroundColor: "#DC373E" }}
                  disabled={session.spotsLeft === 0}
                >
                  {isPrivate ? "Book Session" : session.spotsLeft === 0 ? "Session Full" : "Join Session"}
                </Button>
                <Button variant="outline" className="w-full text-sm">Message Trainer</Button>
                <p className="text-xs text-center text-muted-foreground mt-3">No payment charged until confirmed</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
