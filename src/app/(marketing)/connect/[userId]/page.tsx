import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, Users, Calendar, ChevronLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: viewerUserId } = await auth();
  const { userId: targetUserId } = await params;

  const client = await clerkClient();

  let target;
  try {
    target = await client.users.getUser(targetUserId);
  } catch {
    notFound();
  }

  const meta = target.publicMetadata as {
    role?: string; isApproved?: boolean; isHidden?: boolean; photo?: string;
    city?: string; country?: string; sport?: string; level?: string;
    league?: string; team?: string; bio?: string; birthYear?: string;
  };

  const isOwner = viewerUserId === targetUserId;
  const isPlayer = meta.role === "player" || meta.role === "parent";

  if (!isPlayer) notFound();

  // Only owner can see unapproved or hidden profiles
  if (!isOwner && (!meta.isApproved || meta.isHidden)) {
    redirect("/connect");
  }

  const name = `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim()
    || target.emailAddresses?.[0]?.emailAddress ?? "Player";
  const photo = meta.photo ?? target.imageUrl ?? "";

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link href="/connect" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Connect
        </Link>

        {/* Pending banner for owner */}
        {isOwner && !meta.isApproved && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile pending approval</p>
              <p className="text-xs text-amber-700">Your profile is only visible to you until an admin approves it.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-[#f8fafc]">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                {photo ? (
                  <Image src={photo} alt={name} fill className="object-cover" sizes="80px" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                {(meta.city || meta.country) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[meta.city, meta.country].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {meta.sport && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                      {meta.sport}
                    </span>
                  )}
                  {meta.level && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                      {meta.level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {meta.bio && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Looking for</h2>
                <p className="text-sm leading-relaxed text-foreground">{meta.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {meta.league && (
                <div className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#0F3154" }} />
                  <div>
                    <p className="text-xs text-muted-foreground">League</p>
                    <p className="text-sm font-semibold">{meta.league}</p>
                  </div>
                </div>
              )}
              {meta.team && (
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#0F3154" }} />
                  <div>
                    <p className="text-xs text-muted-foreground">Team / Club</p>
                    <p className="text-sm font-semibold">{meta.team}</p>
                  </div>
                </div>
              )}
              {meta.birthYear && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#0F3154" }} />
                  <div>
                    <p className="text-xs text-muted-foreground">Birth year</p>
                    <p className="text-sm font-semibold">{meta.birthYear}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="px-6 pb-6">
              <Link href="/profile"
                className="block w-full text-center py-2.5 rounded-xl border text-sm font-semibold transition-colors hover:bg-[#f0f4f9]"
                style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                Edit my profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
