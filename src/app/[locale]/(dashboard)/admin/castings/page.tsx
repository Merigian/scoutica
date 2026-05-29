import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CASTING_STATUS_LABELS } from "@/config/enums";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Megaphone, MapPin, Calendar, Users } from "lucide-react";

export default async function AdminCastingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.admin.castings");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const castings = await db.casting.findMany({
    include: {
      scoutProfile: {
        select: { businessName: true, user: { select: { email: true } } },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    DRAFT: "default",
    PUBLISHED: "success",
    CLOSED: "warning",
    ARCHIVED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {castings.length} {t("totalCastings")}
        </p>
      </div>

      {castings.length > 0 ? (
        <div className="space-y-3">
          {castings.map((casting) => (
            <Card key={casting.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{casting.title}</h3>
                      <Badge variant={statusVariants[casting.status] ?? "default"} className="text-[10px]">
                        {CASTING_STATUS_LABELS[casting.status as keyof typeof CASTING_STATUS_LABELS]?.[lang] ?? casting.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--ink-3)]">
                      {t("from")} {casting.scoutProfile.businessName ?? casting.scoutProfile.user.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--ink-3)] flex-wrap">
                      {casting.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {casting.city}
                        </span>
                      )}
                      {casting.castingDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(casting.castingDate, lang)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {casting._count.applications} {t("applications")}
                      </span>
                      <span>{formatRelativeTime(casting.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title={t("noCastings")}
          description={t("noCastingsDesc")}
        />
      )}
    </div>
  );
}
