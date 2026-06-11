import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingBookmarkButton } from "@/components/shared/listing-bookmark-button";
import { getSavedJobIds } from "@/server/queries/saved-listings";
import { JOB_TYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, DollarSign, Users, Briefcase, Tag } from "lucide-react";

export default async function ModelLavoriPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.model.lavori");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const [appliedJobIds, savedJobIds] = await Promise.all([
    modelProfile
      ? db.jobApplication
          .findMany({
            where: { modelProfileId: modelProfile.id },
            select: { jobId: true },
          })
          .then((rows) => rows.map((a) => a.jobId))
      : Promise.resolve([] as string[]),
    getSavedJobIds(session.user.id),
  ]);

  const jobs = await db.job.findMany({
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

      {jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job.id);
            return (
              <Link key={job.id} href={`/${locale}/model/lavori/${job.id}`}>
                <Card className="hover:border-[var(--accent)]/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{job.title}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            <Tag className="h-2.5 w-2.5 mr-0.5" />
                            {JOB_TYPE_LABELS[job.jobType as keyof typeof JOB_TYPE_LABELS]?.[lang] ?? job.jobType}
                          </Badge>
                          {hasApplied && (
                            <Badge variant="success" className="text-[10px]">
                              {t("applied")}
                            </Badge>
                          )}
                          {job.isPaid && (
                            <Badge variant="default" className="text-[10px]">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              {t("paid")}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-[var(--ink-3)] mt-1 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ink-3)] flex-wrap">
                          <span className="font-medium text-[var(--ink)]">
                            {job.brand ?? job.scoutProfile.businessName ?? "Scout"}
                          </span>
                          {job.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.city}
                            </span>
                          )}
                          {job.jobDates && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {job.jobDates}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              ⏰ {t("deadline")} {formatDate(job.deadline, lang)}
                            </span>
                          )}
                          {job.compensation && (
                            <span>{job.compensation}</span>
                          )}
                        </div>
                      </div>
                      <ListingBookmarkButton
                        kind="job"
                        listingId={job.id}
                        locale={locale}
                        isAuthenticated
                        initialSaved={savedJobIds.has(job.id)}
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
          icon={Briefcase}
          title={t("noJobs")}
          description={t("noJobsDesc")}
        />
      )}
    </div>
  );
}
