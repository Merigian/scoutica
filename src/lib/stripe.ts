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
  MODEL_PRO: {
    name: "Model Pro",
    priceId: process.env.STRIPE_MODEL_PRO_PRICE_ID!,
    price: 14.99,
    currency: "eur",
    interval: "month" as const,
  },
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 39,
    currency: "eur",
    interval: "month" as const,
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 99,
    currency: "eur",
    interval: "month" as const,
  },
  BOOST: {
    name: "Profile Boost",
    priceId: process.env.STRIPE_BOOST_PRICE_ID!,
    price: 4.99,
    currency: "eur",
    type: "one_time" as const,
  },
};
