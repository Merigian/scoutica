"use client";

import { useState, type ReactNode } from "react";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { ActionSheet } from "@/components/ui/action-sheet";

interface ConfirmSheetOptions {
  /** The confirmation question (also the native confirm() copy on desktop). */
  title: string;
  /** Destructive row label (e.g. "Elimina"). */
  actionLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

/**
 * Destructive-confirm adapter: iOS action sheet below `lg`, unchanged native
 * `confirm()` at desktop. Render `confirmSheet` once in the component tree and
 * call `requestConfirm` from handlers.
 */
export function useConfirmSheet(): {
  confirmSheet: ReactNode;
  requestConfirm: (opts: ConfirmSheetOptions) => void;
} {
  const isDesktop = useIsDesktop();
  const [pending, setPending] = useState<ConfirmSheetOptions | null>(null);

  const requestConfirm = (opts: ConfirmSheetOptions) => {
    if (isDesktop) {
      if (window.confirm(opts.title)) opts.onConfirm();
      return;
    }
    setPending(opts);
  };

  const confirmSheet = (
    <ActionSheet
      open={!!pending}
      onClose={() => setPending(null)}
      title={pending?.title}
      cancelLabel={pending?.cancelLabel ?? ""}
      actions={
        pending
          ? [
              {
                key: "confirm",
                label: pending.actionLabel,
                destructive: true,
                onSelect: pending.onConfirm,
              },
            ]
          : []
      }
    />
  );

  return { confirmSheet, requestConfirm };
}
