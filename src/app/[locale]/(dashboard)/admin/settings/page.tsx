import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Clock } from "lucide-react";
import { isScoutGateOpen } from "@/server/queries/settings";
import { ScoutGateToggle } from "@/components/admin/scout-gate-toggle";
import { SCOUT_SUBTYPE_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = (locale === "en" ? "en" : "it") as "it" | "en";
  const t = await getTranslations("pages.admin.settings");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const [gateOpen, waitlistedProfiles] = await Promise.all([
    isScoutGateOpen(),
    db.scoutProfile.findMany({
      where: { verificationStatus: "WAITLISTED" },
      include: {
        user: {
          select: { name: true, email: true, createdAt: true, waitlistEntry: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const waitlistedCount = waitlistedProfiles.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("scoutGate.title")}
          </CardTitle>
          <p className="text-sm text-[var(--ink-3)]">
            {t("scoutGate.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoutGateToggle isOpen={gateOpen} waitlistedCount={waitlistedCount} />
          {waitlistedCount > 0 && (
            <p className="text-sm text-[var(--ink-3)]">
              {t("scoutGate.waitlistedCount", { count: waitlistedCount })}
            </p>
          )}
        </CardContent>
      </Card>

      {waitlistedProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("scoutGate.waitlistTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitlistedProfiles.map((profile) => {
              const entry = profile.user.waitlistEntry;
              return (
                <div key={profile.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {entry?.fullName || profile.user.name || profile.user.email}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {SCOUT_SUBTYPE_LABELS[profile.subtype]?.[lang] ?? profile.subtype}
                      </Badge>
                    </div>
                    {entry && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-sm text-[var(--ink-3)]">
                        {entry.businessName && <div>{entry.businessName}</div>}
                        {entry.city && <div>{entry.city}</div>}
                        {entry.professionalLink && (
                          <div>
                            <a href={entry.professionalLink} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                              {entry.professionalLink}
                            </a>
                          </div>
                        )}
                        {entry.talentTypesNeeded && <div>{entry.talentTypesNeeded}</div>}
                      </div>
                    )}
                    <p className="text-xs text-[var(--ink-3)]">
                      {formatRelativeTime(profile.user.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("generalSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--ink-3)]">
            {t("comingSoon")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
