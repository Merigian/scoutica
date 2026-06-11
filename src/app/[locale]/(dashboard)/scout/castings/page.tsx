import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CASTING_STATUS_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { Plus, ArrowUpRight, Megaphone } from "lucide-react";

export default async function ScoutCastingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.castings");

  if (!session?.user?.id || session.user.role !== "SCOUT")
    redirect(`/${locale}/login`);

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!scoutProfile) redirect(`/${locale}/scout/profile`);

  const castings = await db.casting.findMany({
    where: { scoutProfileId: scoutProfile.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusTint: Record<string, string> = {
    DRAFT: "",
    PUBLISHED: "!text-[var(--success)]",
    CLOSED: "",
    ARCHIVED: "!text-[var(--ink-3)]",
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* Header */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-eyebrow">Casting</p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
            {t("title")}
          </h1>
          <p className="text-lead max-w-[58ch]">{t("description")}</p>
        </div>
        <Link href={`/${locale}/scout/castings/new`} className="shrink-0">
          <Button variant="default">
            <Plus className="h-4 w-4 mr-1" />
            {t("newCasting")}
          </Button>
        </Link>
      </header>

      {castings.length > 0 ? (
        <ul className="hairline-t">
          {castings.map((casting) => (
            <li key={casting.id}>
              <Link
                href={`/${locale}/scout/castings/${casting.id}/applications`}
                className="group flex items-start gap-5 py-6 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-h3 text-[var(--ink)]">
                      {casting.title}
                    </h3>
                    <span
                      className={`text-eyebrow italic ${
                        statusTint[casting.status] ?? ""
                      }`}
                    >
                      {CASTING_STATUS_LABELS[
                        casting.status as keyof typeof CASTING_STATUS_LABELS
                      ]?.[lang] ?? casting.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-5 gap-y-1 flex-wrap text-meta">
                    {casting.city && <span>{casting.city}</span>}
                    {casting.castingDate && (
                      <span>{formatDate(casting.castingDate, locale)}</span>
                    )}
                    <span className="tabular-nums">
                      {casting._count.applications} {t("applications")}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 mt-1 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Megaphone}
          title={t("noCastings")}
          description={t("noCastingsDesc")}
          actionLabel={t("createCasting")}
          actionHref={`/${locale}/scout/castings/new`}
        />
      )}
    </div>
  );
}
