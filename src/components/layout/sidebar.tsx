"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/site";
import {
  User,
  Images,
  Megaphone,
  FileText,
  UserCheck,
  MessageSquare,
  Bell,
  Settings,
  LayoutDashboard,
  Search,
  Kanban,
  Users,
  ShieldCheck,
  BadgeCheck,
  Flag,
  CreditCard,
  Building2,
  Inbox,
  Briefcase,
  CalendarDays,
  Globe,
  Bookmark,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { signOut } from "next-auth/react";
import { UnreadBadge } from "@/components/shared/unread-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const iconMap: Record<string, React.ElementType> = {
  User,
  Images,
  Megaphone,
  FileText,
  UserCheck,
  MessageSquare,
  Bell,
  Settings,
  LayoutDashboard,
  Search,
  Kanban,
  Users,
  ShieldCheck,
  BadgeCheck,
  Flag,
  CreditCard,
  Building2,
  Inbox,
  Briefcase,
  CalendarDays,
  Bookmark,
};

// Items to visually separate into a "secondary" group at the bottom of nav
const SECONDARY_KEYS = new Set(["settings", "notifications"]);

export function Sidebar({
  hideVerification = false,
  completenessScore = null,
  verified = false,
  pinned = false,
  onTogglePin,
}: {
  hideVerification?: boolean;
  completenessScore?: number | null;
  verified?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const reduce = useReducedMotion();

  if (!session?.user) return null;

  const role = session.user.role.toLowerCase() as "model" | "scout" | "studio" | "admin";
  const navItems = (NAV_ITEMS[role] || []).filter(
    (item) => !(hideVerification && item.key === "verification"),
  );
  const primaryItems = navItems.filter((item) => !SECONDARY_KEYS.has(item.key));
  const secondaryItems = navItems.filter((item) => SECONDARY_KEYS.has(item.key));
  // The active item is the longest nav href that matches the current path, so
  // /model/settings/billing highlights Billing only (not Settings as well).
  const activeHref = navItems
    .filter((item) => pathname.includes(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login" as never);
  };

  // Labels are hidden in the collapsed rail and revealed on hover — or always
  // shown when the user has pinned the sidebar open.
  const labelCls = cn(
    "whitespace-nowrap transition-opacity duration-200",
    pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100",
  );

  const initial = session.user.name?.charAt(0)?.toUpperCase() || "U";
  const profileHref = (role === "model" ? "/model/profile" : `/${role}/settings`) as never;
  const score =
    typeof completenessScore === "number"
      ? Math.max(0, Math.min(100, completenessScore))
      : null;

  const renderItem = (item: { key: string; href: string; icon: string }) => {
    const Icon = iconMap[item.icon] || User;
    const isActive = item.href === activeHref;
    return (
      <li key={item.key}>
        <Link
          href={item.href as never}
          title={t(item.key as never)}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--rule-strong)]",
            isActive
              ? "text-[var(--ink)] bg-[var(--bg-soft)]"
              : "text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]",
          )}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active-bar"
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--ink)]"
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <span className="relative shrink-0">
            <Icon className="h-[18px] w-[18px]" />
            {item.key === "messages" && <UnreadBadge />}
          </span>
          <span className={labelCls}>{t(item.key as never)}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "group/sidebar hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:hairline-r lg:transition-all lg:duration-200 lg:ease-out overflow-hidden",
        pinned
          ? "lg:w-64 lg:bg-[var(--bg)]"
          : "lg:w-[68px] hover:lg:w-64 lg:bg-[var(--bg)] hover:lg:bg-[var(--bg-elevated)]",
      )}
    >
      <div className="flex h-14 items-center gap-2 hairline-b px-4 shrink-0">
        <Link
          href="/"
          className="flex items-center overflow-hidden text-[var(--ink)]"
          aria-label="Scoutica"
        >
          <LogoMark size="md" className="w-9 h-9 shrink-0" />
          <ScouticaWordmark size="sm" className={cn("ml-3", labelCls)} />
        </Link>
        {onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={pinned ? t("collapse") : t("expand")}
            title={pinned ? t("collapse") : t("expand")}
            className={cn(
              "ml-auto hidden lg:inline-flex h-8 w-8 items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--rule-strong)]",
              pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100",
            )}
          >
            {pinned ? (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <ul className="space-y-0.5">{primaryItems.map(renderItem)}</ul>

        {secondaryItems.length > 0 && (
          <>
            <div className="my-3 mx-3 hairline-t" />
            <ul className="space-y-0.5">{secondaryItems.map(renderItem)}</ul>
          </>
        )}
      </nav>

      <div className="hairline-t p-2 shrink-0 space-y-0.5">
        <ThemeToggle
          showLabel
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-colors duration-200 overflow-hidden"
        />
        <LanguageSwitcher
          labelCls={labelCls}
          onSwitch={() => {
            const next = locale === "it" ? "en" : "it";
            const pathParts = pathname.split("/").slice(2).join("/");
            router.replace(("/" + pathParts) as never, { locale: next } as never);
          }}
        />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-colors duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--rule-strong)]"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className={labelCls}>{t("logout")}</span>
        </button>

        <Link
          href={profileHref}
          className="flex items-center gap-3 px-3 py-3 hairline-t overflow-hidden hover:bg-[var(--bg-soft)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--rule-strong)]"
        >
          <div className="flex h-8 w-8 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] text-[var(--ink)] text-xs font-semibold shrink-0">
            {initial}
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-opacity duration-200",
              pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100",
            )}
          >
            <p className="flex items-center gap-1 text-sm font-medium text-[var(--ink)]">
              <span className="truncate">{session.user.name}</span>
              {verified && (
                <BadgeCheck
                  className="h-3.5 w-3.5 shrink-0 text-[var(--ink)]"
                  aria-label={t("verified")}
                />
              )}
            </p>
            {score !== null ? (
              <div className="mt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-[var(--ink-3)]">
                    {session.user.email}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-[var(--ink-2)]">
                    {score}%
                  </span>
                </div>
                <div className="mt-1 h-px w-full bg-[var(--rule)]">
                  <div
                    className="h-full bg-[var(--ink)] transition-[width] duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="truncate text-[11px] text-[var(--ink-3)]">
                {session.user.email}
              </p>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}

function LanguageSwitcher({
  onSwitch,
  labelCls,
}: {
  onSwitch: () => void;
  labelCls?: string;
}) {
  const t = useTranslations("nav");
  return (
    <button
      onClick={onSwitch}
      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-colors duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--rule-strong)]"
      title={t("switchToOtherLang")}
    >
      <Globe className="h-[18px] w-[18px] shrink-0" />
      <span className={cn("whitespace-nowrap transition-opacity duration-200", labelCls)}>
        {t("otherLangName")}
      </span>
    </button>
  );
}
