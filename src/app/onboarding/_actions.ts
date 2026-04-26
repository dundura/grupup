"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function completeOnboarding(formData: {
  role: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
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
        onboardingComplete: true,
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
