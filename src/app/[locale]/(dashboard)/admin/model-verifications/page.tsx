import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ModelVerificationActions } from "@/components/admin/model-verification-actions";
import { formatRelativeTime } from "@/lib/utils";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default async function AdminModelVerificationsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.admin.modelVerifications");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const pending = await db.modelProfile.findMany({
    where: { verificationStatus: "VERIFICATION_SUBMITTED" },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      portfolioImages: {
        orderBy: { order: "asc" },
        select: { url: true },
      },
    },
    orderBy: { verificationSubmittedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{t("title")}</h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {pending.length} {t("requestsToReview")}
        </p>
      </div>

      {pending.length > 0 ? (
        <div className="space-y-4">
          {pending.map((profile) => {
            const profileHref = `/${locale}/profile/${profile.slug}`;
            const displayName =
              profile.fullName || profile.user.name || profile.user.email;
            return (
              <Card key={profile.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      {profile.selfieUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.selfieUrl}
                          alt=""
                          className="h-28 w-24 shrink-0 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="h-28 w-24 shrink-0 rounded-sm bg-[var(--bg-soft)]" />
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={profileHref}
                            target="_blank"
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            {displayName}
                          </Link>
                          <Badge variant="warning" className="text-[10px]">
                            {t("submitted")}
                          </Badge>
                        </div>
                        <div className="text-sm text-[var(--ink-3)]">
                          {profile.user.email}
                        </div>
                        {profile.verificationSubmittedAt && (
                          <p className="text-xs text-[var(--ink-3)]">
                            {t("submittedAt")}{" "}
                            {formatRelativeTime(profile.verificationSubmittedAt)}
                          </p>
                        )}
                        <Link
                          href={profileHref}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t("viewProfile")}
                        </Link>
                      </div>
                    </div>

                    <ModelVerificationActions profileId={profile.id} />
                  </div>

                  {/* Portfolio photos for side-by-side comparison with the selfie */}
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-3)]">
                      {t("profilePhotos")}
                    </p>
                    {profile.portfolioImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.portfolioImages.slice(0, 8).map((img, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={img.url}
                            alt=""
                            className="h-20 w-16 rounded-sm object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--ink-3)]">{t("noPhotos")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title={t("noVerifications")}
          description={t("noVerificationsDesc")}
        />
      )}
    </div>
  );
}
