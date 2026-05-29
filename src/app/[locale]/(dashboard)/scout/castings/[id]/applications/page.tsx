import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { APPLICATION_STATUS_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { ApplicationActions } from "@/components/castings/application-actions";
import { Users } from "lucide-react";
import { BackLink } from "@/components/shared/back-link";

export default async function CastingApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.castingApplications");
  const { id: castingId } = await params;

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const casting = await db.casting.findUnique({
    where: { id: castingId },
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

  if (!casting || casting.scoutProfile.userId !== session.user.id) {
    redirect(`/${locale}/scout/castings`);
  }

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "destructive",
    WITHDRAWN: "default",
  };

  return (
    <div className="space-y-6">
      <BackLink href="/scout/castings" label={t("backToCastings")} />

      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{casting.title}</h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {casting.applications.length} {t("applicationsReceived")}
        </p>
      </div>

      {casting.applications.length > 0 ? (
        <div className="space-y-3">
          {casting.applications.map((app) => {
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
                      <ApplicationActions applicationId={app.id} locale={locale} />
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
  );
}
