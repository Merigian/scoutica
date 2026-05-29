import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { searchModelProfiles } from "@/server/queries/model-profiles";
import { ModelCard } from "@/components/discover/model-card";
import { DiscoverGrid, GridDensitySelector } from "@/components/discover/grid-density-selector";
import { EmptyState } from "@/components/shared/empty-state";
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

  // Fetch all published model profiles
  const results = await searchModelProfiles({
    page: 1,
    pageSize: 50,
    sortBy: "relevance",
  });

  const profileIds = results.profiles.map((p) => p.id);
  const savedRows =
    profileIds.length > 0
      ? await db.profileLike.findMany({
          where: { userId: session.user.id, modelProfileId: { in: profileIds } },
          select: { modelProfileId: true },
        })
      : [];
  const savedSet = new Set(savedRows.map((r) => r.modelProfileId));

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

      {/* Results Grid */}
      {results.profiles.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--ink-3)]">
              {results.total} {results.total === 1 ? t("profile") : t("profiles")}
            </p>
            <GridDensitySelector cols={cols} />
          </div>
          <DiscoverGrid cols={cols}>
            {results.profiles.map((profile) => (
              <ModelCard
                key={profile.id}
                profile={profile}
                locale={locale}
                isAuthenticated
                initialSaved={savedSet.has(profile.id)}
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
  );
}
