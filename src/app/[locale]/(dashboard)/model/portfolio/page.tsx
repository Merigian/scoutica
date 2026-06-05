import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PortfolioGrid } from "@/components/model/portfolio-grid";
import { PLAN_LIMITS } from "@/config/plans";
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
  const t = await getTranslations("pages.model.portfolio");

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
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
        </div>
        <PortfolioGrid
          images={profile.portfolioImages}
          maxPhotos={maxPhotos}
        />
      </section>
    </div>
  );
}
