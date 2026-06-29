import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ReportActions } from "@/components/admin/report-actions";
import { REPORT_REASON_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default async function AdminReportsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.admin.reports");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const reports = await db.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      <div className="space-y-6">
        <p className="text-[var(--ink-3)] text-sm">
          {reports.length} {t("reportsToReview")}
        </p>

        {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-[10px]">
                        {REPORT_REASON_LABELS[report.reason]?.[lang] ?? report.reason}
                      </Badge>
                      <span className="text-xs text-[var(--ink-3)]">
                        {report.reportedContentType} — {formatRelativeTime(report.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm">
                      <span className="text-[var(--ink-3)]">{t("from")}</span>{" "}
                      {report.reporter.name ?? report.reporter.email}
                    </p>

                    {report.details && (
                      <p className="text-sm text-[var(--ink-3)]">{report.details}</p>
                    )}
                  </div>

                  <ReportActions reportId={report.id} locale={locale} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title={t("noReports")}
          description={t("noReportsDesc")}
        />
      )}
      </div>
    </PageContainer>
  );
}
