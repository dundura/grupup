import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/db";
import { trainers } from "@/db/schema";
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
  const role = meta.role ?? "player";

  let trainerDbProfile = null;
  if (role === "trainer") {
    const [row] = await db.select().from(trainers).where(eq(trainers.clerkId, userId));
    trainerDbProfile = row ?? null;
  }

  // playerSports: support both old single-sport and new array format
  const playerSports: string[] = meta.playerSports?.length
    ? (meta.playerSports as string[])
    : meta.sport ? [meta.sport as string] : [];

  return (
    <AdminEditClient
      userId={userId}
      role={role}
      initialData={{
        firstName: target.firstName ?? "",
        lastName: target.lastName ?? "",
        email: target.emailAddresses?.[0]?.emailAddress ?? "",
        photo: (meta.photo ?? trainerDbProfile?.photo ?? target.imageUrl ?? "") as string,
        city: (meta.city ?? trainerDbProfile?.city ?? "") as string,
        country: (meta.country ?? "") as string,
        bio: (meta.bio ?? trainerDbProfile?.bio ?? "") as string,
        sport: (meta.sport ?? trainerDbProfile?.sport ?? "") as string,
        playerSports,
        sports: ((meta.sports ?? trainerDbProfile?.sports ?? []) as string[]),
        level: (meta.level ?? "") as string,
        league: (meta.league ?? "") as string,
        team: (meta.team ?? "") as string,
        birthYear: (meta.birthYear ?? "") as string,
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
      }}
    />
  );
}
