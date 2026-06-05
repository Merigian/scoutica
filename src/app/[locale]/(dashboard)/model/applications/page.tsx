import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, Megaphone, Briefcase } from "lucide-react";
import Link from "next/link";
import { WithdrawButton } from "@/components/shared/withdraw-button";

const STATUS_CONFIG = {
  PENDING: { variant: "secondary" as const, icon: Clock },
  ACCEPTED: { variant: "success" as const, icon: CheckCircle },
  REJECTED: { variant: "destructive" as const, icon: XCircle },
  WITHDRAWN: { variant: "outline" as const, icon: ArrowLeft },
};

export default async function ModelApplicationsPage() {
  const locale = await getLocale();
  const t = await getTranslations("pages.model.applications");
  const session = await auth();

  if (!session?.user || session.user.role !== "MODEL") {
    redirect(`/${locale}/login`);
  }

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!modelProfile) redirect(`/${locale}/model/profile`);

  const [castingApplications, jobApplications] = await Promise.all([
    db.castingApplication.findMany({
      where: { modelProfileId: modelProfile.id },
      include: {
        casting: {
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            deadline: true,
            scoutProfile: {
              select: {
                businessName: true,
                subtype: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.jobApplication.findMany({
      where: { modelProfileId: modelProfile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            deadline: true,
            jobType: true,
            scoutProfile: {
              select: {
                businessName: true,
                subtype: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Merge and sort by createdAt desc
  const allApplications = [
    ...castingApplications.map((app) => ({ ...app, type: "casting" as const })),
    ...jobApplications.map((app) => ({ ...app, type: "job" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      {allApplications.length > 0 ? (
        <div className="space-y-4">
          {allApplications.map((app: any) => {
            const status = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = status.icon;
            const isCasting = app.type === "casting";
            const item = isCasting ? app.casting : app.job;
            const isExpired = item.deadline && new Date(item.deadline) < new Date();
            const href = isCasting
              ? `/${locale}/model/castings/${item.id}`
              : `/${locale}/model/lavori/${item.id}`;

            return (
              <Link key={app.id} href={href}>
                <Card className="hover:border-[var(--rule-strong)] transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {isCasting ? (
                            <Megaphone className="h-4 w-4 text-[var(--ink-3)] shrink-0" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-[var(--ink-3)] shrink-0" />
                          )}
                          <h3 className="font-[var(--font-display)] font-semibold truncate">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--ink-3)]">
                          {item.scoutProfile.businessName}
                          {item.scoutProfile.subtype && (
                            <span className="ml-1 text-xs">
                              ({item.scoutProfile.subtype === "AGENCY" ? t("agency") : item.scoutProfile.subtype === "BRAND" ? "Brand" : "Scout"})
                            </span>
                          )}
                        </p>
                        {item.city && (
                          <p className="text-xs text-[var(--ink-3)]">{item.city}</p>
                        )}
                        {app.introMessage && (
                          <p className="text-xs text-[var(--ink-3)] italic line-clamp-1">
                            &ldquo;{app.introMessage}&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-[var(--ink-3)]">
                          {t("appliedOn")}{" "}
                          {new Date(app.createdAt).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {t(`status${app.status.charAt(0) + app.status.slice(1).toLowerCase()}`)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {isCasting ? "Casting" : t("job")}
                        </Badge>
                        {isExpired && (
                          <span className="text-[10px] text-[var(--ink-3)]">
                            {isCasting ? t("castingExpired") : t("jobExpired")}
                          </span>
                        )}
                        {app.status === "PENDING" && (
                          <WithdrawButton applicationId={app.id} type={app.type} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={t("noApplications")}
          description={t("noApplicationsDesc")}
          actionLabel={t("exploreCastings")}
          actionHref={`/${locale}/model/castings`}
        />
      )}
    </PageContainer>
  );
}
