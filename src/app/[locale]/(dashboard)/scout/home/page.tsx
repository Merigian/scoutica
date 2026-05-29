import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getScoutDashboardData } from "@/server/queries/scout-dashboard";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Search,
  Send,
  Users,
  Megaphone,
  Briefcase,
  Kanban,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Mail,
  User,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { SCOUT_SUBTYPE_LABELS } from "@/config/enums";

type ScoutDashboardData = NonNullable<
  Awaited<ReturnType<typeof getScoutDashboardData>>
>;
type Application = ScoutDashboardData["recentApplications"][number];
type Notification = ScoutDashboardData["recentNotifications"][number];

export default async function ScoutHomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SCOUT") redirect("/login");

  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.home");
  const data = await getScoutDashboardData(session.user.id);

  if (!data) redirect("/scout/profile");

  const { profile, plan, metrics, recentApplications, recentNotifications } =
    data;
  const businessName = profile.businessName || session.user.name || "";

  const subtypeLabel =
    SCOUT_SUBTYPE_LABELS[profile.subtype]?.[lang] || profile.subtype;

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* ─── Sommario ─── */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-eyebrow">01 — {t("sommario")}</p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)] max-w-[24ch]">
            {t("greeting", { name: businessName })}
          </h1>
          <p className="text-meta">
            {subtypeLabel} · {plan}
            {profile.city && ` · ${profile.city}`}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="default" asChild>
            <Link href="/scout/discover" className="group">
              <Search className="h-4 w-4 mr-1" />
              {t("searchModels")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/scout/castings/new">
              <Plus className="h-4 w-4 mr-1" />
              {t("newCasting")}
            </Link>
          </Button>
        </div>
      </header>

      {/* ─── Numeri ─── */}
      <section className="mb-14 lg:mb-20">
        <div className="hairline-b pb-4 mb-8 flex items-baseline justify-between">
          <p className="text-eyebrow">02 — {t("numeri")}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 hairline-t hairline-l">
          <Metric
            icon={<Megaphone className="h-4 w-4" />}
            label={t("activeCastings")}
            value={metrics.activeCastings}
            href="/scout/castings"
          />
          <Metric
            icon={<Briefcase className="h-4 w-4" />}
            label={t("activeJobs")}
            value={metrics.activeJobs}
            href="/scout/lavori"
          />
          <Metric
            icon={<Mail className="h-4 w-4" />}
            label={t("pendingReview")}
            value={metrics.pendingApplications}
            highlight={metrics.pendingApplications > 0}
          />
          <Metric
            icon={<Users className="h-4 w-4" />}
            label={t("activeConversations")}
            value={metrics.contactsAccepted}
            href="/scout/messages"
          />
        </div>
        <div className="grid grid-cols-2 hairline-l hairline-b">
          <Metric
            icon={<Kanban className="h-4 w-4" />}
            label={t("shortlists")}
            value={metrics.shortlistBoards}
            href="/scout/boards"
          />
          <Metric
            icon={<Send className="h-4 w-4" />}
            label={t("pendingContacts")}
            value={metrics.contactsPending}
            href="/scout/contacts"
          />
        </div>
      </section>

      {/* ─── Avvisi + Movimenti ─── */}
      <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 mb-14 lg:mb-20">
        {/* Avvisi (applications) — 8 col */}
        <section className="lg:col-span-8">
          <div className="hairline-b pb-4 mb-6 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-eyebrow">03 — {t("avvisi")}</p>
              <h2 className="mt-1 text-h2">{t("recentApplications")}</h2>
              <p className="mt-1 text-body text-[var(--ink-3)]">
                {t("recentApplicationsDesc")}
              </p>
            </div>
            <Link
              href="/scout/castings"
              className="inline-flex items-center gap-1.5 text-meta hover:text-[var(--ink)] transition-colors whitespace-nowrap"
            >
              {t("viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="hairline-t pt-12 pb-10 text-center">
              <Megaphone className="mx-auto h-6 w-6 text-[var(--ink-3)]/50" />
              <p className="mt-4 text-body text-[var(--ink-2)]">
                {t("noApplicationsYet")}
              </p>
            </div>
          ) : (
            <ul className="hairline-t">
              {recentApplications.map((app: Application, i: number) => (
                <li key={app.id}>
                  <Link
                    href={`/scout/castings/${app.casting.id}/applications`}
                    className="group flex items-center gap-5 py-5 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
                  >
                    <span className="text-eyebrow shrink-0 w-8 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-14 w-14 shrink-0 overflow-hidden bg-[var(--bg-soft)]">
                      {app.modelProfile.portfolioImages[0]?.url ? (
                        <Image
                          src={app.modelProfile.portfolioImages[0].url}
                          alt={app.modelProfile.fullName || ""}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-5 w-5 text-[var(--ink-3)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-h3 text-[var(--ink)] truncate">
                        {app.modelProfile.fullName}
                      </p>
                      <p className="text-meta truncate">{app.casting.title}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-eyebrow ${
                          app.status === "ACCEPTED"
                            ? "!text-[var(--success)]"
                            : app.status === "REJECTED"
                            ? "!text-[var(--danger)]"
                            : ""
                        }`}
                      >
                        {t(`applicationStatus.${app.status}` as never)}
                      </span>
                      <span className="text-meta">
                        {formatRelativeTime(app.createdAt, locale)}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Movimenti — 4 col */}
        <aside className="lg:col-span-4">
          <div className="hairline-b pb-4 mb-6 flex items-baseline justify-between gap-4">
            <p className="text-eyebrow">04 — {t("movimenti")}</p>
            <Link
              href="/scout/notifications"
              className="text-meta hover:text-[var(--ink)] transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>
          {recentNotifications.length === 0 ? (
            <p className="text-meta italic">{t("noActivity")}</p>
          ) : (
            <ul className="space-y-5">
              {recentNotifications.map((notif: Notification) => (
                <li key={notif.id} className="flex gap-3">
                  <span
                    className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                      notif.isRead
                        ? "bg-[var(--ink-3)]/30"
                        : "bg-[var(--ink)]"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    {notif.link ? (
                      <Link
                        href={notif.link}
                        className="text-body text-[var(--ink)] link-underline line-clamp-2"
                      >
                        {notif.title}
                      </Link>
                    ) : (
                      <p className="text-body text-[var(--ink)] line-clamp-2">
                        {notif.title}
                      </p>
                    )}
                    {notif.body && (
                      <p className="text-meta line-clamp-1">{notif.body}</p>
                    )}
                    <p className="text-meta">
                      {formatRelativeTime(notif.createdAt, locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* ─── Azioni rapide ─── */}
      <section>
        <div className="hairline-b pb-4 mb-8">
          <p className="text-eyebrow">05 — {t("quickActions")}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 hairline-t hairline-l">
          <QuickAction
            href="/scout/discover"
            icon={Search}
            label={t("quickSearch")}
          />
          <QuickAction
            href="/scout/castings/new"
            icon={Megaphone}
            label={t("quickCasting")}
          />
          <QuickAction
            href="/scout/lavori/new"
            icon={Briefcase}
            label={t("quickJob")}
          />
          <QuickAction
            href="/scout/boards"
            icon={Kanban}
            label={t("quickBoards")}
          />
        </div>
      </section>
    </div>
  );
}

// ─── Numeric cell ───
function Metric({
  icon,
  label,
  value,
  href,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div
      className={`p-6 lg:p-8 hairline-b hairline-r h-full flex flex-col ${
        highlight ? "bg-[var(--bg-soft)]/50" : ""
      }`}
    >
      <div className="flex items-center justify-between text-[var(--ink-3)]">
        <span className="text-eyebrow">{label}</span>
        {icon}
      </div>
      <p className="mt-6 font-[var(--font-display)] font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
        {value}
      </p>
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

// ─── Quick action cell ───
function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group p-6 lg:p-8 hairline-b hairline-r flex flex-col items-start gap-6 transition-colors hover:bg-[var(--bg-soft)]/50"
    >
      <Icon className="h-5 w-5 text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
      <div className="flex items-center justify-between w-full gap-4">
        <span className="text-h3 text-[var(--ink)]">{label}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}
