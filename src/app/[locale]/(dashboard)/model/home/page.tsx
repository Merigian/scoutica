import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getModelDashboardData } from "@/server/queries/model-dashboard";
import { db } from "@/lib/db";
import { BoostCard } from "@/components/model/boost-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Mail,
  Send,
  ArrowUpRight,
  ArrowRight,
  Camera,
  Briefcase,
} from "lucide-react";
import { OnboardingChecklist } from "@/components/model/onboarding-checklist";

export default async function ModelHomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MODEL") redirect("/login");

  const t = await getTranslations("pages.model.home");
  const data = await getModelDashboardData(session.user.id);

  if (!data) redirect("/model/profile");

  const { profile, metrics, opportunities, recentActivity } = data;
  const locale = await getLocale();
  const activeBoosts = await db.boost.findMany({
    where: {
      modelProfile: { userId: session.user.id },
      endsAt: { gt: new Date() },
    },
    select: { endsAt: true },
    orderBy: { endsAt: "desc" },
  });
  const firstName =
    profile.fullName?.split(" ")[0] ?? session.user.name?.split(" ")[0] ?? "";

  const needsCompletion = profile.status === "INCOMPLETE";
  const needsPublish = !needsCompletion && !profile.isPublished;
  const statusNote = needsCompletion
    ? t("profileIncomplete")
    : needsPublish
    ? t("profileNotPublished")
    : null;

  const strengthScore = profile.completenessScore;
  const strengthLabel =
    strengthScore >= 80
      ? t("strengthProfessional")
      : strengthScore >= 50
      ? t("strengthGood")
      : t("strengthBasic");

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* ─── Sommario (header) ─── */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-eyebrow">01 — {t("sommario")}</p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)] max-w-[22ch]">
            {t("greeting", { name: firstName })}
          </h1>
          {statusNote && (
            <p className="text-lead italic max-w-[52ch]">{statusNote}</p>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          {needsCompletion ? (
            <Button variant="default" asChild>
              <Link href="/model/profile" className="group">
                {t("completeProfile")}
                <ArrowUpRight className="h-4 w-4 group-arrow" />
              </Link>
            </Button>
          ) : needsPublish ? (
            <Button variant="default" asChild>
              <Link href="/model/profile" className="group">
                {t("publishProfile")}
                <ArrowUpRight className="h-4 w-4 group-arrow" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href={`/m/${profile.slug}`}>{t("viewProfile")}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/model/profile">{t("editProfile")}</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ─── Onboarding checklist (only when unpublished) ─── */}
      {!profile.isPublished && (
        <div className="mb-12 lg:mb-16">
          <OnboardingChecklist
            hasPhotos={(profile as { photoCount?: number }).photoCount !== undefined && (profile as { photoCount: number }).photoCount >= 3}
            hasMeasurements={!!(profile as { height?: number }).height && profile.completenessScore >= 25}
            hasBasicInfo={!!profile.fullName && !!(profile as { city?: string }).city}
            isPublished={profile.isPublished}
          />
        </div>
      )}

      {/* ─── Numeri (stats grid) ─── */}
      <section className="mb-14 lg:mb-20">
        <div className="hairline-b pb-4 mb-8 flex items-baseline justify-between">
          <p className="text-eyebrow">02 — {t("numeri")}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 hairline-t hairline-l">
          <Metric
            icon={<Eye className="h-4 w-4" />}
            label={t("viewsThisWeek")}
            value={metrics.viewsThisWeek}
            trend={metrics.viewsTrend}
            trendLabel={t("viewsTrend", {
              value: Math.abs(metrics.viewsTrend).toString(),
            })}
            noChangeLabel={t("noChange")}
          />
          <StrengthMetric
            label={t("profileStrength")}
            score={strengthScore}
            tier={strengthLabel}
          />
          <Metric
            icon={<Mail className="h-4 w-4" />}
            label={t("pendingContacts")}
            value={metrics.pendingContacts}
            href="/model/contacts"
          />
          <Metric
            icon={<Send className="h-4 w-4" />}
            label={t("activeApplications")}
            value={metrics.activeApplications}
            href="/model/applications"
          />
        </div>
      </section>

      {/* ─── Avvisi + Movimenti ─── */}
      <div className="grid gap-12 lg:gap-16 lg:grid-cols-12">
        {/* Avvisi (opportunities) — 8 col */}
        <section className="lg:col-span-8">
          <div className="hairline-b pb-4 mb-6 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-eyebrow">03 — {t("avvisi")}</p>
              <h2 className="mt-1 text-h2">{t("opportunities")}</h2>
              <p className="mt-1 text-body text-[var(--ink-3)]">
                {t("opportunitiesDesc")}
              </p>
            </div>
            <Link
              href="/model/castings"
              className="inline-flex items-center gap-1.5 text-meta hover:text-[var(--ink)] transition-colors whitespace-nowrap"
            >
              {t("browseAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {opportunities.length === 0 ? (
            <div className="hairline-t pt-12 pb-10 text-center">
              <Briefcase className="mx-auto h-6 w-6 text-[var(--ink-3)]/50" />
              <p className="mt-4 text-body text-[var(--ink-2)]">
                {t("noOpportunities")}
              </p>
              <p className="mt-1 text-meta">{t("noOpportunitiesDesc")}</p>
            </div>
          ) : (
            <ul className="hairline-t">
              {opportunities.map((opp, i) => (
                <li key={`${opp.type}-${opp.id}`}>
                  <Link
                    href={
                      opp.type === "casting"
                        ? `/model/castings/${opp.id}`
                        : `/model/lavori/${opp.id}`
                    }
                    className="group flex items-start justify-between gap-6 py-5 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-eyebrow">
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        {opp.type === "casting" ? t("casting") : t("job")}
                        {opp.isPaid && <span> · {t("paid")}</span>}
                      </p>
                      <p className="text-h3 text-[var(--ink)] line-clamp-2">
                        {opp.title}
                      </p>
                      <p className="text-meta">
                        {opp.postedBy} · {opp.city}
                        {opp.deadline &&
                          ` · ${t("deadline", {
                            date: opp.deadline.toLocaleDateString(),
                          })}`}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Movimenti + Azioni — 4 col */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Movimenti (activity) */}
          <div>
            <div className="hairline-b pb-4 mb-6 flex items-baseline justify-between gap-4">
              <p className="text-eyebrow">04 — {t("movimenti")}</p>
              <Link
                href="/model/notifications"
                className="text-meta hover:text-[var(--ink)] transition-colors"
              >
                {t("viewAll")}
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-meta italic">{t("noActivityDesc")}</p>
            ) : (
              <ul className="space-y-5">
                {recentActivity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                        item.isRead
                          ? "bg-[var(--ink-3)]/30"
                          : "bg-[var(--ink)]"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      {item.link ? (
                        <Link
                          href={item.link}
                          className="text-body text-[var(--ink)] link-underline line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="text-body text-[var(--ink)] line-clamp-2">
                          {item.title}
                        </p>
                      )}
                      {item.body && (
                        <p className="text-meta line-clamp-1">{item.body}</p>
                      )}
                      <p className="text-meta">{formatTimeAgo(item.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Azioni rapide */}
          <div>
            <p className="text-eyebrow hairline-b pb-4 mb-6">
              05 — {t("quickActions")}
            </p>
            <ul className="hairline-t">
              <li>
                <Link
                  href="/model/portfolio"
                  className="group flex items-center justify-between gap-3 py-4 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
                >
                  <span className="inline-flex items-center gap-3 text-body text-[var(--ink)]">
                    <Camera className="h-4 w-4 text-[var(--ink-3)]" />
                    {t("updatePortfolio")}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/model/castings"
                  className="group flex items-center justify-between gap-3 py-4 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
                >
                  <span className="inline-flex items-center gap-3 text-body text-[var(--ink)]">
                    <Briefcase className="h-4 w-4 text-[var(--ink-3)]" />
                    {t("browseOpportunities")}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Visibilità — Boost */}
          {profile.isPublished && (
            <div>
              <p className="text-eyebrow hairline-b pb-4 mb-6">
                06 — {t("visibility")}
              </p>
              <BoostCard activeBoosts={activeBoosts} locale={locale} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ─── Numeric cell ───
function Metric({
  icon,
  label,
  value,
  trend,
  trendLabel,
  noChangeLabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: number;
  trendLabel?: string;
  noChangeLabel?: string;
  href?: string;
}) {
  const arrow = trend === undefined ? null : trend > 0 ? "↑" : trend < 0 ? "↓" : "—";
  const trendCopy =
    trend === undefined ? null : trend === 0 ? noChangeLabel : trendLabel;

  const inner = (
    <div className="p-6 lg:p-8 hairline-b hairline-r h-full flex flex-col">
      <div className="flex items-center justify-between text-[var(--ink-3)]">
        <span className="text-eyebrow">{label}</span>
        {icon}
      </div>
      <p className="mt-6 font-[var(--font-display)] font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
        {value}
      </p>
      {trendCopy && (
        <p
          className={`mt-3 text-meta ${
            trend && trend > 0
              ? "!text-[var(--success)]"
              : trend && trend < 0
              ? "!text-[var(--danger)]"
              : ""
          }`}
        >
          <span aria-hidden="true">{arrow}</span> {trendCopy}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block transition-colors hover:bg-[var(--bg-soft)]/40"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Profile strength cell ───
function StrengthMetric({
  label,
  score,
  tier,
}: {
  label: string;
  score: number;
  tier: string;
}) {
  return (
    <div className="p-6 lg:p-8 hairline-b hairline-r h-full flex flex-col">
      <div className="flex items-center justify-between text-[var(--ink-3)]">
        <span className="text-eyebrow">{label}</span>
        <span className="text-meta tabular-nums">{score}%</span>
      </div>
      <p className="mt-6 font-[var(--font-display)] font-light text-[clamp(1.5rem,2.1vw,2rem)] leading-none text-[var(--ink)]">
        {tier}
      </p>
      <div className="mt-auto pt-6">
        <div className="h-px bg-[var(--rule)] overflow-hidden">
          <div
            className="h-px bg-[var(--ink)]"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString();
}
