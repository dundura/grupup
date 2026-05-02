import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Star, Clock, Users, CalendarDays,
  Shield, ChevronRight, Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { trainerSessions, trainers, bookings, sessionWaitlist } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { count } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import ContactTrainerForm from "@/components/sessions/ContactTrainerForm";
import CopyLinkButton from "@/components/sessions/CopyLinkButton";
import FollowButton from "@/components/sessions/FollowButton";
import AddToCalendarButton from "@/components/sessions/AddToCalendarButton";
import LateBookingRequest from "@/components/sessions/LateBookingRequest";
import JoinWaitlistButton from "@/components/sessions/JoinWaitlistButton";
import { auth } from "@clerk/nextjs/server";
import { trainerFollows } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [session] = await db
      .select({ title: trainerSessions.title, sessionPhoto: trainerSessions.sessionPhoto, sport: trainerSessions.sport, city: trainerSessions.city, trainerClerkId: trainerSessions.trainerClerkId })
      .from(trainerSessions).where(eq(trainerSessions.id, parseInt(id)));
    if (!session) return {};
    const [trainer] = await db.select({ name: trainers.name, photo: trainers.photo })
      .from(trainers).where(eq(trainers.clerkId, session.trainerClerkId));
    const image = session.sessionPhoto || trainer?.photo || "https://www.grupup.app/og-default.png";
    const title = `${session.title} — GrupUp`;
    const description = `${session.sport} session${session.city ? ` in ${session.city}` : ""} with ${trainer?.name ?? "a GrupUp trainer"}`;
    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "website" },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch { return {}; }
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

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
  let attendees: { userName: string | null; photo?: string }[] = [];
  let isFollowing = false;
  let followStatus: string | null = null;
  let currentUserId: string | null = null;
  let waitlistCount = 0;
  let waitlistEntries: { userName: string | null; clerkUserId: string | null; photo?: string }[] = [];

  try {
    const { userId } = await auth();
    currentUserId = userId;

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

    const attendeeRows = await db
      .select({ userName: bookings.userName, clerkUserId: bookings.clerkUserId })
      .from(bookings)
      .where(and(eq(bookings.sessionId, String(sessionId)), eq(bookings.status, "paid")));
    try {
      const client = await clerkClient();
      attendees = await Promise.all(attendeeRows.map(async (a) => {
        if (!a.clerkUserId) return a;
        try {
          const u = await client.users.getUser(a.clerkUserId);
          return { ...a, photo: u.imageUrl ?? undefined };
        } catch { return a; }
      }));
    } catch { attendees = attendeeRows; }

    if (userId) {
      try {
        const [follow] = await db.select().from(trainerFollows).where(
          and(eq(trainerFollows.followerClerkId, userId), eq(trainerFollows.trainerClerkId, session.trainerClerkId))
        );
        isFollowing = !!follow;
        followStatus = (follow as any)?.status ?? null;
      } catch {}
    }

    // Waitlist count + entries + photos
    try {
      const wRows = await db.select({ userName: sessionWaitlist.userName, clerkUserId: sessionWaitlist.clerkUserId }).from(sessionWaitlist).where(eq(sessionWaitlist.sessionId, sessionId));
      waitlistCount = wRows.length;
      const client = await clerkClient();
      waitlistEntries = await Promise.all(wRows.map(async (w) => {
        if (!w.clerkUserId) return w;
        try {
          const u = await client.users.getUser(w.clerkUserId);
          return { ...w, photo: u.imageUrl ?? undefined };
        } catch { return w; }
      }));
    } catch {}

    // Get trainer email from Clerk
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(session.trainerClerkId);
      trainerEmail = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    } catch {}
  } catch {
    notFound();
  }

  const ADMIN_EMAILS = ["nmciq2@gmail.com", "neil@anytime-soccer.com"];
  let isAdminUser = false;
  if (currentUserId) {
    try {
      const client = await clerkClient();
      const me = await client.users.getUser(currentUserId);
      const email = me.emailAddresses?.[0]?.emailAddress ?? "";
      const meta = me.publicMetadata as { role?: string };
      isAdminUser = ADMIN_EMAILS.includes(email) || meta.role === "admin";
    } catch {}
  }

  const unlimited = session.spotsTotal === 0;
  const embedUrl = (session as any).videoUrl ? toEmbedUrl((session as any).videoUrl) : null;
  const almostFull = !unlimited && session.spotsLeft <= 2 && session.spotsLeft > 0;
  const isFull = !unlimited && session.spotsLeft === 0;
  const fillPct = unlimited ? 0 : Math.round(((session.spotsTotal - session.spotsLeft) / session.spotsTotal) * 100);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* Back */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container py-3 flex items-center justify-between">
          <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sessions
          </Link>
          {isAdminUser && (
            <Link
              href={`/trainer/sessions/${session.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0F3154" }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Listing
            </Link>
          )}
        </div>
      </div>

      <div className="container max-w-5xl py-8 px-4">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">

          {/* Left column: title + description + booking */}
          <div className="space-y-5">

            {(() => {
              const rawSD = Array.isArray((session as any).sessionDates) ? (session as any).sessionDates : [];
              const today = new Date().toISOString().split("T")[0];
              const next = rawSD.map((d: any) => typeof d === "string" ? d : d.date).find((d: string) => d >= today);
              const nextLabel = next
                ? new Date(next + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                : null;
              const hasPills = session.recurring || session.dayOfWeek || nextLabel;
              if (!hasPills) return null;
              return (
                <div className="flex flex-wrap items-center gap-2">
                  {session.dayOfWeek && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#0F3154" }}>
                      <CalendarDays className="h-3 w-3" /> {session.dayOfWeek}s{session.time ? ` at ${session.time}` : ""}
                    </span>
                  )}
                  {session.recurring && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#e8f0f9] text-[#0F3154]">
                      🔁 {(session as any).recurringWeeks ? `${(session as any).recurringWeeks}-session series` : "Recurring"}
                    </span>
                  )}
                  {nextLabel && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#DC373E" }}>
                      📅 Next: {nextLabel}
                    </span>
                  )}
                </div>
              );
            })()}
            <h1 className="text-2xl md:text-3xl font-bold leading-snug">{session.title}</h1>

            {/* Trainer card — mobile/tablet only */}
            {trainer && (
              <div className="lg:hidden bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="relative h-52 w-full bg-gray-100">
                  {trainer.photo ? (
                    <Image src={trainer.photo} alt={trainer.name} fill className="object-contain" sizes="600px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ backgroundColor: "#0F3154" }}>
                      {trainer.name?.[0] ?? "T"}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-base">{trainer.name}</p>
                    <FollowButton
                      trainerClerkId={session.trainerClerkId}
                      initialIsFollowing={isFollowing}
                      initialStatus={followStatus}
                      isSignedIn={!!currentUserId}
                    />
                  </div>
                  {(() => {
                    const locs = (trainer.coachingLocations as Array<{ name: string; city?: string }> | null);
                    if (!locs?.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {locs.map((loc, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-lg border bg-gray-50 font-medium text-gray-700">
                            {loc.name}{loc.city ? `, ${loc.city}` : ""}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(trainer.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="font-bold text-sm">{trainer.rating?.toFixed(1) ?? "5.0"}</span>
                    <span className="text-muted-foreground text-xs">· {trainer.reviewCount ?? 0} reviews</span>
                  </div>
                  {(trainer.yearsExperience ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground">· {trainer.yearsExperience} yrs exp</p>
                  )}
                  {/* Compact icon row on mobile */}
                  <div className="grid grid-cols-4 gap-2 sm:hidden">
                    <ContactTrainerForm sessionId={session.id} sessionTitle={session.title} trainerName={trainer.name ?? "Trainer"} compact />
                    <Link href={`/groups/${trainer.id}`} title="View trainer profile"
                      className="flex flex-col items-center justify-center gap-1 w-full py-2 rounded-xl border hover:bg-muted transition-colors"
                      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                      <Users className="h-4 w-4" />
                      <span className="text-[10px] font-semibold leading-none">Profile</span>
                    </Link>
                    <AddToCalendarButton title={session.title} dayOfWeek={session.dayOfWeek ?? ""} time={session.time ?? ""} durationMin={session.duration ?? 60} location={session.venue ? `${session.venue}, ${session.city}` : session.city ?? ""} description={session.notes ?? undefined} compact />
                    <CopyLinkButton url={`https://www.grupup.app/sessions/${session.id}`} compact />
                  </div>
                  {/* Stacked buttons on tablet */}
                  <div className="hidden sm:block space-y-2">
                    <ContactTrainerForm sessionId={session.id} sessionTitle={session.title} trainerName={trainer.name ?? "Trainer"} />
                    <Link href={`/groups/${trainer.id}`}
                      className="block text-center text-sm font-semibold py-2.5 rounded-lg border hover:bg-muted transition-colors"
                      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                      View trainer profile
                    </Link>
                    <AddToCalendarButton title={session.title} dayOfWeek={session.dayOfWeek ?? ""} time={session.time ?? ""} durationMin={session.duration ?? 60} location={session.venue ? `${session.venue}, ${session.city}` : session.city ?? ""} description={session.notes ?? undefined} />
                    <CopyLinkButton url={`https://www.grupup.app/sessions/${session.id}`} />
                  </div>
                </div>
              </div>
            )}

            {/* About + Booking + Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4 items-start">

              {/* About */}
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About this session</p>
                {session.notes ? (
                  <p className="text-muted-foreground leading-relaxed text-sm">{session.notes}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No description added yet.</p>
                )}
                {session.dayOfWeek && !((session as any).sessionDates?.length) && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-[#0F3154] bg-[#e8f0f9] rounded-xl px-3 py-2.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p>This session runs every <strong>{session.dayOfWeek}</strong>{session.time ? ` at ${session.time}` : ""}. After booking, your trainer will contact you to confirm which days you'd like to attend.</p>
                  </div>
                )}
              </div>

              {/* Booking — last on mobile, col 2 on desktop */}
              <div className="order-last sm:order-none sm:row-start-1 sm:col-start-2 bg-white rounded-2xl border shadow-sm p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={almostFull ? "font-bold" : "text-muted-foreground"} style={almostFull ? { color: "#DC373E" } : {}}>
                      {isFull ? "Session full" : almostFull ? `⚡ Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left!` : `${session.spotsLeft} of ${session.spotsTotal} spots open`}
                    </span>
                    <span className="text-muted-foreground">{session.spotsTotal - session.spotsLeft}/{session.spotsTotal} joined</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${fillPct}%`, backgroundColor: almostFull ? "#DC373E" : "#0F3154" }} />
                  </div>
                </div>
                {(() => {
                  const rawSD = Array.isArray((session as any).sessionDates) ? (session as any).sessionDates : [];
                  const sessionDates: string[] = rawSD.map((d: any) => typeof d === "string" ? d : d.date);
                  const isPlan = (session as any).isPlan ?? false;
                  const allowLate = (session as any).allowLateBooking !== false;
                  const todayStr = new Date().toISOString().split("T")[0];
                  const remaining = isPlan && sessionDates.length > 0 ? sessionDates.filter((d) => d >= todayStr).length : null;
                  const total = sessionDates.length;
                  const hasStarted = remaining !== null && remaining < total;

                  // Pro-rated price display
                  const planDisc = (n: number) => n >= 8 ? 20 : n >= 6 ? 15 : n >= 4 ? 10 : 5;
                  const proratedPrice = isPlan && remaining !== null
                    ? Math.round(session.pricePerPlayer * (1 - planDisc(total) / 100)) * remaining
                    : null;

                  const waitlistOn = (session as any).waitlistEnabled ?? false;

                  // Waitlist mode — no booking yet
                  if (waitlistOn) return (
                    <JoinWaitlistButton sessionId={session.id} sessionTitle={session.title} waitlistCount={waitlistCount} initialJoined={currentUserId ? waitlistEntries.some((w) => (w as any).clerkUserId === currentUserId) : false} />
                  );

                  if (isFull) return (
                    <div className="w-full py-3 rounded-xl text-center text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                      style={{ backgroundColor: "#DC373E" }}>Session Full</div>
                  );

                  if (hasStarted && !allowLate) return (
                    <LateBookingRequest sessionId={session.id} sessionTitle={session.title} />
                  );

                  // Show discount preview before checkout
                  const discPct = (session as any).discountPct ?? 0;
                  const discLabel = (session as any).discountLabel ?? "";
                  const displayPrice = discPct > 0
                    ? Math.round(session.pricePerPlayer * (1 - discPct / 100))
                    : session.pricePerPlayer;

                  return (
                    <>
                      {discPct > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground line-through">${session.pricePerPlayer}/player</p>
                          <p className="text-lg font-extrabold" style={{ color: "#DC373E" }}>${displayPrice}/player</p>
                          {discLabel && <p className="text-xs font-semibold" style={{ color: "#DC373E" }}>{discLabel}</p>}
                        </div>
                      )}
                      {proratedPrice !== null && hasStarted && (
                        <p className="text-xs text-center text-muted-foreground">
                          {remaining} of {total} sessions remaining · <span className="font-semibold text-[#0F3154]">${proratedPrice} pro-rated</span>
                        </p>
                      )}
                      <Link href={`/sessions/${session.id}/book`}
                        className="flex items-center justify-center w-full py-3 rounded-xl text-white font-semibold text-sm"
                        style={{ backgroundColor: "#DC373E" }}>
                        Reserve My Spot
                      </Link>
                    </>
                  );
                })()}
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Secure · Cancel 24h before
                </p>
                {session.firstClassFree && trainer && (
                  <div className="space-y-1.5 pt-1 border-t">
                    <p className="text-xs text-muted-foreground text-center">New players — message trainer to claim</p>
                    <ContactTrainerForm
                      sessionId={session.id}
                      sessionTitle={session.title}
                      trainerName={trainer?.name ?? "Trainer"}
                      defaultMessage={`Hi, I'd like to claim the free first class for "${session.title}".`}
                      ctaLabel="Claim Free First Class"
                      ctaStyle="highlight"
                    />
                  </div>
                )}
                {!(session as any).waitlistEnabled && !isFull && (
                  <div className="pt-1 border-t">
                    <JoinWaitlistButton
                      sessionId={session.id}
                      sessionTitle={session.title}
                      waitlistCount={waitlistCount}
                      initialJoined={currentUserId ? waitlistEntries.some((w) => w.clerkUserId === currentUserId) : false}
                    />
                  </div>
                )}
              </div>

              {/* Session dates — spans full width, above Date/Time details */}
              {(() => {
                const rawDates = Array.isArray((session as any).sessionDates) ? (session as any).sessionDates : [];
                const dates: { date: string; time?: string }[] = rawDates.map((d: any) =>
                  typeof d === "string" ? { date: d } : d
                );
                const today = new Date().toISOString().split("T")[0];
                const upcoming = dates.filter((d) => d.date >= today);
                if (!dates.length) return null;
                return (
                  <div className="sm:col-span-2 bg-white rounded-2xl border shadow-sm p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Session Dates
                      <span className="ml-2 font-normal normal-case text-muted-foreground">({upcoming.length} upcoming)</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dates.map((d) => {
                        const isPast = d.date < today;
                        const showTime = d.time && d.time !== session.time;
                        return (
                          <span key={d.date}
                            className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${isPast ? "text-muted-foreground bg-muted/50 line-through" : "text-[#0F3154] bg-blue-50 border-blue-100"}`}>
                            {new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            {showTime && <span className="ml-1 text-xs opacity-75">@ {d.time}</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Details 2x2 — spans full width below both columns on desktop */}
              <div className="sm:col-span-2 bg-white rounded-2xl border shadow-sm p-5">
              <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
                {/* Date/Time */}
                <div className="p-4 pl-0 pt-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Date / Time</p>
                  <div className="space-y-1.5 text-sm">
                    {session.dayOfWeek && session.time ? (
                      <p className="flex items-center gap-1.5 font-medium"><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />{session.dayOfWeek}s at {session.time}</p>
                    ) : <p className="text-muted-foreground text-sm">—</p>}
                    {session.duration && (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white`}
                        style={{ backgroundColor: session.duration > 60 ? "#DC373E" : "#0F3154" }}>
                        <Clock className="h-3 w-3 shrink-0" />
                        {session.duration >= 60
                          ? `${Math.floor(session.duration / 60)} hr${session.duration % 60 > 0 ? ` ${session.duration % 60} min` : ""}`
                          : `${session.duration} min`}
                      </span>
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
                  {(session as any).discountPct > 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground line-through">${session.pricePerPlayer}/player</p>
                      <p className="text-2xl font-extrabold" style={{ color: "#DC373E" }}>
                        ${Math.round(session.pricePerPlayer * (1 - (session as any).discountPct / 100))}
                        <span className="text-sm font-medium text-muted-foreground ml-1">/ player</span>
                      </p>
                      {(session as any).discountLabel && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mt-1 inline-block" style={{ backgroundColor: "#DC373E" }}>
                          {(session as any).discountLabel}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-2xl font-extrabold" style={{ color: "#0F3154" }}>${session.pricePerPlayer}<span className="text-sm font-medium text-muted-foreground ml-1">/ player</span></p>
                  )}
                </div>
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

            {/* Session video */}
            {embedUrl && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="aspect-video">
                  <iframe src={embedUrl} title="Session video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                </div>
              </div>
            )}

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

            {/* Trainer card — desktop only */}
            {trainer && (
              <div className="hidden lg:block bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="relative h-52 w-full bg-gray-100">
                  {trainer.photo ? (
                    <Image src={trainer.photo} alt={trainer.name} fill className="object-contain" sizes="320px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ backgroundColor: "#0F3154" }}>
                      {trainer.name?.[0] ?? "T"}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-base">{trainer.name}</p>
                    <FollowButton
                      trainerClerkId={session.trainerClerkId}
                      initialIsFollowing={isFollowing}
                      initialStatus={followStatus}
                      isSignedIn={!!currentUserId}
                    />
                  </div>
                  {(() => {
                    const locs = (trainer.coachingLocations as Array<{ name: string; city?: string }> | null);
                    if (!locs?.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {locs.map((loc, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-lg border bg-gray-50 font-medium text-gray-700">
                            {loc.name}{loc.city ? `, ${loc.city}` : ""}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
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
                  {/* Mobile: icon row */}
                  <div className="grid grid-cols-4 gap-2 sm:hidden">
                    <ContactTrainerForm sessionId={session.id} sessionTitle={session.title} trainerName={trainer.name ?? "Trainer"} compact />
                    <Link href={`/groups/${trainer.id}`} title="View trainer profile"
                      className="flex flex-col items-center justify-center gap-1 w-full py-2 rounded-xl border hover:bg-muted transition-colors"
                      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                      <Users className="h-4 w-4" />
                      <span className="text-[10px] font-semibold leading-none">Profile</span>
                    </Link>
                    <AddToCalendarButton title={session.title} dayOfWeek={session.dayOfWeek ?? ""} time={session.time ?? ""} durationMin={session.duration ?? 60} location={session.venue ? `${session.venue}, ${session.city}` : session.city ?? ""} description={session.notes ?? undefined} compact />
                    <CopyLinkButton url={`https://www.grupup.app/sessions/${session.id}`} compact />
                  </div>
                  {/* Desktop: stacked buttons */}
                  <div className="hidden sm:block space-y-2">
                    <ContactTrainerForm sessionId={session.id} sessionTitle={session.title} trainerName={trainer.name ?? "Trainer"} />
                    <Link href={`/groups/${trainer.id}`}
                      className="block text-center text-sm font-semibold py-2.5 rounded-lg border hover:bg-muted transition-colors"
                      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                      View trainer profile
                    </Link>
                    <AddToCalendarButton title={session.title} dayOfWeek={session.dayOfWeek ?? ""} time={session.time ?? ""} durationMin={session.duration ?? 60} location={session.venue ? `${session.venue}, ${session.city}` : session.city ?? ""} description={session.notes ?? undefined} />
                    <CopyLinkButton url={`https://www.grupup.app/sessions/${session.id}`} />
                  </div>
                </div>
              </div>
            )}

            {/* RSVP list */}
            {waitlistEntries.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Interested ({waitlistEntries.length})
                </p>
                <div className="space-y-2">
                  {waitlistEntries.map((w, i) => {
                    const name = w.userName ?? "Player";
                    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const firstName = name.split(" ")[0];
                    const lastInitial = name.split(" ")[1]?.[0] ? `${name.split(" ")[1][0]}.` : "";
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        {w.photo ? (
                          <Image src={w.photo} alt={name} width={32} height={32} className="h-8 w-8 rounded-full object-cover shrink-0" unoptimized />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 bg-amber-500">
                            {initials}
                          </div>
                        )}
                        <span className="text-sm font-medium">{firstName} {lastInitial}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                        {(a as any).photo ? (
                          <Image src={(a as any).photo} alt={name} width={32} height={32} className="h-8 w-8 rounded-full object-cover shrink-0" unoptimized />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: "#0F3154" }}>
                            {initials}
                          </div>
                        )}
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
