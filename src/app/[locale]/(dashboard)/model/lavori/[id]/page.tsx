import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobApplyButton } from "@/components/jobs/job-apply-button";
import { JOB_TYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, DollarSign, Users, CheckCircle, Briefcase, Tag, Building } from "lucide-react";
import { BackLink } from "@/components/shared/back-link";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.jobDetail");
  const { id: jobId } = await params;

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const job = await db.job.findUnique({
    where: { id: jobId, status: "PUBLISHED" },
    include: {
      scoutProfile: {
        select: {
          businessName: true,
          subtype: true,
          verificationStatus: true,
          city: true,
        },
      },
    },
  });

  if (!job) redirect(`/${locale}/model/lavori`);

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isPublished: true },
  });

  let hasApplied = false;
  if (modelProfile) {
    const existingApp = await db.jobApplication.findUnique({
      where: {
        jobId_modelProfileId: {
          jobId,
          modelProfileId: modelProfile.id,
        },
      },
    });
    hasApplied = !!existingApp;
  }

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/model/lavori" label={t("backToJobs")} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-0.5" />
            {JOB_TYPE_LABELS[job.jobType as keyof typeof JOB_TYPE_LABELS]?.[locale === "en" ? "en" : "it"] ?? job.jobType}
          </Badge>
          {job.isPaid && (
            <Badge variant="default" className="text-xs">
              <DollarSign className="h-3 w-3 mr-0.5" />
              {t("paid")}
            </Badge>
          )}
          {hasApplied && (
            <Badge variant="success" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-0.5" />
              {t("applied")}
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              {t("expired")}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{job.title}</h1>
        <p className="text-sm text-[var(--ink-3)] mt-1">
          {t("postedBy")}{" "}
          <span className="font-medium text-[var(--ink)]">
            {job.scoutProfile.businessName ?? "Scout"}
          </span>
          {job.scoutProfile.verificationStatus === "APPROVED" && (
            <VerifiedBadge
              size={15}
              variant="static"
              className="ml-1 inline-block align-text-bottom"
              aria-label="Verified"
            />
          )}
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {job.brand && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Building className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("brand")}</p>
                <p className="text-sm font-medium">{job.brand}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {job.city && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("location")}</p>
                <p className="text-sm font-medium">{job.city}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {job.jobDates && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("dates")}</p>
                <p className="text-sm font-medium">{job.jobDates}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {job.compensation && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("compensation")}</p>
                <p className="text-sm font-medium">{job.compensation}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {job.spotsNeeded && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("spots")}</p>
                <p className="text-sm font-medium">{job.spotsNeeded}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {job.location && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("venue")}</p>
                <p className="text-sm font-medium">{job.location}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{job.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.modelRequirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("modelRequirements")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{job.modelRequirements}</p>
          </CardContent>
        </Card>
      )}

      {/* Deadline */}
      {job.deadline && (
        <div className="text-sm text-[var(--ink-3)]">
          {t("applicationDeadline")}{" "}
          <span className="font-medium text-[var(--ink)]">{formatDate(job.deadline, locale)}</span>
        </div>
      )}

      {/* Apply button */}
      {!hasApplied && !isExpired && modelProfile?.isPublished && (
        <>
          <Separator />
          <JobApplyButton jobId={jobId} locale={locale} />
        </>
      )}

      {!modelProfile?.isPublished && (
        <p className="text-sm text-[var(--accent)]">
          {t("publishProfileFirst")}
        </p>
      )}
    </div>
  );
}
