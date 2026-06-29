import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, MapPin, Users, Briefcase, Tag } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function ScoutLavoriPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.lavori");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!scoutProfile) redirect(`/${locale}/scout/profile`);

  const jobs = await db.job.findMany({
    where: { scoutProfileId: scoutProfile.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    DRAFT: "default",
    PUBLISHED: "success",
    CLOSED: "warning",
    ARCHIVED: "destructive",
  };

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Link href={`/${locale}/scout/lavori/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("newJob")}
            </Button>
          </Link>
        }
      />

      {jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/${locale}/scout/lavori/${job.id}/applications`}>
              <Card className="hover:border-[var(--accent)]/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm truncate">{job.title}</h3>
                        <Badge variant={statusVariants[job.status] ?? "default"} className="text-[10px]">
                          {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS]?.[lang] ?? job.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          <Tag className="h-2.5 w-2.5 mr-0.5" />
                          {JOB_TYPE_LABELS[job.jobType as keyof typeof JOB_TYPE_LABELS]?.[lang] ?? job.jobType}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--ink-3)] flex-wrap">
                        {job.brand && (
                          <span className="font-medium text-[var(--ink)]">{job.brand}</span>
                        )}
                        {job.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.city}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t("deadline")} {formatDate(job.deadline, locale)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job._count.applications} {t("applications")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title={t("noJobs")}
          description={t("noJobsDesc")}
          actionLabel={t("createJob")}
          actionHref={`/${locale}/scout/lavori/new`}
        />
      )}
    </PageContainer>
  );
}
