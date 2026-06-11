import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getStudioDashboardData } from "@/server/queries/studio-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CalendarDays,
  CalendarClock,
  Inbox,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { TrendStat } from "@/components/dashboard/trend-stat";

type StudioDashboardData = NonNullable<
  Awaited<ReturnType<typeof getStudioDashboardData>>
>;
type Inquiry = StudioDashboardData["recentInquiries"][number];
type Notification = StudioDashboardData["recentNotifications"][number];

export default async function StudioHomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDIO") redirect("/login");

  const locale = await getLocale();
  const t = await getTranslations("pages.studio.home");
  const data = await getStudioDashboardData(session.user.id);

  if (!data) redirect("/studio/studios");

  const { profile, metrics, recentInquiries, recentNotifications } = data;
  const businessName = profile.businessName || session.user.name || "";
  const hasStudios = metrics.totalStudios > 0;

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* ─── Sommario ─── */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-eyebrow">{t("sommario")}</p>
          <h1 className="font-display font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)] max-w-[24ch]">
            {t("greeting", { name: businessName })}
          </h1>
          {profile.city && <p className="text-meta">{profile.city}</p>}
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="default" asChild>
            <Link href="/studio/studios/new" className="group">
              <Plus className="h-4 w-4 mr-1" />
              {t("newStudio")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/studio/studios">
              <Building2 className="h-4 w-4 mr-1" />
              {t("manageStudios")}
            </Link>
          </Button>
        </div>
      </header>

      {/* ─── Onboarding (no studios yet) ─── */}
      {!hasStudios && (
        <section className="hairline bg-[var(--bg-soft)] p-8 lg:p-10 mb-14 lg:mb-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-h2">{t("onboardingTitle")}</h2>
            <p className="mt-3 text-body text-[var(--ink-2)]">{t("onboardingBody")}</p>
          </div>
          <Button size="lg" asChild className="shrink-0">
            <Link href="/studio/studios/new" className="group">
              {t("onboardingCta")}
              <ArrowUpRight className="h-4 w-4 ml-2 group-arrow" />
            </Link>
          </Button>
        </section>
      )}

      {/* ─── Numeri ─── */}
      <section className="mb-14 lg:mb-20">
        <div className="hairline-b pb-4 mb-8 flex items-baseline justify-between">
          <p className="text-eyebrow">{t("numeri")}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 hairline-t hairline-l">
          <Metric
            icon={<Building2 className="h-4 w-4" />}
            label={t("publishedStudios")}
            value={metrics.publishedStudios}
            href="/studio/studios"
          />
          <Metric
            icon={<CalendarDays className="h-4 w-4" />}
            label={t("pendingBookings")}
            value={metrics.pendingBookings}
            href="/studio/bookings"
            highlight={metrics.pendingBookings > 0}
          />
          <Metric
            icon={<CalendarClock className="h-4 w-4" />}
            label={t("upcomingBookings")}
            value={metrics.upcomingBookings}
            href="/studio/bookings"
          />
          <Metric
            icon={<Inbox className="h-4 w-4" />}
            label={t("pendingInquiries")}
            value={metrics.pendingInquiries}
            href="/studio/inquiries"
            highlight={metrics.pendingInquiries > 0}
          />
        </div>
        <div className="grid grid-cols-2 hairline-l hairline-b">
          <Metric
            icon={<CalendarDays className="h-4 w-4" />}
            label={t("bookingsThisMonth")}
            value={metrics.bookingsThisMonth}
          />
          <Metric
            icon={<Building2 className="h-4 w-4" />}
            label={t("totalStudios")}
            value={metrics.totalStudios}
            href="/studio/studios"
          />
        </div>
      </section>

      {/* ─── Andamento (trends) ─── */}
      {hasStudios && (
        <section className="mb-14 lg:mb-20">
          <div className="hairline-b pb-4 mb-8">
            <p className="text-eyebrow">{t("andamento")}</p>
          </div>
          <div className="grid grid-cols-2 hairline-t hairline-l">
            <TrendStat
              icon={<CalendarDays className="h-4 w-4" />}
              label={t("bookings30")}
              value={metrics.bookingsThisMonth}
              previous={metrics.bookingsPrevMonth}
            />
            <TrendStat
              icon={<Inbox className="h-4 w-4" />}
              label={t("inquiries30")}
              value={metrics.inquiriesThisMonth}
              previous={metrics.inquiriesPrevMonth}
            />
          </div>
        </section>
      )}

      {/* ─── Avvisi + Movimenti ─── */}
      <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 mb-14 lg:mb-20">
        {/* Recent inquiries — 8 col */}
        <section className="lg:col-span-8">
          <div className="hairline-b pb-4 mb-6 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-eyebrow">{t("avvisi")}</p>
              <h2 className="mt-1 text-h2">{t("recentInquiries")}</h2>
              <p className="mt-1 text-body text-[var(--ink-3)]">
                {t("recentInquiriesDesc")}
              </p>
            </div>
            <Link
              href="/studio/inquiries"
              className="inline-flex items-center gap-1.5 text-meta hover:text-[var(--ink)] transition-colors whitespace-nowrap"
            >
              {t("viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="hairline-t pt-12 pb-10 text-center">
              <Inbox className="mx-auto h-6 w-6 text-[var(--ink-3)]/50" />
              <p className="mt-4 text-body text-[var(--ink-2)]">
                {t("noInquiriesYet")}
              </p>
            </div>
          ) : (
            <ul className="hairline-t">
              {recentInquiries.map((inq: Inquiry) => (
                <li key={inq.id}>
                  <Link
                    href="/studio/inquiries"
                    className="group flex items-start gap-5 py-5 hairline-b hover:bg-[var(--bg-soft)]/50 -mx-4 px-4 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-h3 text-[var(--ink)] truncate">{inq.name}</p>
                      <p className="text-meta truncate">{inq.studio.name}</p>
                      <p className="text-body text-[var(--ink-2)] line-clamp-1">
                        {inq.message}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-eyebrow ${
                          inq.status === "REPLIED"
                            ? "!text-[var(--success)]"
                            : inq.status === "PENDING"
                            ? "!text-[var(--ink)]"
                            : ""
                        }`}
                      >
                        {t(`inquiryStatus.${inq.status}` as never)}
                      </span>
                      <span className="text-meta">
                        {formatRelativeTime(inq.createdAt, locale)}
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
            <p className="text-eyebrow">{t("movimenti")}</p>
            <Link
              href="/studio/notifications"
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
                      notif.isRead ? "bg-[var(--ink-3)]/30" : "bg-[var(--ink)]"
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
          <p className="text-eyebrow">{t("quickActions")}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 hairline-t hairline-l">
          <QuickAction href="/studio/studios/new" icon={Plus} label={t("quickNewStudio")} />
          <QuickAction href="/studio/bookings" icon={CalendarDays} label={t("quickBookings")} />
          <QuickAction href="/studio/inquiries" icon={Inbox} label={t("quickInquiries")} />
          <QuickAction href="/studio/messages" icon={MessageSquare} label={t("quickMessages")} />
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
      <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-[var(--bg-soft)]/40">
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
      className="group p-6 lg:p-8 hairline-b hairline-r flex items-center justify-between transition-colors hover:bg-[var(--bg-soft)]/50"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
        <span className="text-body text-[var(--ink)]">{label}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
