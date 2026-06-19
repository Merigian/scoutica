import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ScoutProfileForm } from "@/components/forms/scout-profile-form";
import { SCOUT_SUBTYPE_LABELS, VERIFICATION_STATUS_LABELS } from "@/config/enums";
import { getLocale, getTranslations } from "next-intl/server";

export default async function ScoutProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SCOUT") redirect("/login");
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.profile");

  const profile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="mt-1 text-[var(--ink-3)]">{t("description")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Verification Status */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--ink-3)]">{t("verificationStatus")}</p>
            <div className="mt-2 flex items-center gap-2">
              {profile.verificationStatus === "APPROVED" && (
                <VerifiedBadge
                  size={20}
                  variant="static"
                  aria-label={VERIFICATION_STATUS_LABELS[profile.verificationStatus][lang]}
                />
              )}
              <Badge
                variant={
                  profile.verificationStatus === "APPROVED" ? "success" :
                  profile.verificationStatus === "PENDING" ? "warning" : "destructive"
                }
              >
                {VERIFICATION_STATUS_LABELS[profile.verificationStatus][lang]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Type */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--ink-3)]">{t("type")}</p>
            <p className="mt-2 text-lg font-medium">{SCOUT_SUBTYPE_LABELS[profile.subtype][lang]}</p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--ink-3)]">{t("currentPlan")}</p>
            <p className="mt-2 text-lg font-medium">{subscription?.plan || "FREE"}</p>
          </CardContent>
        </Card>
      </div>

      <ScoutProfileForm
        profile={{
          businessName: profile.businessName,
          roleTitle: profile.roleTitle,
          bio: profile.bio,
          city: profile.city,
          professionalEmail: profile.professionalEmail,
          websiteUrl: profile.websiteUrl,
          socialProfileUrl: profile.socialProfileUrl,
          vatNumber: profile.vatNumber,
        }}
      />

      {profile.verificationStatus === "PENDING" && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <p className="font-medium">{t("pendingVerification")}</p>
            <p className="mt-1 text-sm text-[var(--ink-3)]">
              {t("pendingVerificationDesc")}
            </p>
          </CardContent>
        </Card>
      )}

      {profile.verificationStatus === "REJECTED" && (
        <Card className="border-[var(--accent)]/30 bg-[var(--accent)]/5">
          <CardContent className="pt-6">
            <p className="font-medium text-[var(--accent)]">{t("rejectedVerification")}</p>
            {profile.verificationNotes && (
              <p className="mt-1 text-sm text-[var(--ink-3)]">{profile.verificationNotes}</p>
            )}
            <a href="/scout/verification" className="mt-2 inline-block text-sm font-medium underline">
              {t("resubmit")}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
