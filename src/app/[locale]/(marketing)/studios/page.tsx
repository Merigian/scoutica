import { getLocale, getTranslations } from "next-intl/server";
import { searchStudios } from "@/server/queries/studios";
import { StudioFilters } from "@/components/studios/studio-filters";
import { StudiosView } from "@/components/studios/studios-view";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Building2 } from "lucide-react";
import { STUDIO_TYPE_LABELS } from "@/config/enums";
import { ALL_REGION_NAMES } from "@/config/regions";
import type { StudioType } from "@prisma/client";

function buildPaginationHref(
  params: Record<string, string | string[] | undefined>,
  page: number
): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", String(params.q));
  if (params.region) qs.set("region", String(params.region));
  if (params.type) qs.set("type", String(params.type));
  if (params.city) qs.set("city", String(params.city));
  qs.set("page", String(page));
  return `/studios?${qs.toString()}`;
}

export default async function StudiosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.marketing.studios");
  const resolvedParams = await searchParams;

  const filters = {
    page: resolvedParams.page ? parseInt(resolvedParams.page as string) : 1,
    pageSize: 12,
    city: resolvedParams.city as string | undefined,
    region: resolvedParams.region as string | undefined,
    studioType: resolvedParams.type as StudioType | undefined,
    query: resolvedParams.q as string | undefined,
  };

  const results = await searchStudios(filters);

  const studioTypes = Object.entries(STUDIO_TYPE_LABELS).map(([value, label]) => ({
    value,
    label: label[lang],
  }));

  return (
    <div>
      <header className="hairline-b">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20 lg:py-28">
          <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
            <h1 className="lg:col-span-8 text-display max-w-4xl">{t("title")}</h1>
            <p className="lg:col-span-4 text-lead">{t("description")}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12">
        <StudioFilters
          lang={lang}
          studioTypes={studioTypes}
          regions={ALL_REGION_NAMES}
          initialQuery={(resolvedParams.q as string) || ""}
          initialRegion={(resolvedParams.region as string) || ""}
          initialType={(resolvedParams.type as string) || ""}
        />

        {results.studios.length > 0 ? (
          <>
            <StudiosView
              studios={results.studios}
              locale={locale}
              totalLabel={`${results.total} ${results.total === 1 ? t("spaceFound") : t("spacesFound")}`}
            />

            {results.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {results.page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildPaginationHref(resolvedParams, results.page - 1) as never}>
                      {t("previous")}
                    </Link>
                  </Button>
                )}
                <span className="text-eyebrow text-[var(--ink-3)] px-4 tabular-nums">
                  {String(results.page).padStart(2, "0")} / {String(results.totalPages).padStart(2, "0")}
                </span>
                {results.page < results.totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildPaginationHref(resolvedParams, results.page + 1) as never}>
                      {t("next")}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-20">
            <EmptyState
              icon={Building2}
              title={t("noStudios")}
              description={t("noStudiosDesc")}
            />
          </div>
        )}

        <div className="mt-24 hairline-t pt-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="text-eyebrow">{t("ownersEyebrow")}</p>
              <h2 className="mt-5 text-h2 max-w-xl">{t("ctaTitle")}</h2>
              <p className="mt-5 max-w-xl text-body text-[var(--ink-2)]">
                {t("ctaDesc")}
              </p>
            </div>
            <Button variant="accent" size="lg" asChild>
              <Link href="/register/studio">{t("registerStudio")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
