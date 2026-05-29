"use client";

import { useTranslations } from "next-intl";
import {
  Archive,
  ArchiveRestore,
  BellOff,
  Bell,
  Flag,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MenuAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ConversationActionsMenuProps {
  hasProfile: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  onOpenProfile?: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onToggleMute: () => void;
  onReport: () => void;
  onDelete: () => void;
}

export function ConversationActionsMenu({
  hasProfile,
  isPinned,
  isArchived,
  isMuted,
  onOpenProfile,
  onTogglePin,
  onToggleArchive,
  onToggleMute,
  onReport,
  onDelete,
}: ConversationActionsMenuProps) {
  const t = useTranslations("components.messaging");
  const [open, setOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState<"delete" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirmKey(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirmKey(null);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const actions: MenuAction[] = [
    ...(hasProfile && onOpenProfile
      ? [
          {
            key: "profile",
            label: t("goToProfile"),
            icon: UserRound,
            onSelect: () => {
              setOpen(false);
              onOpenProfile();
            },
          },
        ]
      : []),
    {
      key: "pin",
      label: isPinned ? t("unpin") : t("pin"),
      icon: isPinned ? PinOff : Pin,
      onSelect: () => {
        onTogglePin();
        setOpen(false);
      },
    },
    {
      key: "archive",
      label: isArchived ? t("unarchive") : t("archive"),
      icon: isArchived ? ArchiveRestore : Archive,
      onSelect: () => {
        onToggleArchive();
        setOpen(false);
      },
    },
    {
      key: "mute",
      label: isMuted ? t("unmute") : t("mute"),
      icon: isMuted ? Bell : BellOff,
      onSelect: () => {
        onToggleMute();
        setOpen(false);
      },
    },
    {
      key: "report",
      label: t("report"),
      icon: Flag,
      onSelect: () => {
        onReport();
        setOpen(false);
      },
    },
    {
      key: "delete",
      label: t("deleteChat"),
      icon: Trash2,
      onSelect: () => {
        setConfirmKey("delete");
      },
      destructive: true,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("actions")}
        className={cn(
          "flex h-9 w-9 items-center justify-center transition-colors",
          "text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("actions")}
          className={cn(
            "absolute right-0 top-full z-30 mt-1 w-64",
            "bg-[var(--bg)] hairline shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
          )}
        >
          {confirmKey === "delete" ? (
            <div className="p-4">
              <p className="text-[13px] leading-[1.5] text-[var(--ink)]">
                {t("confirmDelete")}
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmKey(null)}
                  className="px-3 py-1.5 text-[12px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmKey(null);
                    setOpen(false);
                    onDelete();
                  }}
                  className="bg-[var(--ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-elevated)] hover:bg-[var(--ink-2)] transition-colors"
                >
                  {t("confirm")}
                </button>
              </div>
            </div>
          ) : (
            <ul className="py-1">
              {actions.map((a, idx) => {
                const Icon = a.icon;
                const showDivider =
                  idx > 0 &&
                  (a.destructive || a.key === "report") &&
                  !actions[idx - 1].destructive &&
                  actions[idx - 1].key !== "report";
                return (
                  <li key={a.key}>
                    {showDivider && (
                      <div className="my-1 h-px bg-[var(--rule)]" />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={a.onSelect}
                      disabled={a.disabled}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px]",
                        "hover:bg-[var(--bg-soft)] transition-colors",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        a.destructive
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{a.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
