"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { UnreadBadge } from "@/components/shared/unread-badge";
import {
  House,
  Megaphone,
  ChatCircle,
  MagnifyingGlass,
  CalendarBlank,
  Plus,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

type Role = "model" | "scout" | "studio";

type Slot =
  | { type: "link"; key: string; href: string; icon: PhosphorIcon; badge?: boolean }
  | { type: "center"; key: string; href: string }
  | { type: "avatar"; href: string };

const SLOTS: Record<Role, Slot[]> = {
  model: [
    { type: "link", key: "home", href: "/model/home", icon: House },
    { type: "link", key: "discover", href: "/model/discover", icon: MagnifyingGlass },
    { type: "link", key: "castings", href: "/model/castings", icon: Megaphone },
    { type: "link", key: "messages", href: "/model/messages", icon: ChatCircle, badge: true },
    { type: "avatar", href: "/model/account" },
  ],
  scout: [
    { type: "link", key: "home", href: "/scout/home", icon: House },
    { type: "link", key: "talents", href: "/scout/discover", icon: MagnifyingGlass },
    { type: "center", key: "newCasting", href: "/scout/castings/new" },
    { type: "link", key: "messages", href: "/scout/messages", icon: ChatCircle, badge: true },
    { type: "avatar", href: "/scout/account" },
  ],
  studio: [
    { type: "link", key: "home", href: "/studio/home", icon: House },
    { type: "link", key: "bookings", href: "/studio/bookings", icon: CalendarBlank },
    { type: "center", key: "newStudio", href: "/studio/studios/new" },
    { type: "link", key: "messages", href: "/studio/messages", icon: ChatCircle, badge: true },
    { type: "avatar", href: "/studio/account" },
  ],
} as const satisfies Record<Role, Slot[]>;

/** Destinations owned by the tab bar — the drawer (overflow menu) hides these. */
export function tabBarHrefs(role: string): string[] {
  const slots = SLOTS[role as Role];
  if (!slots) return [];
  return slots.filter((s) => s.type !== "center").map((s) => s.href);
}

/* Per-tab scroll persistence (native tab-bar behavior): the offset of the tab
   root you leave is remembered for the session and restored when you return
   to it via the tab bar. */
const TAB_SCROLL_PREFIX = "scoutica:tab-scroll:";

function saveScroll(pathname: string) {
  try {
    sessionStorage.setItem(TAB_SCROLL_PREFIX + pathname, String(window.scrollY));
  } catch {
    /* sessionStorage unavailable — skip */
  }
}

function readScroll(pathname: string): number {
  try {
    return Number(sessionStorage.getItem(TAB_SCROLL_PREFIX + pathname)) || 0;
  } catch {
    return 0;
  }
}

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("nav");
  const pendingRestore = useRef<string | null>(null);

  // Restore the saved offset after a tab-bar navigation lands. Retries while
  // the route is still streaming in (loading.tsx skeletons are shorter than
  // the final content), then gives up quietly.
  useEffect(() => {
    const href = pendingRestore.current;
    if (!href || !pathname.endsWith(href)) return;
    pendingRestore.current = null;
    const target = readScroll(pathname);
    if (!target) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tryRestore = () => {
      if (
        document.documentElement.scrollHeight - window.innerHeight >= target
      ) {
        window.scrollTo(0, target);
      } else if (attempts++ < 20) {
        timer = setTimeout(tryRestore, 50);
      }
    };
    const raf = requestAnimationFrame(tryRestore);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!session?.user) return null;
  const role = session.user.role.toLowerCase();
  if (role !== "model" && role !== "scout" && role !== "studio") return null;

  // Hide the tab bar while a conversation is open on mobile (full-height chat, like a social app).
  if (pathname.includes("/messages") && searchParams.get("chat")) return null;

  const slots = SLOTS[role as Role];
  const isActive = (href: string) => pathname.includes(href);

  const handleTabClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      saveScroll(pathname);
      if (pathname.endsWith(href)) {
        // Re-tapping the current tab scrolls its root back to top (iOS).
        e.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      pendingRestore.current = href;
    };

  return (
    <nav
      data-bottom-nav
      className="fixed bottom-0 left-0 right-0 z-40 hairline-t bg-[var(--bg)]/95 backdrop-blur-sm lg:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label={t("dashboard")}
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5">
        {slots.map((slot) => {
          if (slot.type === "center") {
            return (
              <Link
                key={slot.key}
                href={slot.href as never}
                onClick={handleTabClick(slot.href)}
                aria-label={t(slot.key as never)}
                className="flex flex-1 flex-col items-center justify-start"
              >
                <span className="flex h-12 w-12 -translate-y-3 items-center justify-center bg-[var(--ink)] text-[var(--bg)] ring-4 ring-[var(--bg)] transition-transform duration-150 active:scale-95">
                  <Plus className="h-6 w-6" weight="bold" />
                </span>
                <span className="-mt-2 text-[10px] leading-none text-[var(--ink-3)]">
                  {t(slot.key as never)}
                </span>
              </Link>
            );
          }

          if (slot.type === "avatar") {
            const active = isActive(slot.href);
            return (
              <Link
                key="avatar"
                href={slot.href as never}
                onClick={handleTabClick(slot.href)}
                aria-label={t("profile")}
                aria-current={active ? "page" : undefined}
                className="group flex flex-1 flex-col items-center gap-1 py-1"
              >
                <span
                  key={String(active)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-150 group-active:scale-90",
                    active &&
                      "animate-tab-settle ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]",
                  )}
                >
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size="sm"
                    className="h-7 w-7 text-[10px]"
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    active ? "text-[var(--ink)]" : "text-[var(--ink-3)]",
                  )}
                >
                  {t("profile")}
                </span>
              </Link>
            );
          }

          const active = isActive(slot.href);
          const Icon = slot.icon;
          return (
            <Link
              key={slot.key}
              href={slot.href as never}
              onClick={handleTabClick(slot.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex flex-1 flex-col items-center gap-1 py-1 transition-colors",
                active ? "text-[var(--ink)]" : "text-[var(--ink-3)]",
              )}
            >
              <span
                key={String(active)}
                className={cn(
                  "relative transition-transform duration-150 group-active:scale-90",
                  active && "animate-tab-settle",
                )}
              >
                <Icon className="h-[26px] w-[26px]" weight={active ? "fill" : "regular"} />
                {slot.badge && <UnreadBadge />}
              </span>
              <span className="text-[10px] leading-none text-current">
                {t(slot.key as never)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
