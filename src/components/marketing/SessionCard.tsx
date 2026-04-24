import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, Star } from "lucide-react";
import type { GroupSession } from "@/lib/types";
import { SESSION_TYPE_LABELS, SESSION_TYPE_SPOTS } from "@/lib/types";

const skillColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-orange-100 text-orange-700",
  Elite: "bg-purple-100 text-purple-700",
};

interface SessionCardProps {
  session: GroupSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const spotsFilled = session.totalSpots - session.spotsLeft;
  const fillPct = Math.round((spotsFilled / session.totalSpots) * 100);
  const almostFull = session.spotsLeft <= 2;

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group block bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
    >
      {/* Header band */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#0F3154" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl leading-none">{session.sportEmoji}</span>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{session.sport}</span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/60 text-xs font-semibold">{SESSION_TYPE_LABELS[session.sessionType]}</span>
            </div>
            <h3 className="text-white font-bold text-base leading-tight">{session.title}</h3>
            <p className="text-white/50 text-xs mt-0.5">{session.focus}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-extrabold text-xl leading-none">${session.pricePerPlayer}</div>
            <div className="text-white/50 text-xs mt-0.5">
              {session.sessionType === "private" ? "/ session" : "/ player"}
            </div>
            {session.sessionType === "private" && session.trainerRate && (
              <div className="text-white/30 text-xs mt-0.5">incl. 15% fee</div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Trainer row */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
            <Image
              src={session.trainer.photo}
              alt={session.trainer.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{session.trainer.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium">{session.trainer.rating}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{session.dayOfWeek}s</span>
            <span>·</span>
            <span>{session.time}</span>
            <span>·</span>
            <span>{session.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{session.venue}, {session.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Ages {session.ageRange}</span>
          </div>
        </div>

        {/* Skill level + age */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${skillColors[session.skillLevel]}`}>
            {session.skillLevel}
          </span>
          {session.recurring && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Weekly</span>
          )}
        </div>

        {/* Spots progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={almostFull ? "font-bold text-[#DC373E]" : "text-muted-foreground"}>
              {almostFull ? `⚡ Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left!` : `${session.spotsLeft} of ${session.totalSpots} spots open`}
            </span>
            <span className="text-muted-foreground">{spotsFilled}/{session.totalSpots} joined</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                backgroundColor: almostFull ? "#DC373E" : "#0F3154",
              }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <div
          className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
          style={{ backgroundColor: "#DC373E" }}
        >
          Join This Group
        </div>
      </div>
    </Link>
  );
}
