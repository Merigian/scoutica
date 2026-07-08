import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchModelProfiles } from "@/server/queries/model-profiles";
import { searchFiltersSchema } from "@/lib/validations/search";
import { PLAN_LIMITS } from "@/config/plans";
import { DiscoverFilters } from "@/components/discover/discover-filters";
import { SavedSearchBar } from "@/components/discover/saved-search-bar";
import { ModelCard } from "@/components/discover/model-card";
import { Pagination } from "@/components/discover/pagination";
import { DiscoverGrid, GridDensitySelector } from "@/components/discover/grid-density-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/page-header";
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

  // Pass userId only when scout is APPROVED — query layer re-verifies as defense in depth.
  let approvedScoutUserId: string | undefined;
  if (session?.user?.id && session.user.role === "SCOUT") {
    const scoutProfile = await db.scoutProfile.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true },
    });
    if (scoutProfile?.verificationStatus === "APPROVED") {
      approvedScoutUserId = session.user.id;
    }
  }

  const cols = Math.min(6, Math.max(2, Number(resolvedParams.cols) || 4));

  // Fetch results
  const results = await searchModelProfiles(filters, approvedScoutUserId);

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

  const savedSearchesEnabled = PLAN_LIMITS[planTier].savedSearches;
  const savedSearches = scoutProfile
    ? await db.savedSearch.findMany({
        where: { scoutProfileId: scoutProfile.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, filters: true },
      })
    : [];

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
      <PageHeader title={t("title")} description={t("description")} className="mb-0" />

      {/* Filters */}
      <Suspense fallback={<div className="h-12 animate-pulse bg-[var(--bg-soft)] lg:h-32" />}>
        <DiscoverFilters locale={locale} advancedFilters={advancedFilters} />
      </Suspense>

      {/* Saved searches */}
      {canContact && (
        <Suspense fallback={null}>
          <SavedSearchBar
            enabled={savedSearchesEnabled}
            savedSearches={savedSearches.map((s) => ({
              id: s.id,
              name: s.name,
              filters: (s.filters ?? {}) as Record<string, string>,
            }))}
          />
        </Suspense>
      )}

      {/* Sort bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-3)]">
          {results.total > 0
            ? `${results.total} ${results.total === 1 ? t("result") : t("results")}`
            : ""}
        </p>
        <div className="hidden sm:block">
          <GridDensitySelector cols={cols} />
        </div>
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
