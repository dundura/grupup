"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendAdminNewPlayerNotification } from "@/lib/email";

export async function completeOnboarding(formData: {
  role: string;
  firstName: string;
  lastName: string;
  country: string;
  state?: string;
  city: string;
  zipCode?: string;
  isNewSignup?: boolean;
  // player / parent
  sport?: string;
  selectedPlayerSports?: string[];
  profileSlug?: string;
  customSlug?: string;
  level?: string;
  league?: string;
  team?: string;
  bio?: string;
  playerName?: string;
  playerAge?: string;
  birthYear?: string;
  gender?: string;
  videoLinks?: string[];
  availableForFreePlay?: boolean;
  openToTrain?: boolean;
  childProfiles?: any[];
  disableMessages?: boolean;
  isHidden?: boolean;
  photo?: string;
  // trainer
  selectedSports?: string[];
  yearsExperience?: string;
  selectedSpecialties?: string[];
  selectedCerts?: string[];
  // player extras
  position?: string;
  improvementAreas?: string[];
  socials?: { instagram?: string; tiktok?: string; twitter?: string; youtube?: string; facebook?: string; snapchat?: string };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const client = await clerkClient();
    const existing = await client.users.getUser(userId);
    const existingMeta = existing.publicMetadata as { isApproved?: boolean; onboardingComplete?: boolean };

    const isPlayer = formData.role === "player" || formData.role === "parent";
    const alreadyApproved = existingMeta.isApproved === true || (existingMeta.isApproved as unknown) === "true";

    const profileFields: Record<string, unknown> = {
      role: formData.role,
      country: formData.country,
      state: formData.state ?? "",
      city: formData.city,
      zipCode: formData.zipCode ?? "",
      onboardingComplete: true,
    };

    if (formData.photo !== undefined) profileFields.photo = formData.photo;

    if (isPlayer) {
      if (formData.selectedPlayerSports !== undefined) {
        profileFields.playerSports = formData.selectedPlayerSports;
        profileFields.sport = formData.selectedPlayerSports[0] ?? "";
      } else if (formData.sport !== undefined) {
        profileFields.sport = formData.sport;
      }
      if (formData.level !== undefined) profileFields.level = formData.level;
      if (formData.league !== undefined) profileFields.league = formData.league;
      if (formData.team !== undefined) profileFields.team = formData.team;
      if (formData.bio !== undefined) profileFields.bio = formData.bio;
      if (formData.isHidden !== undefined) profileFields.isHidden = formData.isHidden;
      if (formData.playerName !== undefined) profileFields.playerName = formData.playerName;
      if (formData.playerAge !== undefined) profileFields.playerAge = formData.playerAge;
      if (formData.birthYear !== undefined) profileFields.birthYear = formData.birthYear;
      if (formData.gender !== undefined) profileFields.gender = formData.gender;
      if (formData.videoLinks !== undefined) profileFields.videoLinks = formData.videoLinks;
      if (formData.childProfiles !== undefined) profileFields.childProfiles = formData.childProfiles;
      if (formData.availableForFreePlay !== undefined) profileFields.availableForFreePlay = formData.availableForFreePlay;
      if (formData.openToTrain !== undefined) profileFields.openToTrain = formData.openToTrain;
      if (formData.disableMessages !== undefined) profileFields.disableMessages = formData.disableMessages;
      if (formData.position !== undefined) profileFields.position = formData.position;
      if (formData.socials !== undefined) profileFields.socials = formData.socials;
      if (formData.improvementAreas !== undefined) {
        profileFields.improvementAreas = formData.improvementAreas.length ? formData.improvementAreas : ["Ball Skills"];
      }
      if (!alreadyApproved) profileFields.isApproved = true;
    } else {
      // trainer
      if (formData.selectedSports !== undefined) profileFields.sports = formData.selectedSports;
      if (formData.yearsExperience !== undefined) profileFields.yearsExperience = formData.yearsExperience;
      if (formData.selectedSpecialties !== undefined) profileFields.specialties = formData.selectedSpecialties;
      if (formData.selectedCerts !== undefined) profileFields.certifications = formData.selectedCerts;
      if (formData.bio !== undefined) profileFields.bio = formData.bio;
      if (formData.isHidden !== undefined) profileFields.isHidden = formData.isHidden;
    }

    // Custom slug update (player edits their own slug) — must be set BEFORE updateUser
    if (formData.customSlug) {
      const clean = formData.customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (clean) profileFields.profileSlug = clean;
    }

    // Generate profileSlug for players on first signup — must be set BEFORE updateUser
    if (isPlayer && formData.isNewSignup && !existingMeta.onboardingComplete) {
      const slugBase = `${formData.firstName} ${formData.lastName}`.trim()
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "player";
      const suffix = Math.random().toString(36).slice(2, 6);
      profileFields.profileSlug = `${slugBase}-${suffix}`;
    }

    await client.users.updateUser(userId, {
      publicMetadata: { ...existingMeta, ...profileFields },
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    // Notify admin on first-time signup (any role)
    if (formData.isNewSignup && !existingMeta.onboardingComplete) {
      const email = existing.emailAddresses?.[0]?.emailAddress ?? "";
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await sendAdminNewPlayerNotification({
        playerName: name || email,
        playerEmail: email,
        playerCity: formData.city,
        playerCountry: formData.country,
        role: formData.role,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("completeOnboarding error:", err);
    return { success: false, error: "Failed to save profile. Please try again." };
  }
}
