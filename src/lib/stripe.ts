import Stripe from "stripe";
import type { PlanTier } from "@prisma/client";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() for lazy initialization */
export const stripe = typeof process !== "undefined" && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    })
  : (null as unknown as Stripe);

// Annual prices = 10 months for the price of 12 (≈17% discount).
// Agency monthly/annual are "founding" prices for the first 50 agencies
// (target retail: €149/mo, €1490/yr). We charge €99/mo, €990/yr at launch.
export const PLANS = {
  // Legacy: marketing now positions Model as free forever. Kept only so
  // existing data referencing MODEL_PRO does not break. No checkout offered.
  MODEL_PRO: {
    name: "Model Pro (legacy)",
    tier: "MODEL_PRO" as PlanTier,
    priceId: process.env.STRIPE_MODEL_PRO_PRICE_ID ?? "",
    price: 14.99,
    currency: "eur",
    interval: "month" as const,
    role: "MODEL" as const,
  },

  SCOUT_PRO_MONTHLY: {
    name: "Scout Pro",
    tier: "SCOUT_PRO" as PlanTier,
    priceId: process.env.STRIPE_SCOUT_PRO_PRICE_ID ?? "",
    price: 29,
    currency: "eur",
    interval: "month" as const,
    role: "SCOUT" as const,
  },
  SCOUT_PRO_ANNUAL: {
    name: "Scout Pro · Annual",
    tier: "SCOUT_PRO" as PlanTier,
    priceId: process.env.STRIPE_SCOUT_PRO_ANNUAL_PRICE_ID ?? "",
    price: 290,
    currency: "eur",
    interval: "year" as const,
    role: "SCOUT" as const,
  },

  AGENCY_MONTHLY: {
    name: "Agency",
    tier: "AGENCY" as PlanTier,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? "",
    price: 99, // founding offer; retail €149/mo
    currency: "eur",
    interval: "month" as const,
    role: "SCOUT" as const, // agency users have SCOUT role + AGENCY subtype
  },
  AGENCY_ANNUAL: {
    name: "Agency · Annual",
    tier: "AGENCY" as PlanTier,
    priceId: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID ?? "",
    price: 990, // founding offer; retail €1490/yr
    currency: "eur",
    interval: "year" as const,
    role: "SCOUT" as const,
  },

  STUDIO_MONTHLY: {
    name: "Studio Pro",
    tier: "STUDIO" as PlanTier,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID ?? "",
    price: 49,
    currency: "eur",
    interval: "month" as const,
    role: "STUDIO" as const,
  },
  STUDIO_ANNUAL: {
    name: "Studio Pro · Annual",
    tier: "STUDIO" as PlanTier,
    priceId: process.env.STRIPE_STUDIO_ANNUAL_PRICE_ID ?? "",
    price: 490,
    currency: "eur",
    interval: "year" as const,
    role: "STUDIO" as const,
  },

  BOOST: {
    name: "Profile Boost",
    tier: null,
    priceId: process.env.STRIPE_BOOST_PRICE_ID ?? "",
    price: 4.99,
    currency: "eur",
    type: "one_time" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type SubscriptionPlanKey = Exclude<PlanKey, "BOOST" | "MODEL_PRO">;

/** Map a Stripe price ID back to a PlanTier (used by webhook). */
export function tierFromPriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;
  for (const plan of Object.values(PLANS)) {
    if (plan.priceId && plan.priceId === priceId && plan.tier) return plan.tier;
  }
  return null;
}

export const TRIAL_DAYS = 14;
