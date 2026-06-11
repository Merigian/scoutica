import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CastingApplyButton } from "@/components/castings/casting-apply-button";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, DollarSign, Users, CheckCircle } from "lucide-react";
import { BackLink } from "@/components/shared/back-link";

export default async function CastingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.castingDetail");
  const { id: castingId } = await params;

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const casting = await db.casting.findUnique({
    where: { id: castingId, status: "PUBLISHED" },
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

  if (!casting) redirect(`/${locale}/model/castings`);

  // Check if model has already applied
  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isPublished: true },
  });

  let hasApplied = false;
  if (modelProfile) {
    const existingApp = await db.castingApplication.findUnique({
      where: {
        castingId_modelProfileId: {
          castingId,
          modelProfileId: modelProfile.id,
        },
      },
    });
    hasApplied = !!existingApp;
  }

  const isExpired = casting.deadline ? new Date(casting.deadline) < new Date() : false;

  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/model/castings" label={t("backToCastings")} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {casting.isPaid && (
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
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{casting.title}</h1>
        <p className="text-sm text-[var(--ink-3)] mt-1">
          {t("postedBy")}{" "}
          <span className="font-medium text-[var(--ink)]">
            {casting.scoutProfile.businessName ?? "Scout"}
          </span>
          {casting.scoutProfile.verificationStatus === "APPROVED" && (
            <Badge variant="default" className="ml-1 text-[10px]">✓</Badge>
          )}
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {casting.city && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("location")}</p>
                <p className="text-sm font-medium">{casting.city}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {casting.castingDate && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("date")}</p>
                <p className="text-sm font-medium">{formatDate(casting.castingDate, locale)}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {casting.compensation && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("compensation")}</p>
                <p className="text-sm font-medium">{casting.compensation}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {casting.spots && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--ink-3)]" />
              <div>
                <p className="text-xs text-[var(--ink-3)]">{t("spots")}</p>
                <p className="text-sm font-medium">{casting.spots}</p>
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
          <p className="text-sm whitespace-pre-wrap">{casting.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {casting.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("requirements")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{casting.requirements}</p>
          </CardContent>
        </Card>
      )}

      {/* Deadline */}
      {casting.deadline && (
        <div className="text-sm text-[var(--ink-3)]">
          {t("applicationDeadline")}{" "}
          <span className="font-medium text-[var(--ink)]">{formatDate(casting.deadline, locale)}</span>
        </div>
      )}

      {/* Apply button */}
      {!hasApplied && !isExpired && modelProfile?.isPublished && (
        <>
          <Separator />
          <CastingApplyButton castingId={castingId} locale={locale} />
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
