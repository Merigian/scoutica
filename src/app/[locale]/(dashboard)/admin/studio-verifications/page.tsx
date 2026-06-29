import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StudioVerificationActions } from "@/components/admin/studio-verification-actions";
import { formatRelativeTime } from "@/lib/utils";
import { Building2 } from "lucide-react";

export default async function AdminStudioVerificationsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.admin.studioVerifications");

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const pending = await db.studioProfile.findMany({
    where: {
      verificationStatus: { in: ["PENDING", "VERIFICATION_SUBMITTED"] },
    },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      studios: { select: { id: true, name: true, city: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const statusVariant = (status: string) =>
    status === "VERIFICATION_SUBMITTED" ? ("warning" as const) : ("outline" as const);

  const statusLabel = (status: string) =>
    status === "VERIFICATION_SUBMITTED" ? t("submitted") : t("pending");

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      <div className="space-y-6">
        <p className="text-[var(--ink-3)] text-sm">
          {pending.length} {t("requestsToReview")}
        </p>

        {pending.length > 0 ? (
        <div className="space-y-4">
          {pending.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {profile.businessName ?? profile.user.name ?? profile.user.email}
                      </span>
                      <Badge variant={statusVariant(profile.verificationStatus)} className="text-[10px]">
                        {statusLabel(profile.verificationStatus)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <div>
                        <span className="text-[var(--ink-3)]">Email:</span>{" "}
                        {profile.user.email}
                      </div>
                      {profile.city && (
                        <div>
                          <span className="text-[var(--ink-3)]">{t("city")}</span>{" "}
                          {profile.city}
                        </div>
                      )}
                      {profile.vatNumber && (
                        <div>
                          <span className="text-[var(--ink-3)]">P.IVA:</span>{" "}
                          {profile.vatNumber}
                        </div>
                      )}
                      {profile.phoneNumber && (
                        <div>
                          <span className="text-[var(--ink-3)]">Tel:</span>{" "}
                          {profile.phoneNumber}
                        </div>
                      )}
                      {profile.websiteUrl && (
                        <div>
                          <span className="text-[var(--ink-3)]">Web:</span>{" "}
                          <a
                            href={profile.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--ink)] hover:underline"
                          >
                            {profile.websiteUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <span className="text-[var(--ink-3)]">{t("spaces")}:</span>{" "}
                      {profile.studios.length > 0
                        ? profile.studios
                            .map((s) => (s.city ? `${s.name} (${s.city})` : s.name))
                            .join(" · ")
                        : "—"}
                    </div>

                    <p className="text-xs text-[var(--ink-3)]">
                      {t("registered")} {formatRelativeTime(profile.user.createdAt)}
                    </p>
                  </div>

                  <StudioVerificationActions profileId={profile.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={t("noVerifications")}
          description={t("noVerificationsDesc")}
        />
      )}
      </div>
    </PageContainer>
  );
}
