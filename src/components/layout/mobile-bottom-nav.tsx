"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/site";
import {
  Search,
  Megaphone,
  MessageSquare,
  Bell,
  Building2,
  Inbox,
  FileText,
  Kanban,
  LayoutDashboard,
  Images,
  Bookmark,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  Settings,
  CalendarDays,
  Users,
  Flag,
  MoreHorizontal,
  X,
} from "lucide-react";
import { UnreadBadge } from "@/components/shared/unread-badge";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Images,
  Megaphone,
  FileText,
  Bookmark,
  Inbox,
  MessageSquare,
  ShieldCheck,
  BadgeCheck,
  Bell,
  CreditCard,
  Settings,
  Search,
  Kanban,
  Building2,
  CalendarDays,
  Users,
  Flag,
};

type Tab = { key: string; href: string; icon: React.ElementType };

const MODEL_PRIMARY: Tab[] = [
  { key: "dashboard", href: "/model/home", icon: LayoutDashboard },
  { key: "opportunities", href: "/model/castings", icon: Megaphone },
  { key: "applications", href: "/model/applications", icon: FileText },
  { key: "messages", href: "/model/messages", icon: MessageSquare },
];

const SCOUT_PRIMARY: Tab[] = [
  { key: "talentSearch", href: "/scout/discover", icon: Search },
  { key: "boards", href: "/scout/boards", icon: Kanban },
  { key: "postings", href: "/scout/castings", icon: Megaphone },
  { key: "messages", href: "/scout/messages", icon: MessageSquare },
];

const STUDIO_PRIMARY: Tab[] = [
  { key: "dashboard", href: "/studio/home", icon: LayoutDashboard },
  { key: "bookings", href: "/studio/bookings", icon: CalendarDays },
  { key: "inquiries", href: "/studio/inquiries", icon: Inbox },
  { key: "messages", href: "/studio/messages", icon: MessageSquare },
];

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [moreOpen, setMoreOpen] = useState(false);

  if (!session?.user) return null;
  const role = session.user.role;
  if (role === "ADMIN") return null;

  const primary =
    role === "MODEL"
      ? MODEL_PRIMARY
      : role === "STUDIO"
        ? STUDIO_PRIMARY
        : SCOUT_PRIMARY;

  const navKey = (
    role === "MODEL" ? "model" : role === "STUDIO" ? "studio" : "scout"
  ) as keyof typeof NAV_ITEMS;
  const primaryHrefs = new Set(primary.map((p) => p.href));
  const moreItems = NAV_ITEMS[navKey].filter((i) => !primaryHrefs.has(i.href));

  const isActive = (href: string) => pathname.includes(href);

  return (
    <>
      {/* "More" sheet — surfaces every nav item so nothing is mobile-unreachable */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40 animate-fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-elevated)] hairline-t pb-[env(safe-area-inset-bottom)] animate-fade-in-up">
            <div className="flex items-center justify-between px-5 py-4 hairline-b">
              <span className="text-eyebrow">{t("more")}</span>
              <button
                type="button"
                aria-label={t("close")}
                onClick={() => setMoreOpen(false)}
                className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid grid-cols-3 gap-px bg-[var(--rule)]">
              {moreItems.map((item) => {
                const Icon = ICONS[item.icon] ?? Settings;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href as never}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 bg-[var(--bg-elevated)] px-2 py-5 text-center transition-colors",
                      active
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-3)] hover:text-[var(--ink)]",
                    )}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.key === "messages" && <UnreadBadge />}
                    </span>
                    <span className="text-[11px] leading-tight">
                      {t(item.key as never)}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 hairline-t bg-[var(--bg)] lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2 px-1">
          {primary.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href as never}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 transition-colors relative",
                  active ? "text-[var(--ink)]" : "text-[var(--ink-3)]",
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--ink)]" />
                )}
                <span className="relative">
                  <tab.icon className="h-5 w-5" />
                  {tab.key === "messages" && <UnreadBadge />}
                </span>
                <span className="text-[10px] text-current">
                  {t(tab.key as never)}
                </span>
              </Link>
            );
          })}

          {/* More trigger */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 transition-colors",
              moreOpen ? "text-[var(--ink)]" : "text-[var(--ink-3)]",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px]">{t("more")}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
