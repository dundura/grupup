import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Star, Clock, Users, CalendarDays,
  Shield, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainerSessions, trainers, bookings } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import ContactTrainerForm from "@/components/sessions/ContactTrainerForm";
import CopyLinkButton from "@/components/sessions/CopyLinkButton";

export const dynamic = "force-dynamic";

const skillColors: Record<string, string> = {
  Beginner:     "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced:     "bg-orange-100 text-orange-700",
  Elite:        "bg-purple-100 text-purple-700",
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = parseInt(id);
  if (isNaN(sessionId)) notFound();

  let session;
  let trainer;
  let trainerEmail = "";
  let otherSessions: typeof trainerSessions.$inferSelect[] = [];
  let attendees: { userName: string | null }[] = [];

  try {
    const [row] = await db.select().from(trainerSessions).where(eq(trainerSessions.id, sessionId));
    if (!row || !row.isActive) notFound();
    session = row;

    const [trainerRow] = await db.select().from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));
    trainer = trainerRow ?? null;

    otherSessions = await db
      .select()
      .from(trainerSessions)
      .where(
        and(
          eq(trainerSessions.trainerClerkId, session.trainerClerkId),
          eq(trainerSessions.isActive, true),
          ne(trainerSessions.id, sessionId)
        )
      );

    attendees = await db
      .select({ userName: bookings.userName })
      .from(bookings)
      .where(and(eq(bookings.sessionId, String(sessionId)), eq(bookings.status, "paid")));

    // Get trainer email from Clerk
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(session.trainerClerkId);
      trainerEmail = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    } catch {}
  } catch {
    notFound();
  }

  const almostFull = session.spotsLeft <= 2 && session.spotsLeft > 0;
  const isFull = session.spotsLeft === 0;
  const fillPct = Math.round(((session.spotsTotal - session.spotsLeft) / session.spotsTotal) * 100);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Back */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container py-3">
          <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sessions
          </Link>
        </div>
      </div>

      <div className="container max-w-5xl py-8 px-4">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Left column: title + description + booking */}
          <div className="space-y-5">

            <h1 className="text-2xl md:text-3xl font-bold leading-snug">{session.title}</h1>

            {/* About this session */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About this session</p>
              {session.notes ? (
                <p className="text-muted-foreground leading-relaxed text-sm">{session.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm italic">No description added yet.</p>
              )}
            </div>

            {/* Details 2x2 grid */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
                {/* Date/Time */}
                <div className="p-4 pl-0 pt-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Date / Time</p>
                  <div className="space-y-1.5 text-sm">
                    {session.dayOfWeek && session.time ? (
                      <p className="flex items-center gap-1.5 font-medium"><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />{session.dayOfWeek}s at {session.time}</p>
                    ) : <p className="text-muted-foreground text-sm">—</p>}
                    {session.duration && (
                      <p className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs"><Clock className="h-3.5 w-3.5 shrink-0" />{session.duration} min</p>
                    )}
                  </div>
                </div>
                {/* Location */}
                <div className="p-4 pr-0 pt-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
                  {session.city ? (
                    <p className="flex items-start gap-1.5 text-sm font-medium"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />{session.venue ? `${session.venue}, ` : ""}{session.city}</p>
                  ) : <p className="text-muted-foreground text-sm">—</p>}
                </div>
                {/* About */}
                <div className="p-4 pl-0 pb-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About</p>
                  <div className="space-y-1.5 text-sm font-medium">
                    <p className="flex items-center gap-1.5"><Users className="h-4 w-4 shrink-0 text-muted-foreground" />{session.spotsTotal} spots{session.ageRange ? ` · Ages ${session.ageRange}` : ""}</p>
                    {session.skillLevel && (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${skillColors[session.skillLevel] ?? "bg-muted text-muted-foreground"}`}>{session.skillLevel}</span>
                    )}
                  </div>
                </div>
                {/* Cost */}
                <div className="p-4 pr-0 pb-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Cost</p>
                  <p className="text-2xl font-extrabold" style={{ color: "#0F3154" }}>${session.pricePerPlayer}<span className="text-sm font-medium text-muted-foreground ml-1">/ player</span></p>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Special Instructions</p>
              {(session as any).instructions ? (
                <p className="text-muted-foreground leading-relaxed text-sm">{(session as any).instructions}</p>
              ) : (
                <p className="text-muted-foreground text-sm italic">No instructions added yet.</p>
              )}
            </div>

            {/* Other sessions by this trainer */}
            {otherSessions.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h2 className="font-bold text-base mb-4">More sessions by {trainer?.name?.split(" ")[0] ?? "this coach"}</h2>
                <div className="space-y-2">
                  {otherSessions.slice(0, 3).map((s) => (
                    <Link key={s.id} href={`/sessions/${s.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border hover:border-primary/30 hover:bg-muted/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.sessionType.replace("-", " ")} · {s.city}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: "#0F3154" }}>${s.pricePerPlayer}/player</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: details table + trainer card + attendees */}
          <div>
            <div className="sticky top-28 space-y-5">

            {/* Trainer card */}
            {trainer && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="relative h-52 w-full">
                  {trainer.photo ? (
                    <Image src={trainer.photo} alt={trainer.name} fill className="object-cover object-top" sizes="320px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ backgroundColor: "#0F3154" }}>
                      {trainer.name?.[0] ?? "T"}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-bold text-base">{trainer.name}</p>
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
                    {(trainer.yearsExperience ?? 0) > 0 && <p>· {trainer.yearsExperience} yrs exp</p>}
                  </div>
                  <ContactTrainerForm
                    sessionId={session.id}
                    sessionTitle={session.title}
                    trainerName={trainer.name ?? "Trainer"}
                  />
                  <Link href={`/groups/${trainer.id}`}
                    className="block text-center text-xs font-semibold py-2 rounded-lg border mt-2 hover:bg-muted transition-colors"
                    style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                    View trainer profile
                  </Link>
                </div>
              </div>
            )}

            {/* First class free callout */}
            {session.firstClassFree && trainer && (
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="rounded-xl p-4 mb-3 text-center" style={{ backgroundColor: "#f0f4f9" }}>
                  <p className="text-base font-bold" style={{ color: "#0F3154" }}>🎉 First class free!</p>
                  <p className="text-xs text-muted-foreground mt-1">New players — message the trainer to claim your free first class.</p>
                </div>
                <ContactTrainerForm
                  sessionId={session.id}
                  sessionTitle={session.title}
                  trainerName={trainer.name ?? "Trainer"}
                  defaultMessage={`Hi, I'd like to claim the free first class for "${session.title}".`}
                  ctaLabel="Claim Free First Class"
                  ctaStyle="highlight"
                />
              </div>
            )}

            {/* Spots + booking */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className={almostFull ? "font-bold" : "text-muted-foreground"} style={almostFull ? { color: "#DC373E" } : {}}>
                    {isFull ? "Session full" : almostFull ? `⚡ Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left!` : `${session.spotsLeft} of ${session.spotsTotal} spots open`}
                  </span>
                  <span className="text-muted-foreground">{session.spotsTotal - session.spotsLeft}/{session.spotsTotal} joined</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${fillPct}%`, backgroundColor: almostFull ? "#DC373E" : "#0F3154" }} />
                </div>
              </div>
              {isFull ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                  style={{ backgroundColor: "#DC373E" }}>Session Full</div>
              ) : (
                <Link href={`/sessions/${session.id}/book`}
                  className="flex items-center justify-center w-full py-3.5 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: "#DC373E" }}>
                  Reserve My Spot
                </Link>
              )}
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Secure checkout · Cancel up to 24h before
              </p>
            </div>

            {/* Invite friends */}
            <CopyLinkButton url={`https://grupup.app/sessions/${session.id}`} />

            {/* Attendees */}
            {attendees.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Who's attending ({attendees.length})
                </p>
                <div className="space-y-2">
                  {attendees.map((a, i) => {
                    const name = a.userName ?? "Player";
                    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const firstName = name.split(" ")[0];
                    const lastInitial = name.split(" ")[1]?.[0] ? `${name.split(" ")[1][0]}.` : "";
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: "#0F3154" }}>
                          {initials}
                        </div>
                        <span className="text-sm font-medium">{firstName} {lastInitial}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
