"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function completeOnboarding(formData: {
  role: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  sport?: string;
  selectedSports?: string[];
  level?: string;
  bio?: string;
  yearsExperience?: string;
  selectedCerts?: string[];
  selectedSpecialties?: string[];
  playerName?: string;
  playerAge?: string;
  customCert?: string;
  isHidden?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const client = await clerkClient();

    await client.users.updateUser(userId, {
      publicMetadata: {
        role: formData.role,
        country: formData.country,
        city: formData.city,
        sport: formData.role === "trainer" ? formData.selectedSports?.[0] : formData.sport,
        onboardingComplete: true,
        isHidden: formData.isHidden ?? false,
        ...(formData.role === "trainer" && {
          bio: formData.bio,
          yearsExperience: formData.yearsExperience,
          sports: formData.selectedSports,
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

    return { success: true };
  } catch (err) {
    console.error("completeOnboarding error:", err);
    return { success: false, error: "Failed to save profile. Please try again." };
  }
}
