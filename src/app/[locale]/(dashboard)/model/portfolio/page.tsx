import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PortfolioGrid } from "@/components/model/portfolio-grid";
import { PLAN_LIMITS } from "@/config/plans";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import type { PlanTier } from "@prisma/client";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MODEL") redirect("/login");

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      portfolioImages: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });
  const planTier: PlanTier = subscription?.plan ?? "FREE";
  const maxPhotos = PLAN_LIMITS[planTier].maxPhotos;
  const isModelPro = planTier === "MODEL_PRO";
  const t = await getTranslations("pages.model.portfolio");

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* Header */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14">
        <p className="text-eyebrow">01 — Portfolio</p>
        <h1 className="mt-3 font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-lead max-w-[58ch]">
          {t("description", { maxPhotos })}
        </p>
      </header>

      {/* Upgrade banner */}
      {!isModelPro && (
        <div className="hairline-t hairline-b py-6 mb-12 lg:mb-16">
          <Link
            href={"/model/settings/billing" as never}
            className="group flex items-center justify-between gap-6"
          >
            <div className="flex flex-col gap-1">
              <p className="text-eyebrow">Upgrade</p>
              <p className="text-h3 text-[var(--ink)]">{t("upgradeTitle")}</p>
              <p className="text-meta">{t("upgradeDesc")}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-[15px] text-[var(--ink)] whitespace-nowrap">
              {t("upgrade")}
              <ArrowUpRight className="h-4 w-4 group-arrow" />
            </span>
          </Link>
        </div>
      )}

      {/* Grid */}
      <section>
        <div className="hairline-b pb-4 mb-8 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-eyebrow">02 — Cast</p>
            <h2 className="mt-1 text-h2">
              {t("yourImages", {
                count: profile.portfolioImages.length,
                max: maxPhotos,
              })}
            </h2>
          </div>
          {isModelPro && (
            <span className="text-eyebrow italic !text-[var(--ink)]">Pro</span>
          )}
        </div>
        <PortfolioGrid
          images={profile.portfolioImages}
          maxPhotos={maxPhotos}
        />
      </section>
    </div>
  );
}
