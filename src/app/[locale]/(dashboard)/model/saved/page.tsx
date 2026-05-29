import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingBookmarkButton } from "@/components/shared/listing-bookmark-button";
import {
  getSavedListings,
  type SavedListingItem,
} from "@/server/queries/saved-listings";
import { JOB_TYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  DollarSign,
  Megaphone,
  Briefcase,
  Tag,
  Bookmark,
} from "lucide-react";

export default async function ModelSavedPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.model.saved");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const items = await getSavedListings(session.user.id);
  const castings = items.filter(
    (i): i is Extract<SavedListingItem, { kind: "casting" }> =>
      i.kind === "casting"
  );
  const jobs = items.filter(
    (i): i is Extract<SavedListingItem, { kind: "job" }> => i.kind === "job"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <p className="text-sm text-[var(--ink-3)] mt-1">{t("description")}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
        />
      ) : (
        <div className="space-y-10">
          {castings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--rule)] pb-2">
                <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--ink-2)]">
                  {t("castingsLabel")}
                </h2>
                <span className="text-xs text-[var(--ink-3)] tabular-nums">
                  {castings.length}
                </span>
              </div>
              <div className="grid gap-4">
                {castings.map((c) => (
                  <Link
                    key={c.savedId}
                    href={`/${locale}/model/castings/${c.id}`}
                  >
                    <Card className="hover:border-[var(--accent)]/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                <Megaphone className="h-2.5 w-2.5 mr-0.5" />
                                {t("castingTag")}
                              </Badge>
                              <h3 className="font-medium">{c.title}</h3>
                              {c.hasApplied && (
                                <Badge
                                  variant="success"
                                  className="text-[10px]"
                                >
                                  {t("applied")}
                                </Badge>
                              )}
                              {c.isPaid && (
                                <Badge variant="gold" className="text-[10px]">
                                  <DollarSign className="h-3 w-3 mr-0.5" />
                                  {t("paid")}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-[var(--ink-3)] mt-1 line-clamp-2">
                              {c.description}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ink-3)] flex-wrap">
                              <span className="font-medium text-[var(--ink)]">
                                {c.scoutName ?? "Scout"}
                              </span>
                              {c.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {c.city}
                                </span>
                              )}
                              {c.castingDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(c.castingDate, lang)}
                                </span>
                              )}
                              {c.deadline && (
                                <span className="flex items-center gap-1">
                                  ⏰ {t("deadline")}{" "}
                                  {formatDate(c.deadline, lang)}
                                </span>
                              )}
                              {c.compensation && <span>{c.compensation}</span>}
                            </div>
                          </div>
                          <ListingBookmarkButton
                            kind="casting"
                            listingId={c.id}
                            locale={locale}
                            isAuthenticated
                            initialSaved
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {jobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--rule)] pb-2">
                <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--ink-2)]">
                  {t("jobsLabel")}
                </h2>
                <span className="text-xs text-[var(--ink-3)] tabular-nums">
                  {jobs.length}
                </span>
              </div>
              <div className="grid gap-4">
                {jobs.map((j) => (
                  <Link
                    key={j.savedId}
                    href={`/${locale}/model/lavori/${j.id}`}
                  >
                    <Card className="hover:border-[var(--accent)]/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                                {t("jobTag")}
                              </Badge>
                              <h3 className="font-medium">{j.title}</h3>
                              <Badge variant="outline" className="text-[10px]">
                                <Tag className="h-2.5 w-2.5 mr-0.5" />
                                {JOB_TYPE_LABELS[
                                  j.jobType as keyof typeof JOB_TYPE_LABELS
                                ]?.[lang] ?? j.jobType}
                              </Badge>
                              {j.hasApplied && (
                                <Badge
                                  variant="success"
                                  className="text-[10px]"
                                >
                                  {t("applied")}
                                </Badge>
                              )}
                              {j.isPaid && (
                                <Badge variant="gold" className="text-[10px]">
                                  <DollarSign className="h-3 w-3 mr-0.5" />
                                  {t("paid")}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-[var(--ink-3)] mt-1 line-clamp-2">
                              {j.description}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ink-3)] flex-wrap">
                              <span className="font-medium text-[var(--ink)]">
                                {j.brand ?? j.scoutName ?? "Scout"}
                              </span>
                              {j.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {j.city}
                                </span>
                              )}
                              {j.jobDates && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {j.jobDates}
                                </span>
                              )}
                              {j.deadline && (
                                <span className="flex items-center gap-1">
                                  ⏰ {t("deadline")}{" "}
                                  {formatDate(j.deadline, lang)}
                                </span>
                              )}
                              {j.compensation && <span>{j.compensation}</span>}
                            </div>
                          </div>
                          <ListingBookmarkButton
                            kind="job"
                            listingId={j.id}
                            locale={locale}
                            isAuthenticated
                            initialSaved
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
