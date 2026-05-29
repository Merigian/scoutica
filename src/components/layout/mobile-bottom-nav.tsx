"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { User, Search, Megaphone, MessageSquare, Bell, Building2, Inbox, FileText, Kanban } from "lucide-react";
import { UnreadBadge } from "@/components/shared/unread-badge";

const MODEL_TABS = [
  { key: "dashboard", href: "/model/home", icon: User },
  { key: "opportunities", href: "/model/castings", icon: Megaphone },
  { key: "applications", href: "/model/applications", icon: FileText },
  { key: "requests", href: "/model/contacts", icon: Inbox },
  { key: "messages", href: "/model/messages", icon: MessageSquare },
];

const SCOUT_TABS = [
  { key: "talentSearch", href: "/scout/discover", icon: Search },
  { key: "boards", href: "/scout/boards", icon: Kanban },
  { key: "postings", href: "/scout/castings", icon: Megaphone },
  { key: "messages", href: "/scout/messages", icon: MessageSquare },
  { key: "settings", href: "/scout/settings", icon: User },
];

const STUDIO_TABS = [
  { key: "studios", href: "/studio/studios", icon: Building2 },
  { key: "inquiries", href: "/studio/inquiries", icon: Inbox },
  { key: "messages", href: "/studio/messages", icon: MessageSquare },
  { key: "notifications", href: "/studio/notifications", icon: Bell },
];

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (!session?.user) return null;
  if (session.user.role === "ADMIN") return null;

  const tabs = session.user.role === "MODEL"
    ? MODEL_TABS
    : session.user.role === "STUDIO"
      ? STUDIO_TABS
      : SCOUT_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 hairline-t bg-[var(--bg)] lg:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href as never}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 transition-colors relative",
                isActive ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
              )}
            >
              {isActive && (
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
      </div>
    </nav>
  );
}
