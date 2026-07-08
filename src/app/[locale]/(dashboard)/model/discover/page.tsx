import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { searchModelProfiles } from "@/server/queries/model-profiles";
import { searchFiltersSchema } from "@/lib/validations/search";
import { ModelCard } from "@/components/discover/model-card";
import { DiscoverFilters } from "@/components/discover/discover-filters";
import { DiscoverGrid, GridDensitySelector } from "@/components/discover/grid-density-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Search } from "lucide-react";

export default async function ModelDiscoverPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("pages.model.discover");
  const session = await auth();
  const resolvedParams = (await searchParams) ?? {};

  if (!session?.user || session.user.role !== "MODEL") {
    redirect(`/${locale}/login`);
  }

  const cols = Math.min(5, Math.max(1, Number(resolvedParams.cols) || 4));

  // Parse city/category/etc. filters from the URL (same schema as scout discover).
  const parsed = searchFiltersSchema.safeParse(resolvedParams);
  const filters = parsed.success
    ? { ...parsed.data, page: 1, pageSize: 50 }
    : { page: 1, pageSize: 50, sortBy: "relevance" as const };

  // Fetch published model profiles matching the filters
  const results = await searchModelProfiles(filters);

  // Don't show the model their own profile in the inspiration grid.
  const ownProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const profiles = results.profiles.filter((p) => p.id !== ownProfile?.id);
  const total = results.total - (results.profiles.length - profiles.length);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6">
        {/* Filters */}
        <Suspense fallback={<div className="h-12 animate-pulse bg-[var(--bg-soft)] lg:h-32" />}>
          <DiscoverFilters locale={locale} advancedFilters={false} />
        </Suspense>

        {/* Results Grid */}
        {profiles.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--ink-3)]">
                {total} {total === 1 ? t("profile") : t("profiles")}
              </p>
              <div className="hidden sm:block">
                <GridDensitySelector cols={cols} />
              </div>
            </div>
            <DiscoverGrid cols={cols}>
              {profiles.map((profile) => (
                <ModelCard
                  key={profile.id}
                  profile={profile}
                  locale={locale}
                  isAuthenticated
                  showSave={false}
                />
              ))}
            </DiscoverGrid>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title={t("noProfiles")}
            description={t("noProfilesDesc")}
          />
        )}
      </div>
    </PageContainer>
  );
}
