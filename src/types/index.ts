import type { UserRole } from "@prisma/client";

export type { Locale } from "@/config/site";

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type SearchFilters = {
  query?: string;
  city?: string;
  region?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  bustMin?: number;
  bustMax?: number;
  waistMin?: number;
  waistMax?: number;
  hipsMin?: number;
  hipsMax?: number;
  eyeColor?: string;
  hairColor?: string;
  ethnicity?: string;
  categories?: string[];
  professionalStatus?: string;
  travelAvailability?: boolean;
  followerMin?: number;
  followerMax?: number;
  spokenLanguages?: string[];
  shoeSizeMin?: number;
  shoeSizeMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "relevance" | "recent" | "completeness" | "popular";
};

export type CompletenessLevel = "basic" | "almost_complete" | "ready";

export function getCompletenessLevel(score: number): CompletenessLevel {
  if (score >= 71) return "ready";
  if (score >= 31) return "almost_complete";
  return "basic";
}

export function getCompletenessLabel(score: number, locale: string = "it"): string {
  const level = getCompletenessLevel(score);
  const labels: Record<CompletenessLevel, { it: string; en: string }> = {
    basic: { it: "Profilo base", en: "Basic profile" },
    almost_complete: { it: "Quasi completo", en: "Almost complete" },
    ready: { it: "Pronto per essere scoperto", en: "Ready to be discovered" },
  };
  return labels[level][locale as "it" | "en"] || labels[level].it;
}

export type DashboardRole = Extract<UserRole, "MODEL" | "SCOUT" | "STUDIO" | "ADMIN">;
