#!/usr/bin/env node
/**
 * One-shot script to create all 7 Stripe products + prices in Test mode
 * and patch .env.local with the resulting price IDs.
 *
 * Usage: node scripts/setup-stripe-products.mjs
 *
 * Safe to re-run: it searches for existing products by lookup_key first.
 */
import { config } from "dotenv";
import Stripe from "stripe";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: ".env.local" });

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret || !secret.startsWith("sk_test_")) {
  console.error("ERROR: STRIPE_SECRET_KEY missing or not a test key (must start with sk_test_).");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });

/**
 * Product specs.
 * lookup_key is used to find existing prices on re-run (idempotency).
 * envVar is the .env.local key that will receive the resulting price.id.
 */
const PRODUCTS = [
  {
    name: "Scoutica Scout Pro",
    description: "For freelance scouts and casting directors. Unlimited contacts, advanced search, post castings.",
    lookup_key: "scout_pro_monthly",
    envVar: "STRIPE_SCOUT_PRO_PRICE_ID",
    metadata: { tier: "SCOUT_PRO", interval: "month" },
    price: {
      unit_amount: 2900, // 29.00 EUR
      currency: "eur",
      recurring: { interval: "month" },
    },
  },
  {
    name: "Scoutica Scout Pro (Annual)",
    description: "Scout Pro, annual billing — 2 months free.",
    lookup_key: "scout_pro_annual",
    envVar: "STRIPE_SCOUT_PRO_ANNUAL_PRICE_ID",
    metadata: { tier: "SCOUT_PRO", interval: "year" },
    price: {
      unit_amount: 29000, // 290.00 EUR
      currency: "eur",
      recurring: { interval: "year" },
    },
  },
  {
    name: "Scoutica Agency (Founding)",
    description: "For structured agencies with booker teams. Multi-seat workspace, public roster, analytics.",
    lookup_key: "agency_monthly_founding",
    envVar: "STRIPE_AGENCY_PRICE_ID",
    metadata: { tier: "AGENCY", interval: "month", founding: "true" },
    price: {
      unit_amount: 9900, // 99.00 EUR (founding price; later 14900)
      currency: "eur",
      recurring: { interval: "month" },
    },
  },
  {
    name: "Scoutica Agency Annual (Founding)",
    description: "Agency, annual billing — founding price.",
    lookup_key: "agency_annual_founding",
    envVar: "STRIPE_AGENCY_ANNUAL_PRICE_ID",
    metadata: { tier: "AGENCY", interval: "year", founding: "true" },
    price: {
      unit_amount: 99000, // 990.00 EUR
      currency: "eur",
      recurring: { interval: "year" },
    },
  },
  {
    name: "Scoutica Studio Pro",
    description: "For photo studios, locations and casting directors. Unlimited castings, application management, talent search.",
    lookup_key: "studio_pro_monthly",
    envVar: "STRIPE_STUDIO_PRICE_ID",
    metadata: { tier: "STUDIO", interval: "month" },
    price: {
      unit_amount: 4900, // 49.00 EUR
      currency: "eur",
      recurring: { interval: "month" },
    },
  },
  {
    name: "Scoutica Studio Pro (Annual)",
    description: "Studio Pro, annual billing — 2 months free.",
    lookup_key: "studio_pro_annual",
    envVar: "STRIPE_STUDIO_ANNUAL_PRICE_ID",
    metadata: { tier: "STUDIO", interval: "year" },
    price: {
      unit_amount: 49000, // 490.00 EUR
      currency: "eur",
      recurring: { interval: "year" },
    },
  },
  {
    name: "Scoutica Profile Boost",
    description: "Profile featured in discovery for 7 days. One-time purchase, stackable.",
    lookup_key: "profile_boost",
    envVar: "STRIPE_BOOST_PRICE_ID",
    metadata: { type: "boost" },
    price: {
      unit_amount: 499, // 4.99 EUR
      currency: "eur",
      // no recurring → one-time
    },
  },
];

async function ensurePrice(spec) {
  // 1) Look for existing active price with this lookup_key
  const existing = await stripe.prices.list({
    lookup_keys: [spec.lookup_key],
    active: true,
    limit: 1,
    expand: ["data.product"],
  });

  if (existing.data.length > 0) {
    const price = existing.data[0];
    const product = price.product;
    console.log(
      `  ✓ existing  ${spec.lookup_key.padEnd(28)} → product ${product.id}, price ${price.id} (${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()})`,
    );
    return price.id;
  }

  // 2) Create product
  const product = await stripe.products.create({
    name: spec.name,
    description: spec.description,
    metadata: spec.metadata,
  });

  // 3) Create price with lookup_key for future idempotency
  const price = await stripe.prices.create({
    product: product.id,
    currency: spec.price.currency,
    unit_amount: spec.price.unit_amount,
    ...(spec.price.recurring ? { recurring: spec.price.recurring } : {}),
    lookup_key: spec.lookup_key,
    metadata: spec.metadata,
  });

  console.log(
    `  ➕ created   ${spec.lookup_key.padEnd(28)} → product ${product.id}, price ${price.id} (${(spec.price.unit_amount / 100).toFixed(2)} ${spec.price.currency.toUpperCase()})`,
  );
  return price.id;
}

function patchEnvFile(updates) {
  const envPath = resolve(".env.local");
  let content = readFileSync(envPath, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}="?[^"\\n]*"?$`, "m");
    const line = `${key}="${value}"`;
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content = content.trimEnd() + "\n" + line + "\n";
    }
  }
  writeFileSync(envPath, content, "utf8");
}

async function main() {
  console.log("🛒 Creating Stripe products + prices (test mode)…\n");
  const updates = {};
  for (const spec of PRODUCTS) {
    try {
      const priceId = await ensurePrice(spec);
      updates[spec.envVar] = priceId;
    } catch (err) {
      console.error(`  ✗ failed    ${spec.lookup_key}: ${err.message}`);
      throw err;
    }
  }

  console.log("\n📝 Patching .env.local with price IDs…");
  patchEnvFile(updates);
  for (const [k, v] of Object.entries(updates)) {
    console.log(`  ${k}="${v}"`);
  }

  console.log("\n✅ Done. 7 products + 7 prices ready in Stripe test mode.");
  console.log("   View them: https://dashboard.stripe.com/test/products");
}

main().catch((err) => {
  console.error("\n❌ Script failed:", err.message);
  process.exit(1);
});
