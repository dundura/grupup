import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { playerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import MessageButton from "@/components/messaging/MessageButton";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id);
  if (isNaN(numericId)) notFound();

  const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.id, numericId));
  if (!profile) notFound();
  if (!profile.isPublic) redirect("/connect");

  const client = await clerkClient();
  const parentUser = await client.users.getUser(profile.clerkUserId);
  const parentMeta = parentUser.publicMetadata as { isHidden?: boolean; city?: string; country?: string };
  if (parentMeta.isHidden) redirect("/connect");

  const { userId: viewerUserId } = await auth();
  const isOwner = viewerUserId === profile.clerkUserId;

  const location = [profile.city ?? parentMeta.city, parentMeta.country].filter(Boolean).join(", ");
  const parentName = `${parentUser.firstName ?? ""} ${parentUser.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-2">
        <Link href="/connect" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Connect
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5">
          <div className="sm:flex">

            {/* Photo */}
            <div className="relative sm:w-52 lg:w-64 sm:shrink-0 aspect-[3/4] sm:aspect-auto bg-[#0F3154]">
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill className="object-cover object-top" sizes="256px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-extrabold text-white/30">{profile.name[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
                  {location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />{location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Player · {parentName}</p>
                </div>
                {isOwner && (
                  <Link href="/dashboard"
                    className="shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-[#f0f4f9] transition-colors"
                    style={{ color: "#0F3154", borderColor: "#0F3154" }}>
                    Edit
                  </Link>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.sport && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f9] border" style={{ color: "#0F3154" }}>
                    {profile.sport}
                  </span>
                )}
                {profile.skillLevel && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f9]" style={{ color: "#0F3154" }}>
                    {profile.skillLevel}
                  </span>
                )}
                {profile.birthYear && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8fafc] border text-muted-foreground">
                    Born {profile.birthYear}
                  </span>
                )}
              </div>

              {/* Bio / notes */}
              {(profile.bio || profile.notes) && (
                <div className="bg-[#f8fafc] rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio || profile.notes}</p>
                </div>
              )}

              {/* Message parent */}
              {!isOwner && (
                <div className="mt-auto pt-2">
                  <MessageButton toClerkId={profile.clerkUserId} toName={parentName} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
