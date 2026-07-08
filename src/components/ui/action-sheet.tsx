"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export interface ActionSheetAction {
  key: string;
  label: string;
  /** Optional leading icon (Phosphor, 22px, per mobile-chrome convention). */
  icon?: ReactNode;
  /** Renders the row in `--danger` (destructive convention). */
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional context line (e.g. the confirmation question). */
  title?: string;
  actions: ActionSheetAction[];
  /** Cancel row label — required so every sheet is dismissable in-copy. */
  cancelLabel: string;
}

/**
 * iOS-style action sheet on the editorial BottomSheet: stacked full-bleed
 * rows, destructive rows in `--danger`, Cancel separated by a thicker rule.
 * Mobile-only by nature (BottomSheet is `lg:hidden`) — desktop call sites
 * keep their existing affordances.
 */
export function ActionSheet({
  open,
  onClose,
  title,
  actions,
  cancelLabel,
}: ActionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} ariaLabel={title ?? cancelLabel}>
      <div className="-mx-5">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            disabled={action.disabled}
            onClick={() => {
              onClose();
              action.onSelect();
            }}
            className={cn(
              "flex min-h-14 w-full items-center gap-4 px-5 text-left text-[15px] hairline-t transition-colors active:bg-[var(--bg-soft)]",
              "disabled:pointer-events-none disabled:opacity-40",
              action.destructive ? "text-[var(--danger)]" : "text-[var(--ink)]",
            )}
          >
            {action.icon && <span className="shrink-0">{action.icon}</span>}
            <span className="flex-1">{action.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-14 w-full items-center justify-center border-t-2 border-[var(--rule-strong)] px-5 text-[15px] font-medium text-[var(--ink)] transition-colors active:bg-[var(--bg-soft)]"
        >
          {cancelLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
