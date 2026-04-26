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

    // Get existing metadata to preserve any previously set roles
    const user = await client.users.getUser(userId);
    const existing = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const existingRoles = Array.isArray(existing.roles) ? (existing.roles as string[]) : [];
    const roles = existingRoles.includes(formData.role)
      ? existingRoles
      : [...existingRoles, formData.role];

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...existing,
        roles,
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
