import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchModelProfiles } from "@/server/queries/model-profiles";
import { searchFiltersSchema } from "@/lib/validations/search";
import { PLAN_LIMITS } from "@/config/plans";
import { SearchFiltersPanel } from "@/components/discover/search-filters";
import { ModelCard } from "@/components/discover/model-card";
import { Pagination } from "@/components/discover/pagination";
import { DiscoverGrid, GridDensitySelector } from "@/components/discover/grid-density-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { Search } from "lucide-react";
import type { PlanTier, ContactRequestStatus } from "@prisma/client";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.discover");
  const session = await auth();
  const resolvedParams = await searchParams;

  // Validate and parse search params
  const parsed = searchFiltersSchema.safeParse(resolvedParams);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 24, sortBy: "relevance" as const };

  // Get scout plan to determine available filters
  let planTier: PlanTier = "FREE";
  if (session?.user?.id) {
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    if (subscription) planTier = subscription.plan;
  }

  const advancedFilters = PLAN_LIMITS[planTier].advancedFilters;
  const isVerifiedScout = session?.user?.role === "SCOUT";

  const cols = Math.min(6, Math.max(2, Number(resolvedParams.cols) || 4));

  // Fetch results
  const results = await searchModelProfiles(filters, isVerifiedScout ? session.user.id : undefined);

  const profileIds = results.profiles.map((p) => p.id);
  const viewerUserId = session?.user?.id;

  const [savedRows, scoutProfile] = await Promise.all([
    viewerUserId && profileIds.length > 0
      ? db.profileLike.findMany({
          where: { userId: viewerUserId, modelProfileId: { in: profileIds } },
          select: { modelProfileId: true },
        })
      : Promise.resolve([]),
    viewerUserId
      ? db.scoutProfile.findUnique({
          where: { userId: viewerUserId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const savedSet = new Set(savedRows.map((r) => r.modelProfileId));

  const contactRows =
    scoutProfile && profileIds.length > 0
      ? await db.contactRequest.findMany({
          where: {
            scoutProfileId: scoutProfile.id,
            modelProfileId: { in: profileIds },
          },
          select: {
            modelProfileId: true,
            status: true,
            conversationId: true,
          },
        })
      : [];

  const contactByModelId = new Map<
    string,
    { status: ContactRequestStatus; conversationId: string | null }
  >();
  for (const row of contactRows) {
    contactByModelId.set(row.modelProfileId, {
      status: row.status,
      conversationId: row.conversationId,
    });
  }

  const canContact = !!scoutProfile;
  const isAuthenticated = !!viewerUserId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-[var(--bg-soft)] " />}>
        <SearchFiltersPanel locale={locale} advancedFilters={advancedFilters} />
      </Suspense>

      {/* Sort bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-3)]">
          {results.total > 0
            ? `${results.total} ${results.total === 1 ? t("result") : t("results")}`
            : ""}
        </p>
        <GridDensitySelector cols={cols} />
      </div>

      {/* Results Grid */}
      {results.profiles.length > 0 ? (
        <>
          <DiscoverGrid cols={cols}>
            {results.profiles.map((profile) => {
              const contact = contactByModelId.get(profile.id) ?? null;
              return (
                <ModelCard
                  key={profile.id}
                  profile={profile}
                  locale={locale}
                  isAuthenticated={isAuthenticated}
                  initialSaved={savedSet.has(profile.id)}
                  canContact={canContact}
                  contactStatus={contact?.status ?? null}
                  conversationId={contact?.conversationId ?? null}
                />
              );
            })}
          </DiscoverGrid>

          <Pagination
            page={results.page}
            totalPages={results.totalPages}
            total={results.total}
            locale={locale}
          />
        </>
      ) : (
        <EmptyState
          icon={Search}
          title={t("noResults")}
          description={t("noResultsDesc")}
        />
      )}
    </div>
  );
}
