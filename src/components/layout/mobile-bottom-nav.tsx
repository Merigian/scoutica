"use client";

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

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("nav");

  if (!session?.user) return null;
  const role = session.user.role.toLowerCase();
  if (role !== "model" && role !== "scout" && role !== "studio") return null;

  // Hide the tab bar while a conversation is open on mobile (full-height chat, like a social app).
  if (pathname.includes("/messages") && searchParams.get("chat")) return null;

  const slots = SLOTS[role as Role];
  const isActive = (href: string) => pathname.includes(href);

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
                aria-label={t(slot.key as never)}
                className="flex flex-1 flex-col items-center justify-start"
              >
                <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] shadow-lg shadow-black/20 transition-transform active:scale-95">
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
                aria-label={t("profile")}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1 py-1"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                    active && "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]",
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
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1 transition-colors",
                active ? "text-[var(--ink)]" : "text-[var(--ink-3)]",
              )}
            >
              <span className="relative">
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
