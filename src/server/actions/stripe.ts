"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { getStripe, PLANS } from "@/lib/stripe";
import type { ActionResponse } from "@/types";

export async function createCheckoutSession(
  planKey: "MODEL_PRO" | "STARTER" | "PRO"
): Promise<ActionResponse<{ url: string }>> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.stripe");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  // Validate plan-role compatibility
  if (planKey === "MODEL_PRO" && session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }
  if ((planKey === "STARTER" || planKey === "PRO") && session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const plan = PLANS[planKey];
  if (!plan) return { success: false, error: ts("invalidPlan") };

  // Get or create Stripe customer
  let subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let stripeCustomerId = subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    const customer = await getStripe().customers.create({
      email: user!.email,
      name: user?.name ?? undefined,
      metadata: { userId: session.user.id },
    });

    stripeCustomerId = customer.id;

    await db.subscription.update({
      where: { userId: session.user.id },
      data: { stripeCustomerId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = session.user.locale || "it";

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/${locale}/${session.user.role === "MODEL" ? "model" : "scout"}/settings/billing?success=true`,
    cancel_url: `${baseUrl}/${locale}/${session.user.role === "MODEL" ? "model" : "scout"}/settings/billing?canceled=true`,
    metadata: {
      userId: session.user.id,
      planKey,
    },
  });

  if (!checkoutSession.url) {
    return { success: false, error: ts("paymentSessionError") };
  }

  return { success: true, data: { url: checkoutSession.url } };
}

export async function createPortalSession(): Promise<ActionResponse<{ url: string }>> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.stripe");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return { success: false, error: ts("noActiveSubscription") };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = session.user.locale || "it";

  const rolePath = session.user.role === "MODEL" ? "model" : "scout";
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${baseUrl}/${locale}/${rolePath}/settings/billing`,
  });

  return { success: true, data: { url: portalSession.url } };
}

export async function createBoostCheckout(): Promise<ActionResponse<{ url: string }>> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.stripe");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isPublished: true },
  });

  if (!modelProfile?.isPublished) {
    return { success: false, error: ts("profileMustBePublished") };
  }

  // Get or create Stripe customer
  let subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let stripeCustomerId = subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    const customer = await getStripe().customers.create({
      email: user!.email,
      name: user?.name ?? undefined,
      metadata: { userId: session.user.id },
    });

    stripeCustomerId = customer.id;

    await db.subscription.update({
      where: { userId: session.user.id },
      data: { stripeCustomerId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = session.user.locale || "it";

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "payment",
    line_items: [
      {
        price: PLANS.BOOST.priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/${locale}/model/profile?boost=success`,
    cancel_url: `${baseUrl}/${locale}/model/profile?boost=canceled`,
    metadata: {
      userId: session.user.id,
      type: "boost",
      modelProfileId: modelProfile.id,
    },
  });

  if (!checkoutSession.url) {
    return { success: false, error: ts("paymentSessionError") };
  }

  return { success: true, data: { url: checkoutSession.url } };
}
