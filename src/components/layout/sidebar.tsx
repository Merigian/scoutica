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
} from "lucide-react";
import { signOut } from "next-auth/react";
import { UnreadBadge } from "@/components/shared/unread-badge";
import { LogoMark } from "@/components/ui/logo-mark";
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

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();

  if (!session?.user) return null;

  const role = session.user.role.toLowerCase() as "model" | "scout" | "studio" | "admin";
  const navItems = NAV_ITEMS[role] || [];
  const primaryItems = navItems.filter((item) => !SECONDARY_KEYS.has(item.key));
  const secondaryItems = navItems.filter((item) => SECONDARY_KEYS.has(item.key));

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login" as never);
  };

  return (
    <aside className="group/sidebar hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:w-[68px] hover:lg:w-64 lg:hairline-r lg:bg-[var(--bg)] lg:transition-all lg:duration-200 lg:ease-out overflow-hidden">
      <div className="flex h-14 items-center hairline-b px-4 shrink-0">
        <Link href={"/dashboard" as never} className="flex items-center overflow-hidden text-[var(--ink)]" aria-label="Scoutica">
          <LogoMark size="md" className="w-9 h-9" />
          <span className="ml-3 text-eyebrow text-[var(--ink-3)] whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            Scoutica
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <ul className="space-y-0.5">
          {primaryItems.map((item) => {
            const Icon = iconMap[item.icon] || User;
            const isActive = pathname.includes(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href as never}
                  title={t(item.key as never)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                    isActive
                      ? "border-l-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--bg-soft)]"
                      : "border-l-2 border-transparent text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
                  )}
                >
                  <span className="relative shrink-0">
                    <Icon className="h-[18px] w-[18px]" />
                    {item.key === "messages" && <UnreadBadge />}
                  </span>
                  <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                    {t(item.key as never)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {secondaryItems.length > 0 && (
          <>
            <div className="my-3 mx-3 hairline-t" />
            <ul className="space-y-0.5">
              {secondaryItems.map((item) => {
                const Icon = iconMap[item.icon] || User;
                const isActive = pathname.includes(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href as never}
                      title={t(item.key as never)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                        isActive
                          ? "border-l-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--bg-soft)]"
                          : "border-l-2 border-transparent text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                        {t(item.key as never)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      <div className="hairline-t p-2 shrink-0 space-y-0.5">
        <ThemeToggle
          showLabel
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-all duration-200 overflow-hidden"
        />
        <LanguageSwitcher
          locale={locale}
          onSwitch={() => {
            const next = locale === "it" ? "en" : "it";
            const pathParts = pathname.split("/").slice(2).join("/");
            router.replace(("/" + pathParts) as never, { locale: next } as never);
          }}
        />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-all duration-200 overflow-hidden"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            {t("logout")}
          </span>
        </button>
        <div className="flex items-center gap-3 px-3 py-3 hairline-t overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] text-[var(--ink)] text-xs font-semibold shrink-0">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            <p className="truncate text-sm font-medium text-[var(--ink)]">{session.user.name}</p>
            <p className="truncate text-[11px] text-[var(--ink-3)]">{session.user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LanguageSwitcher({ locale, onSwitch }: { locale: string; onSwitch: () => void }) {
  const t = useTranslations("nav");
  return (
    <button
      onClick={onSwitch}
      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-all duration-200 overflow-hidden"
      title={t("switchToOtherLang")}
    >
      <Globe className="h-[18px] w-[18px] shrink-0" />
      <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        {t("otherLangName")}
      </span>
    </button>
  );
}
