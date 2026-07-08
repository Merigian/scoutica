"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { NAV_ITEMS } from "@/config/site";
import { Avatar } from "@/components/ui/avatar";
import { UnreadBadge } from "@/components/shared/unread-badge";
import {
  House,
  Images,
  Megaphone,
  ClipboardText,
  BookmarkSimple,
  Tray,
  ChatCircle,
  ShieldCheck,
  SealCheck,
  Bell,
  CreditCard,
  Gear,
  MagnifyingGlass,
  Kanban,
  Buildings,
  CalendarBlank,
  Users,
  Flag,
  Sun,
  Moon,
  Translate,
  SignOut,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

/** NAV_ITEMS icon-name (lucide string) -> Phosphor icon, to match the new mobile look. */
const ICONS: Record<string, PhosphorIcon> = {
  LayoutDashboard: House,
  Images,
  Megaphone,
  FileText: ClipboardText,
  Bookmark: BookmarkSimple,
  Inbox: Tray,
  MessageSquare: ChatCircle,
  ShieldCheck,
  BadgeCheck: SealCheck,
  Bell,
  CreditCard,
  Settings: Gear,
  Search: MagnifyingGlass,
  Kanban,
  Building2: Buildings,
  CalendarDays: CalendarBlank,
  Users,
  Flag,
};

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  hideVerification?: boolean;
}

export function MobileMenu({ open, onClose, hideVerification = false }: MobileMenuProps) {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useBodyScrollLock(open);

  if (!session?.user) return null;

  const role = session.user.role.toLowerCase() as keyof typeof NAV_ITEMS;
  const items = (NAV_ITEMS[role] || []).filter(
    (item) => !(hideVerification && item.key === "verification"),
  );
  const isDark = theme !== "light";
  const accountHref = role === "admin" ? undefined : `/${role}/account`;

  const switchLocale = () => {
    const next = locale === "it" ? "en" : "it";
    router.replace(pathname as never, { locale: next } as never);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut({ redirect: false });
    router.push("/login" as never);
  };

  const identity = (
    <>
      <Avatar src={session.user.image} name={session.user.name} size="md" />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-[var(--ink)]">{session.user.name}</p>
        <p className="truncate text-[12px] text-[var(--ink-3)]">{session.user.email}</p>
      </div>
    </>
  );

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label={t("close")}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[84%] max-w-[330px] flex-col bg-[var(--bg-elevated)] hairline-r",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4 hairline-b">
          <span className="text-eyebrow">{t("menu")}</span>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* User row -> profile */}
          {accountHref ? (
            <Link
              href={accountHref as never}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-4 hairline-b transition-colors hover:bg-[var(--bg-soft)]"
            >
              {identity}
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4 hairline-b">{identity}</div>
          )}

          {/* Full navigation */}
          <nav className="py-2">
            {items.map((item) => {
              const Icon = ICONS[item.icon] ?? House;
              const active = pathname.includes(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href as never}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 text-[15px] transition-colors",
                    active
                      ? "bg-[var(--bg-soft)] font-medium text-[var(--ink)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]",
                  )}
                >
                  <span className="relative shrink-0">
                    <Icon className="h-[22px] w-[22px]" weight={active ? "fill" : "regular"} />
                    {item.key === "messages" && <UnreadBadge />}
                  </span>
                  <span className="flex-1">{t(item.key as never)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Preferences */}
          <div className="mt-1 hairline-t py-2">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex w-full items-center gap-4 px-4 py-3 text-[15px] text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
            >
              {mounted && isDark ? (
                <Sun className="h-[22px] w-[22px] shrink-0" />
              ) : (
                <Moon className="h-[22px] w-[22px] shrink-0" />
              )}
              <span className="flex-1 text-left">{tAccount("appearance")}</span>
              <span className="text-meta text-[var(--ink-3)]">
                {mounted ? (isDark ? tAccount("themeDark") : tAccount("themeLight")) : ""}
              </span>
            </button>
            <button
              type="button"
              onClick={switchLocale}
              className="flex w-full items-center gap-4 px-4 py-3 text-[15px] text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
            >
              <Translate className="h-[22px] w-[22px] shrink-0" />
              <span className="flex-1 text-left">{tAccount("language")}</span>
              <span className="text-meta uppercase text-[var(--ink-3)]">
                {locale === "it" ? "Italiano" : "English"}
              </span>
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="shrink-0 hairline-t p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 hairline border-[var(--rule-strong)] px-4 py-3 text-sm font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
          >
            <SignOut className="h-[18px] w-[18px]" weight="bold" />
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
