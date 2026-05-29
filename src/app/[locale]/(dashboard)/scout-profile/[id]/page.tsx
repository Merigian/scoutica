import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/shared/back-link";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
  Megaphone,
  Briefcase,
} from "lucide-react";
import {
  SCOUT_SUBTYPE_LABELS,
} from "@/config/enums";

export default async function PublicScoutProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.publicScoutProfile");

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: id },
    include: {
      user: { select: { name: true, image: true } },
      castings: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
      jobs: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
    },
  });

  if (!scoutProfile || scoutProfile.verificationStatus !== "APPROVED") {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackLink href="/model/contacts" label={t("back")} />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft)] text-2xl font-bold">
            {scoutProfile.user.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-[var(--font-display)] font-bold">
                {scoutProfile.businessName || scoutProfile.user.name}
              </h1>
              <Badge variant="gold" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {t("verified")}
              </Badge>
            </div>
            {scoutProfile.roleTitle && (
              <p className="text-[var(--ink-3)]">{scoutProfile.roleTitle}</p>
            )}
            <Badge variant="outline" className="mt-1">
              {SCOUT_SUBTYPE_LABELS[scoutProfile.subtype]?.[lang] || scoutProfile.subtype}
            </Badge>
          </div>
        </div>

        {/* Bio */}
        {scoutProfile.bio && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-[var(--ink-3)] whitespace-pre-line">
                {scoutProfile.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          {scoutProfile.city && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--ink-3)]" />
                <div>
                  <p className="text-sm font-medium">{t("location")}</p>
                  <p className="text-sm text-[var(--ink-3)]">{scoutProfile.city}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {scoutProfile.websiteUrl && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Globe className="h-5 w-5 text-[var(--ink-3)]" />
                <div>
                  <p className="text-sm font-medium">{t("website")}</p>
                  <a
                    href={scoutProfile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--ink-3)] hover:text-[var(--ink)] underline"
                  >
                    {scoutProfile.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-[var(--ink-3)]" />
              <div>
                <p className="text-sm font-medium">{t("activeCastings")}</p>
                <p className="text-sm text-[var(--ink-3)]">{scoutProfile.castings.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-[var(--ink-3)]" />
              <div>
                <p className="text-sm font-medium">{t("activeJobs")}</p>
                <p className="text-sm text-[var(--ink-3)]">{scoutProfile.jobs.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {scoutProfile.professionalEmail && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-[var(--ink-3)]" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-[var(--ink-3)]">{scoutProfile.professionalEmail}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
