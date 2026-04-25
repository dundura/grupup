"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: {
  role: string;
  firstName: string;
  lastName: string;
  city: string;
  sport: string;
  level?: string;
  bio?: string;
  yearsExperience?: string;
  selectedCerts?: string[];
  selectedSpecialties?: string[];
  playerName?: string;
  playerAge?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const client = await clerkClient();

  await client.users.updateUser(userId, {
    publicMetadata: {
      role: formData.role,
      city: formData.city,
      sport: formData.sport,
      onboardingComplete: true,
      ...(formData.role === "trainer" && {
        bio: formData.bio,
        yearsExperience: formData.yearsExperience,
        specialties: formData.selectedSpecialties,
        certifications: formData.selectedCerts,
      }),
      ...(formData.role === "parent" && {
        playerName: formData.playerName,
        playerAge: formData.playerAge,
      }),
      ...(formData.role === "player" && {
        level: formData.level,
      }),
    },
    firstName: formData.firstName,
    lastName: formData.lastName,
  });

  redirect("/dashboard");
}
