import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/db";
import { trainers, playerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminEditClient from "./AdminEditClient";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export const dynamic = "force-dynamic";

export default async function AdminEditPage({ params }: { params: Promise<{ userId: string }> }) {
  noStore(); // prevent any caching of this page
  const { userId: adminId } = await auth();
  if (!adminId) redirect("/sign-in");

  const client = await clerkClient();
  const admin = await client.users.getUser(adminId);
  const adminEmail = admin.emailAddresses?.[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(adminEmail)) redirect("/");

  const { userId } = await params;
  const target = await client.users.getUser(userId);

  const meta = target.publicMetadata as Record<string, any>;

  // Always try the DB — trainers may not have role set in Clerk metadata
  const [trainerDbProfile] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
  const role = meta.role ?? (trainerDbProfile ? "trainer" : "player");

  // Load player's default/first profile from DB (player data lives here, not in Clerk)
  const [playerDbProfile] = await db.select().from(playerProfiles)
    .where(eq(playerProfiles.clerkUserId, userId))
    .orderBy(playerProfiles.isDefault, playerProfiles.id);

  const playerSports: string[] = meta.playerSports?.length
    ? (meta.playerSports as string[])
    : meta.sport ? [meta.sport as string] : [];

  return (
    <AdminEditClient
      userId={userId}
      role={role}
      playerProfileId={playerDbProfile?.id ?? null}
      initialData={{
        firstName: target.firstName ?? "",
        lastName: target.lastName ?? "",
        email: target.emailAddresses?.[0]?.emailAddress ?? "",
        photo: (playerDbProfile?.photo ?? meta.photo ?? trainerDbProfile?.photo ?? target.imageUrl ?? "") as string,
        city: (playerDbProfile?.city ?? meta.city ?? trainerDbProfile?.city ?? "") as string,
        country: (meta.country ?? "") as string,
        bio: (playerDbProfile?.bio ?? meta.bio ?? trainerDbProfile?.bio ?? "") as string,
        sport: (playerDbProfile?.sport ?? meta.sport ?? trainerDbProfile?.sport ?? "") as string,
        playerSports,
        sports: ((meta.sports ?? trainerDbProfile?.sports ?? []) as string[]),
        level: (playerDbProfile?.skillLevel ?? meta.level ?? "") as string,
        league: (meta.league ?? "") as string,
        team: (meta.team ?? "") as string,
        birthYear: (playerDbProfile?.birthYear ? String(playerDbProfile.birthYear) : meta.birthYear ?? "") as string,
        gender: (meta.gender ?? "") as string,
        yearsExperience: String(meta.yearsExperience ?? trainerDbProfile?.yearsExperience ?? ""),
        specialties: ((meta.specialties ?? trainerDbProfile?.specialties ?? []) as string[]),
        certifications: ((meta.certifications ?? trainerDbProfile?.certifications ?? []) as string[]),
        videoLinks: ((meta.videoLinks ?? []) as string[]),
        improvementAreas: ((meta.improvementAreas ?? ["Ball Skills"]) as string[]),
        availableForFreePlay: (meta.availableForFreePlay ?? false) as boolean,
        openToTrain: (meta.openToTrain ?? false) as boolean,
        isApproved: (meta.isApproved ?? false) as boolean,
        isHidden: (meta.isHidden ?? false) as boolean,
        instagram: ((playerDbProfile as any)?.instagram ?? "") as string,
        tiktok: ((playerDbProfile as any)?.tiktok ?? "") as string,
        snapchat: ((playerDbProfile as any)?.snapchat ?? "") as string,
        position: (meta.position ?? "") as string,
        videoUrl: (trainerDbProfile?.videoUrl ?? "") as string,
        coachingLocations: ((trainerDbProfile?.coachingLocations ?? []) as Array<{ name: string; city?: string; logo?: string }>),
      }}
    />
  );
}
