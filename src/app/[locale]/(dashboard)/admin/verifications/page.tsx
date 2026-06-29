import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VerificationActions } from "@/components/admin/verification-actions";
import { SCOUT_SUBTYPE_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { Shield } from "lucide-react";

export default async function AdminVerificationsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.admin.verifications");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const pendingVerifications = await db.scoutProfile.findMany({
    where: {
      verificationStatus: { in: ["PENDING", "VERIFICATION_SUBMITTED"] },
    },
    include: {
      user: { select: { name: true, email: true, image: true, createdAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const statusVariant = (status: string) => {
    if (status === "VERIFICATION_SUBMITTED") return "warning" as const;
    return "outline" as const;
  };

  const statusLabel = (status: string) => {
    if (status === "VERIFICATION_SUBMITTED") return t("submitted");
    return t("pending");
  };

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      <div className="space-y-6">
        <p className="text-[var(--ink-3)] text-sm">
          {pendingVerifications.length} {t("requestsToReview")}
        </p>

        {pendingVerifications.length > 0 ? (
        <div className="space-y-4">
          {pendingVerifications.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{profile.user.name ?? profile.user.email}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {SCOUT_SUBTYPE_LABELS[profile.subtype]?.[lang] ?? profile.subtype}
                      </Badge>
                      <Badge variant={statusVariant(profile.verificationStatus)} className="text-[10px]">
                        {statusLabel(profile.verificationStatus)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      {profile.businessName && (
                        <div>
                          <span className="text-[var(--ink-3)]">{t("business")}</span>{" "}
                          {profile.businessName}
                        </div>
                      )}
                      {profile.professionalEmail && (
                        <div>
                          <span className="text-[var(--ink-3)]">Email:</span>{" "}
                          {profile.professionalEmail}
                        </div>
                      )}
                      {profile.city && (
                        <div>
                          <span className="text-[var(--ink-3)]">{t("city")}</span>{" "}
                          {profile.city}
                        </div>
                      )}
                      {profile.websiteUrl && (
                        <div>
                          <span className="text-[var(--ink-3)]">Web:</span>{" "}
                          <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--ink)] hover:underline">
                            {profile.websiteUrl}
                          </a>
                        </div>
                      )}
                      {profile.socialProfileUrl && (
                        <div>
                          <span className="text-[var(--ink-3)]">Social:</span>{" "}
                          <a href={profile.socialProfileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--ink)] hover:underline">
                            {profile.socialProfileUrl}
                          </a>
                        </div>
                      )}
                      {profile.vatNumber && (
                        <div>
                          <span className="text-[var(--ink-3)]">P.IVA:</span>{" "}
                          {profile.vatNumber}
                        </div>
                      )}
                    </div>

                    {profile.purposeOfUse && (
                      <div className="text-sm">
                        <span className="text-[var(--ink-3)]">{t("purposeOfUse")}:</span>{" "}
                        {profile.purposeOfUse}
                      </div>
                    )}

                    <p className="text-xs text-[var(--ink-3)]">
                      {t("registered")} {formatRelativeTime(profile.user.createdAt)}
                    </p>
                  </div>

                  <VerificationActions profileId={profile.id} locale={locale} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title={t("noVerifications")}
          description={t("noVerificationsDesc")}
        />
      )}
      </div>
    </PageContainer>
  );
}
