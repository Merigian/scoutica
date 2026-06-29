import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BoostCard } from "@/components/model/boost-card";
import { CheckCircle } from "lucide-react";

export default async function ModelBillingPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.billing");

  if (!session?.user?.id || session.user.role !== "MODEL") redirect("/login");

  const activeBoosts = await db.boost.findMany({
    where: { modelProfile: { userId: session.user.id }, endsAt: { gt: new Date() } },
    select: { endsAt: true },
    orderBy: { endsAt: "desc" },
  });

  const features = t.raw("features") as string[];

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="max-w-3xl space-y-14">
        {/* Current plan */}
        <section>
          <div className="hairline-b pb-4 mb-8 flex items-baseline justify-between gap-4">
            <p className="text-eyebrow">{t("currentPlan")}</p>
            <span className="text-meta">Free</span>
          </div>
          <div className="hairline bg-[var(--bg-elevated)] p-6 lg:p-8">
            <p className="text-eyebrow text-[var(--ink-3)]">Scoutica</p>
            <h2 className="mt-2 font-[var(--font-display)] font-light text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
              {t("planName")}
            </h2>
            <p className="mt-4 text-body text-[var(--ink-2)] max-w-[46ch]">
              {t("planTagline")}
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-body text-[var(--ink-2)]">
                  <CheckCircle className="h-4 w-4 text-[var(--ink)] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Boost / visibility */}
        <section>
          <div className="hairline-b pb-4 mb-8">
            <p className="text-eyebrow">{t("visibility")}</p>
            <h2 className="mt-1 text-h2">{t("boostHeading")}</h2>
          </div>
          <BoostCard activeBoosts={activeBoosts} locale={locale} />
        </section>
      </div>
    </PageContainer>
  );
}
