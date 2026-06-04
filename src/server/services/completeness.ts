import type { ModelProfile } from "@prisma/client";

type ProfileData = Partial<ModelProfile> & {
  portfolioImageCount?: number;
  hasCover?: boolean;
};

// Calculate profile completeness score (0-100)
export function calculateCompleteness(profile: ProfileData): number {
  let score = 0;
  const weights: { field: string; points: number }[] = [
    // Personal info (30 points)
    { field: "fullName", points: 8 },
    { field: "bio", points: 5 },
    { field: "dateOfBirth", points: 5 },
    { field: "gender", points: 3 },
    { field: "city", points: 5 },
    { field: "region", points: 4 },

    // Measurements (25 points)
    { field: "height", points: 7 },
    { field: "bust", points: 4 },
    { field: "waist", points: 4 },
    { field: "hips", points: 4 },
    { field: "shoeSize", points: 3 },
    { field: "dressSize", points: 3 },

    // Appearance (10 points)
    { field: "eyeColor", points: 4 },
    { field: "hairColor", points: 4 },
    { field: "ethnicity", points: 2 },

    // Professional (15 points)
    { field: "categories", points: 5 },
    { field: "professionalStatus", points: 5 },
    { field: "spokenLanguages", points: 5 },

    // Social (5 points)
    { field: "instagramUrl", points: 3 },
    { field: "websiteUrl", points: 2 },
  ];

  for (const { field, points } of weights) {
    const value = (profile as Record<string, unknown>)[field];
    if (value !== null && value !== undefined && value !== "" && value !== 0) {
      if (Array.isArray(value)) {
        if (value.length > 0) score += points;
      } else {
        score += points;
      }
    }
  }

  // Portfolio images (15 points)
  const imageCount = profile.portfolioImageCount ?? 0;
  if (imageCount >= 5) score += 15;
  else if (imageCount >= 3) score += 10;
  else if (imageCount >= 1) score += 5;

  return Math.min(score, 100);
}

/**
 * Check minimum requirements for profile activation (INCOMPLETE → ACTIVE).
 * These are the minimum fields a model must fill before the profile becomes usable.
 */
export function checkActivationRequirements(
  profile: ProfileData
): { canActivate: boolean; missing: string[] } {
  const missing: string[] = [];

  // Full name
  if (!profile.fullName || profile.fullName.trim().length < 2) {
    missing.push("fullName");
  }

  // City or region
  if (!profile.city && !profile.region) {
    missing.push("city");
  }

  // At least 1 category
  if (!profile.categories || (profile.categories as string[]).length === 0) {
    missing.push("category");
  }

  // At least 3 measurements: height required + 2 of bust/waist/hips
  const measurementCount = [profile.height, profile.bust, profile.waist, profile.hips]
    .filter((v) => v !== null && v !== undefined && v > 0).length;
  if (!profile.height || measurementCount < 3) {
    missing.push("measurements");
  }

  // At least 3 portfolio photos
  const imageCount = profile.portfolioImageCount ?? 0;
  if (imageCount < 3) {
    missing.push("photos");
  }

  return { canActivate: missing.length === 0, missing };
}

// Check if model can publish profile (requires ACTIVE status + additional requirements)
export function checkPublishRequirements(
  profile: ProfileData
): { canPublish: boolean; missing: string[] } {
  const missing: string[] = [];

  // Must be ACTIVE first
  if (profile.status === "INCOMPLETE") {
    missing.push("profileNotActive");
  }

  // Check age >= 18
  if (!profile.dateOfBirth) {
    missing.push("dateOfBirth");
  } else {
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (age < 18) missing.push("age18");
  }

  // Check name
  if (!profile.fullName || profile.fullName.trim().length < 2) {
    missing.push("fullName");
  }

  // Check at least 3 portfolio photos (needed to verify identity vs selfie)
  if (!profile.portfolioImageCount || profile.portfolioImageCount < 3) {
    missing.push("photos");
  }

  // Check cover image
  if (!profile.hasCover) {
    missing.push("cover");
  }

  return { canPublish: missing.length === 0, missing };
}
