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

// FREE tier. Each role only consumes the fields relevant to it:
// - Models are free forever → generous media limits to build a rich
//   supply-side catalogue (maxPhotos / video / pdf).
// - Scouts & Studios on the free plan get a limited taste of the demand-side
//   actions (contact requests, boards, advanced filters, saved searches),
//   creating a clear upgrade path to the paid tiers (Scout Pro / Agency / Studio).
const FREE_LIMITS: PlanLimits = {
  maxPhotos: 5,
  videoUpload: true,
  pdfBookUpload: true,
  contactRequestsPerMonth: 5,
  contactRequestsPerDay: 3,
  maxShortlistBoards: 1,
  maxItemsPerBoard: 50,
  advancedFilters: false,
  savedSearches: false,
  prioritySupport: false,
};

// Everything unlocked for paid tiers (Scout Pro €29, Agency €99, Studio €49).
const PRO_LIMITS: PlanLimits = {
  maxPhotos: 12,
  videoUpload: true,
  pdfBookUpload: true,
  contactRequestsPerMonth: Infinity,
  contactRequestsPerDay: Infinity,
  maxShortlistBoards: Infinity,
  maxItemsPerBoard: Infinity,
  advancedFilters: true,
  savedSearches: true,
  prioritySupport: true,
};

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: FREE_LIMITS,
  // Legacy: models are free forever and there is no Model Pro checkout.
  // Kept so existing data referencing MODEL_PRO does not break; mirrors the
  // free media limits with priority support.
  MODEL_PRO: { ...FREE_LIMITS, prioritySupport: true },
  SCOUT_PRO: PRO_LIMITS,
  AGENCY: PRO_LIMITS,
  STUDIO: PRO_LIMITS,
};

// One-time profile boost (Stripe one-off): priority placement in discovery.
export const BOOST_CONFIG = {
  price: 4.99,
  currency: "€",
  durationDays: 7,
  maxStacked: 4,
};

// Promoted casting (Stripe one-off): featured placement for a listing.
export const PROMOTED_CASTING_CONFIG = {
  price: 49,
  currency: "€",
  durationDays: 14,
};
