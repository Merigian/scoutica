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
} from "lucide-react";
import Link from "next/link";

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
  ]);

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
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 space-y-3">
        <p className="text-eyebrow">Admin</p>
        <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
          {t("title")}
        </h1>
        <p className="text-lead max-w-[58ch]">{t("description")}</p>
      </header>

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
              <p className="mt-6 font-[var(--font-display)] font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
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
