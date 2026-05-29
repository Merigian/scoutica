import { PlanTier } from "@prisma/client";

export type PlanLimits = {
  maxPhotos: number;
  videoUpload: boolean;
  pdfBookUpload: boolean;
  contactRequestsPerMonth: number;
  contactRequestsPerDay: number;
  maxShortlistBoards: number;
  maxItemsPerBoard: number;
  advancedFilters: boolean;
  savedSearches: boolean;
  prioritySupport: boolean;
};

// All features are free — no paywalls during growth phase
const UNLIMITED: PlanLimits = {
  maxPhotos: 12,
  videoUpload: true,
  pdfBookUpload: true,
  contactRequestsPerMonth: Infinity,
  contactRequestsPerDay: Infinity,
  maxShortlistBoards: Infinity,
  maxItemsPerBoard: Infinity,
  advancedFilters: true,
  savedSearches: true,
  prioritySupport: false,
};

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: UNLIMITED,
  MODEL_PRO: { ...UNLIMITED, prioritySupport: true },
  STARTER: { ...UNLIMITED, prioritySupport: true },
  PRO: { ...UNLIMITED, prioritySupport: true },
};

// Revenue comes from promoted castings, not subscriptions
export const PROMOTED_CASTING_CONFIG = {
  price: 49,
  currency: "€",
  durationDays: 14,
};
