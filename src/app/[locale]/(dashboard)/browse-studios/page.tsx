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
  qs.set("page", String(page));
  return `/browse-studios?${qs.toString()}`;
}

export default async function BrowseStudiosPage({
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
    <div className="space-y-6">
      <div>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">{t("description")}</p>
      </div>

      <StudioFilters
        lang={lang}
        studioTypes={studioTypes}
        regions={ALL_REGION_NAMES}
        basePath="/browse-studios"
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
            <div className="flex items-center justify-center gap-2 mt-6">
              {results.page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPaginationHref(resolvedParams, results.page - 1) as never}>
                    {t("previous")}
                  </Link>
                </Button>
              )}
              <span className="text-sm text-[var(--ink-3)] px-4">
                {results.page} / {results.totalPages}
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
        <EmptyState
          icon={Building2}
          title={t("noStudios")}
          description={t("noStudiosDesc")}
        />
      )}
    </div>
  );
}
