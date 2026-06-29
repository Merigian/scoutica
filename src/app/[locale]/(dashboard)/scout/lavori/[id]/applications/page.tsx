import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { APPLICATION_STATUS_LABELS, JOB_TYPE_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { JobApplicationActions } from "@/components/jobs/job-application-actions";
import { Users } from "lucide-react";
import { BackLink } from "@/components/shared/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.jobApplications");
  const { id: jobId } = await params;

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      scoutProfile: { select: { userId: true } },
      applications: {
        include: {
          modelProfile: {
            include: {
              user: { select: { name: true, image: true } },
              portfolioImages: {
                where: { isCover: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job || job.scoutProfile.userId !== session.user.id) {
    redirect(`/${locale}/scout/lavori`);
  }

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "destructive",
    WITHDRAWN: "default",
  };

  return (
    <PageContainer>
      <BackLink href="/scout/lavori" label={t("backToJobs")} />

      <PageHeader title={job.title} />

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">
              {JOB_TYPE_LABELS[job.jobType as keyof typeof JOB_TYPE_LABELS]?.[lang] ?? job.jobType}
            </Badge>
          </div>
          <p className="text-[var(--ink-3)] text-sm">
            {job.applications.length} {t("applicationsReceived")}
          </p>
        </div>

        {job.applications.length > 0 ? (
        <div className="space-y-3">
          {job.applications.map((app) => {
            const coverImage = app.modelProfile.portfolioImages[0]?.url;
            const displayName = app.modelProfile.fullName ?? app.modelProfile.user.name ?? "Model";

            return (
              <Card key={app.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <Avatar
                    name={displayName}
                    src={coverImage ?? app.modelProfile.user.image ?? undefined}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{displayName}</span>
                      <Badge
                        variant={statusVariants[app.status] ?? "default"}
                        className="text-[10px]"
                      >
                        {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS]?.[lang] ?? app.status}
                      </Badge>
                      <span className="text-xs text-[var(--ink-3)] ml-auto">
                        {formatRelativeTime(app.createdAt)}
                      </span>
                    </div>

                    {app.introMessage && (
                      <p className="text-sm text-[var(--ink-3)] mt-1">{app.introMessage}</p>
                    )}

                    {app.modelProfile.height && (
                      <div className="flex gap-2 mt-2 text-xs text-[var(--ink-3)]">
                        <span>{app.modelProfile.height} cm</span>
                        {app.modelProfile.city && <span>• {app.modelProfile.city}</span>}
                      </div>
                    )}

                    {app.status === "PENDING" && (
                      <JobApplicationActions applicationId={app.id} locale={locale} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={t("noApplications")}
          description={t("noApplicationsDesc")}
        />
      )}
      </div>
    </PageContainer>
  );
}
