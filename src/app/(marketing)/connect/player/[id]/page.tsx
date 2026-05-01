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

              {/* Social links */}
              {((profile as any).instagram || (profile as any).tiktok || (profile as any).snapchat) && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {(profile as any).instagram && (
                    <a href={`https://instagram.com/${(profile as any).instagram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border hover:opacity-80 transition-opacity text-xs font-semibold"
                      style={{ borderColor: "#e1306c", color: "#e1306c", backgroundColor: "#fff0f5" }}>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      @{(profile as any).instagram}
                    </a>
                  )}
                  {(profile as any).tiktok && (
                    <a href={`https://tiktok.com/@${(profile as any).tiktok}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border hover:opacity-80 transition-opacity text-xs font-semibold"
                      style={{ borderColor: "#000", color: "#000", backgroundColor: "#f5f5f5" }}>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/></svg>
                      @{(profile as any).tiktok}
                    </a>
                  )}
                  {(profile as any).snapchat && (
                    <a href={`https://snapchat.com/add/${(profile as any).snapchat}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border hover:opacity-80 transition-opacity text-xs font-semibold"
                      style={{ borderColor: "#FFFC00", color: "#000", backgroundColor: "#FFFDE0" }}>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#FFFC00" stroke="#000" strokeWidth="0.5"><path d="M12.166 2c.93 0 4.087.26 5.565 3.577.44 1.005.336 2.712.256 4.056l-.013.228c-.003.068.055.134.137.148.26.047.54.07.827.07.364 0 .697-.05.988-.146a.2.2 0 01.257.19c0 .524-.46 1.003-1.266 1.303-.117.044-.135.177-.04.238.26.165.746.534.746 1.063 0 .45-.356.813-.94.942-.162.036-.216.173-.108.283.5.511.67 1.01.513 1.494-.2.622-.84.908-1.604.908-.232 0-.474-.026-.714-.077-.288-.062-.428.086-.36.34.187.7.133 1.32-.158 1.845-.403.725-1.177 1.118-2.2 1.133-.12.002-.248.003-.38.003C13.67 19.7 13 19.97 12 22c-1-2.03-1.67-2.3-2.73-2.3-.133 0-.26-.001-.38-.003-1.024-.015-1.798-.408-2.2-1.133-.292-.524-.346-1.145-.16-1.845.069-.254-.07-.402-.36-.34-.24.051-.482.077-.713.077-.765 0-1.404-.286-1.604-.908-.157-.484.013-.983.513-1.494.108-.11.054-.247-.108-.283-.584-.129-.94-.492-.94-.942 0-.53.487-.898.746-1.063.096-.061.077-.194-.04-.238C3.26 11.28 2.8 10.8 2.8 10.278a.2.2 0 01.257-.19c.29.096.624.146.988.146.287 0 .567-.023.827-.07.082-.014.14-.08.137-.148l-.013-.228c-.08-1.344-.184-3.05.256-4.056C6.729 2.26 9.236 2 12.166 2z"/></svg>
                      {(profile as any).snapchat}
                    </a>
                  )}
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
