import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, tierFromPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

import type { SubscriptionStatus, PlanTier } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ─── Idempotency: Stripe may deliver the same event multiple times.
  // We insert the event id with a unique constraint; if it already exists,
  // we short-circuit and return 200 so Stripe stops retrying.
  try {
    await db.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    // P2002 unique constraint violation = already processed.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) break;

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;

          const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const firstItem = stripeSubscription.items.data[0];
          // Source of truth = price ID → tier. Metadata is a hint only.
          const tier: PlanTier =
            tierFromPriceId(firstItem?.price.id) ??
            (session.metadata?.tier as PlanTier | undefined) ??
            "FREE";

          await db.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
              stripePriceId: firstItem?.price.id,
              plan: tier,
              status: mapSubscriptionStatus(stripeSubscription.status),
              currentPeriodStart: firstItem ? new Date(firstItem.current_period_start * 1000) : new Date(),
              currentPeriodEnd: firstItem ? new Date(firstItem.current_period_end * 1000) : new Date(),
              cancelAtPeriodEnd: false,
            },
            update: {
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
              stripePriceId: firstItem?.price.id,
              plan: tier,
              status: mapSubscriptionStatus(stripeSubscription.status),
              currentPeriodStart: firstItem ? new Date(firstItem.current_period_start * 1000) : new Date(),
              currentPeriodEnd: firstItem ? new Date(firstItem.current_period_end * 1000) : new Date(),
              cancelAtPeriodEnd: false,
            },
          });
        }

        if (session.metadata?.type === "boost") {
          const modelProfileId = session.metadata?.modelProfileId;
          if (modelProfileId) {
            const now = new Date();
            const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

            await db.boost.create({
              data: {
                modelProfileId,
                stripePaymentId: session.payment_intent as string,
                startsAt: now,
                endsAt,
              },
            });

            const user = await db.user.findUnique({ where: { id: userId }, select: { locale: true } });
            const isEn = user?.locale === "en";

            await db.notification.create({
              data: {
                userId,
                type: "BOOST_ACTIVATED",
                title: isEn ? "Boost activated!" : "Boost attivato!",
                body: isEn ? "Your profile will be featured for 7 days." : "Il tuo profilo sarà in evidenza per 7 giorni.",
                link: "/model/profile",
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (dbSubscription) {
          const status = mapSubscriptionStatus(subscription.status);
          const firstItem = subscription.items.data[0];
          // Reflect price changes (upgrade/downgrade between monthly/annual/tier).
          const newTier = tierFromPriceId(firstItem?.price.id);
          await db.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status,
              stripePriceId: firstItem?.price.id,
              ...(newTier ? { plan: newTier } : {}),
              currentPeriodStart: firstItem ? new Date(firstItem.current_period_start * 1000) : undefined,
              currentPeriodEnd: firstItem ? new Date(firstItem.current_period_end * 1000) : undefined,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            status: "CANCELED",
            stripeSubscriptionId: null,
            stripePriceId: null,
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Roll back idempotency record so Stripe retry can re-process the event.
    await db.stripeWebhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "ACTIVE";
  }
}
