import Stripe from "stripe";

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

export const PLANS = {
  // Deprecated: marketing now positions Model as free forever.
  // Kept for legacy data + Stripe customer migration. No UI exposes upgrade.
  MODEL_PRO: {
    name: "Model Pro (legacy)",
    priceId: process.env.STRIPE_MODEL_PRO_PRICE_ID!,
    price: 14.99,
    currency: "eur",
    interval: "month" as const,
  },
  // Scout Pro — marketing displays as "€29 / month"
  STARTER: {
    name: "Scout Pro",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 29,
    currency: "eur",
    interval: "month" as const,
  },
  // Agency — marketing displays as "€149 / month, 5 seats included"
  PRO: {
    name: "Agency",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 149,
    currency: "eur",
    interval: "month" as const,
  },
  // One-shot model profile boost — €4.99 for 7 days
  BOOST: {
    name: "Profile Boost",
    priceId: process.env.STRIPE_BOOST_PRICE_ID!,
    price: 4.99,
    currency: "eur",
    type: "one_time" as const,
  },
};
