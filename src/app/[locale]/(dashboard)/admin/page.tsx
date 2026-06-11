import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Users,
  Shield,
  Megaphone,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";

export default async function AdminDashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.admin.dashboard");

  if (!session?.user?.id || session.user.role !== "ADMIN")
    redirect(`/${locale}/login`);

  const [
    totalUsers,
    totalModels,
    totalScouts,
    pendingVerifications,
    pendingReports,
    publishedCastings,
    activeSubscriptions,
    paidSubsRaw,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "MODEL" } }),
    db.user.count({ where: { role: "SCOUT" } }),
    db.scoutProfile.count({
      where: {
        verificationStatus: { in: ["PENDING", "VERIFICATION_SUBMITTED"] },
      },
    }),
    db.report.count({ where: { status: "PENDING" } }),
    db.casting.count({ where: { status: "PUBLISHED" } }),
    db.subscription.count({
      where: { plan: { not: "FREE" }, status: "ACTIVE" },
    }),
    db.subscription.findMany({
      where: { plan: { not: "FREE" }, status: { in: ["ACTIVE", "TRIALING"] } },
      select: { plan: true, status: true, stripePriceId: true },
    }),
  ]);

  // Look up plan price + interval by Stripe priceId.
  const priceMap = new Map<string, { price: number; interval: "month" | "year" | null }>();
  for (const p of Object.values(PLANS)) {
    if (p.priceId) {
      priceMap.set(p.priceId, {
        price: p.price,
        interval: "interval" in p ? p.interval : null,
      });
    }
  }

  // MRR = sum of monthly equivalent for ACTIVE subscriptions only.
  let mrrCents = 0;
  let trialingCount = 0;
  const breakdown: Record<string, { count: number; trialing: number }> = {};

  for (const sub of paidSubsRaw) {
    const key = sub.plan;
    if (!breakdown[key]) breakdown[key] = { count: 0, trialing: 0 };
    if (sub.status === "TRIALING") {
      breakdown[key].trialing += 1;
      trialingCount += 1;
    } else {
      breakdown[key].count += 1;
      const p = sub.stripePriceId ? priceMap.get(sub.stripePriceId) : null;
      if (p) {
        const monthly = p.interval === "year" ? p.price / 12 : p.price;
        mrrCents += Math.round(monthly * 100);
      }
    }
  }

  const mrr = mrrCents / 100;
  const arr = mrr * 12;

  const planLabels: Record<string, string> = {
    SCOUT_PRO: "Scout Pro",
    AGENCY: "Agency",
    STUDIO: "Studio Pro",
    MODEL_PRO: "Model Pro (legacy)",
  };

  const stats = [
    {
      label: t("totalUsers"),
      value: totalUsers,
      icon: Users,
      href: `/${locale}/admin/users`,
    },
    {
      label: t("models"),
      value: totalModels,
      icon: Users,
    },
    {
      label: t("scoutsAgencies"),
      value: totalScouts,
      icon: Users,
    },
    {
      label: t("pendingVerifications"),
      value: pendingVerifications,
      icon: Shield,
      href: `/${locale}/admin/verifications`,
      highlight: pendingVerifications > 0,
    },
    {
      label: t("reports"),
      value: pendingReports,
      icon: AlertTriangle,
      href: `/${locale}/admin/reports`,
      highlight: pendingReports > 0,
    },
    {
      label: t("activeCastings"),
      value: publishedCastings,
      icon: Megaphone,
    },
    {
      label: t("activeSubscriptions"),
      value: activeSubscriptions,
      icon: DollarSign,
      href: `/${locale}/admin/subscriptions`,
    },
  ];

  const currencyFmt = new Intl.NumberFormat(locale === "en" ? "en-US" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 space-y-3">
        <p className="text-eyebrow">Admin</p>
        <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
          {t("title")}
        </h1>
        <p className="text-lead max-w-[58ch]">{t("description")}</p>
      </header>

      {/* ─── Revenue / Subscription metrics ─── */}
      <section className="mb-12">
        <h2 className="text-eyebrow mb-4">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 hairline-t hairline-l">
          <div className="p-6 lg:p-8 hairline-b hairline-r">
            <div className="flex items-center justify-between text-[var(--ink-3)]">
              <span className="text-eyebrow">MRR</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
              {currencyFmt.format(mrr)}
            </p>
            <p className="mt-2 text-xs text-[var(--ink-3)]">
              ARR ≈ {currencyFmt.format(arr)}
            </p>
          </div>
          <div className="p-6 lg:p-8 hairline-b hairline-r">
            <div className="flex items-center justify-between text-[var(--ink-3)]">
              <span className="text-eyebrow">Paganti attivi</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
              {activeSubscriptions}
            </p>
          </div>
          <div className="p-6 lg:p-8 hairline-b hairline-r">
            <div className="flex items-center justify-between text-[var(--ink-3)]">
              <span className="text-eyebrow">In trial</span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
              {trialingCount}
            </p>
            <p className="mt-2 text-xs text-[var(--ink-3)]">
              Non ancora pagati
            </p>
          </div>
        </div>

        {Object.keys(breakdown).length > 0 && (
          <div className="mt-6">
            <h3 className="text-eyebrow mb-3">Per piano</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 hairline-t hairline-l">
              {Object.entries(breakdown).map(([plan, b]) => (
                <div key={plan} className="p-6 hairline-b hairline-r">
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {planLabels[plan] ?? plan}
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-display text-2xl tabular-nums">
                      {b.count}
                    </span>
                    <span className="text-xs text-[var(--ink-3)]">paganti</span>
                  </div>
                  {b.trialing > 0 && (
                    <p className="text-xs text-[var(--ink-3)] mt-1">
                      + {b.trialing} in trial
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <h2 className="text-eyebrow mb-4">Operations</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 hairline-t hairline-l">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          const inner = (
            <div
              className={`p-6 lg:p-8 hairline-b hairline-r h-full flex flex-col ${
                stat.highlight ? "bg-[var(--bg-soft)]/60" : ""
              }`}
            >
              <div className="flex items-center justify-between text-[var(--ink-3)]">
                <span className="text-eyebrow">{stat.label}</span>
                <StatIcon
                  className={`h-4 w-4 ${
                    stat.highlight ? "!text-[var(--danger)]" : ""
                  }`}
                />
              </div>
              <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
                {stat.value}
              </p>
            </div>
          );

          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="block transition-colors hover:bg-[var(--bg-soft)]/40"
            >
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
