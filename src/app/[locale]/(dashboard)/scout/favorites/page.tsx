import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFavoriteProfiles } from "@/server/queries/model-profiles";
import { ModelCard } from "@/components/discover/model-card";
import { DiscoverGrid, GridDensitySelector } from "@/components/discover/grid-density-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { Bookmark } from "lucide-react";
import type { ContactRequestStatus } from "@prisma/client";

export default async function ScoutFavoritesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.favorites");
  const session = await auth();
  const resolvedParams = (await searchParams) ?? {};

  if (!session?.user || session.user.role !== "SCOUT") {
    redirect(`/${locale}/login`);
  }

  const cols = Math.min(5, Math.max(1, Number(resolvedParams.cols) || 4));
  const profiles = await getFavoriteProfiles(session.user.id);

  const profileIds = profiles.map((p) => p.id);
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{t("title")}</h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">{t("description")}</p>
      </div>

      {profiles.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--ink-3)]">
              {profiles.length} {profiles.length === 1 ? t("profile") : t("profiles")}
            </p>
            <GridDensitySelector cols={cols} />
          </div>
          <DiscoverGrid cols={cols}>
            {profiles.map((profile) => {
              const contact = contactByModelId.get(profile.id) ?? null;
              return (
                <ModelCard
                  key={profile.id}
                  profile={profile}
                  locale={locale}
                  isAuthenticated
                  initialSaved
                  canContact={canContact}
                  contactStatus={contact?.status ?? null}
                  conversationId={contact?.conversationId ?? null}
                />
              );
            })}
          </DiscoverGrid>
        </>
      ) : (
        <EmptyState
          icon={Bookmark}
          title={t("empty")}
          description={t("emptyDesc")}
        />
      )}
    </div>
  );
}
