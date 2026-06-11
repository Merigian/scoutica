import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingBookmarkButton } from "@/components/shared/listing-bookmark-button";
import { getSavedCastingIds } from "@/server/queries/saved-listings";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, DollarSign, Users, Megaphone } from "lucide-react";

export default async function ModelCastingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.model.castings");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  // Get model's existing applications to mark which castings they've applied to
  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const [appliedCastingIds, savedCastingIds] = await Promise.all([
    modelProfile
      ? db.castingApplication
          .findMany({
            where: { modelProfileId: modelProfile.id },
            select: { castingId: true },
          })
          .then((rows) => rows.map((a) => a.castingId))
      : Promise.resolve([] as string[]),
    getSavedCastingIds(session.user.id),
  ]);

  // Fetch published castings
  const castings = await db.casting.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    },
    include: {
      scoutProfile: {
        select: {
          businessName: true,
          subtype: true,
          verificationStatus: true,
        },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {castings.length > 0 ? (
        <div className="grid gap-4">
          {castings.map((casting) => {
            const hasApplied = appliedCastingIds.includes(casting.id);
            return (
              <Link key={casting.id} href={`/${locale}/model/castings/${casting.id}`}>
                <Card className="hover:border-[var(--accent)]/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{casting.title}</h3>
                          {hasApplied && (
                            <Badge variant="success" className="text-[10px]">
                              {t("applied")}
                            </Badge>
                          )}
                          {casting.isPaid && (
                            <Badge variant="default" className="text-[10px]">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              {t("paid")}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-[var(--ink-3)] mt-1 line-clamp-2">
                          {casting.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ink-3)] flex-wrap">
                          <span className="font-medium text-[var(--ink)]">
                            {casting.scoutProfile.businessName ?? "Scout"}
                          </span>
                          {casting.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {casting.city}
                            </span>
                          )}
                          {casting.castingDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(casting.castingDate, lang)}
                            </span>
                          )}
                          {casting.deadline && (
                            <span className="flex items-center gap-1">
                              ⏰ {t("deadline")} {formatDate(casting.deadline, lang)}
                            </span>
                          )}
                          {casting.compensation && (
                            <span>{casting.compensation}</span>
                          )}
                        </div>
                      </div>
                      <ListingBookmarkButton
                        kind="casting"
                        listingId={casting.id}
                        locale={locale}
                        isAuthenticated
                        initialSaved={savedCastingIds.has(casting.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title={t("noCastings")}
          description={t("noCastingsDesc")}
        />
      )}
    </div>
  );
}
