"use client";

import { useLocale, useTranslations } from "next-intl";
import { Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { formatListTimestamp } from "./format";
import { useConversationPrefs } from "./use-conversation-prefs";
import type { ConversationSummary, ViewerRole } from "./types";

type Filter = "all" | "unread" | "pinned" | "archived";

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewGroup?: () => void;
  viewerRole: ViewerRole;
  currentUserId: string;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewGroup,
  viewerRole,
  currentUserId,
}: ConversationSidebarProps) {
  const t = useTranslations("components.messaging");
  const locale = useLocale();
  const prefs = useConversationPrefs();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const list = conversations.filter((c) => {
      const pinned = prefs.isPinned(c.id);
      const archived = prefs.isArchived(c.id);

      if (filter === "archived" && !archived) return false;
      if (filter !== "archived" && archived) return false;
      if (filter === "unread" && !c.hasUnread) return false;
      if (filter === "pinned" && !pinned) return false;

      if (trimmed.length > 0) {
        const name = c.otherUser.name.toLowerCase();
        const body = (c.lastMessage?.body ?? "").toLowerCase();
        if (!name.includes(trimmed) && !body.includes(trimmed)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      const pa = prefs.isPinned(a.id) ? 1 : 0;
      const pb = prefs.isPinned(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });

    return list;
  }, [conversations, query, filter, prefs]);

  const unreadCount = useMemo(
    () => conversations.filter((c) => c.hasUnread && !prefs.isArchived(c.id)).length,
    [conversations, prefs]
  );

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: t("filterAll") },
    { key: "unread", label: t("filterUnread"), count: unreadCount },
    { key: "pinned", label: t("filterPinned") },
    { key: "archived", label: t("filterArchived") },
  ];

  return (
    <aside
      aria-label={t("title")}
      className="flex h-full min-h-0 flex-col bg-[var(--bg)]"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-6 pb-3">
        <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--ink)]">
          {t("title")}
        </h2>
        {viewerRole === "SCOUT" && onNewGroup && (
          <button
            type="button"
            onClick={onNewGroup}
            aria-label={t("newGroup")}
            title={t("newGroup")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)]/70"
          >
            <Users className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className={cn(
              "h-11 w-full rounded-xl border-0 bg-[var(--bg-soft)] pl-10 pr-11 text-[14px]",
              "placeholder:text-[var(--ink-3)] text-[var(--ink)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors lg:min-h-0",
                  active
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--bg-soft)] text-[var(--ink-2)] hover:bg-[var(--bg-soft)]/70 hover:text-[var(--ink)]"
                )}
              >
                {f.label}
                {typeof f.count === "number" && f.count > 0 && (
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "text-white/80" : "text-[var(--accent)]"
                    )}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4" role="list">
        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[13px] font-medium text-[var(--ink-2)]">
              {query || filter !== "all" ? t("noResults") : t("noConversations")}
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[var(--ink-3)]">
              {query || filter !== "all"
                ? t("noResultsDesc")
                : t("noConversationsDesc")}
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {visible.map((c) => {
              const isActive = activeId === c.id;
              const showUnread = c.hasUnread && !isActive;
              const preview = c.lastMessage
                ? c.lastMessage.senderId === currentUserId
                  ? `${locale.startsWith("it") ? "Tu" : "You"}: ${c.lastMessage.body}`
                  : c.lastMessage.body
                : "";

              return (
                <li key={c.id} role="listitem">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-[var(--bg-soft)]"
                        : "hover:bg-[var(--bg-soft)]/60"
                    )}
                  >
                    <div className="relative shrink-0">
                      {c.isGroup ? (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--ink-2)]">
                          <Users className="h-5 w-5" />
                        </span>
                      ) : (
                        <Avatar
                          src={c.otherUser.image}
                          name={c.otherUser.name}
                          size="md"
                        />
                      )}
                      {showUnread && (
                        <span
                          aria-label="unread"
                          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg)]"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p
                          className={cn(
                            "truncate text-[14px]",
                            showUnread
                              ? "font-semibold text-[var(--ink)]"
                              : "font-medium text-[var(--ink)]"
                          )}
                        >
                          {c.otherUser.name}
                        </p>
                        {c.lastMessage && (
                          <span className="shrink-0 text-[11px] tabular-nums text-[var(--ink-3)]">
                            {formatListTimestamp(c.lastMessage.createdAt, locale)}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 truncate text-[12.5px] leading-[1.45]",
                          showUnread
                            ? "text-[var(--ink-2)] font-medium"
                            : "text-[var(--ink-3)]"
                        )}
                      >
                        {preview || (
                          <span className="italic">{t("emptyThread")}</span>
                        )}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

