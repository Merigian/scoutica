"use client";

import type { ReactNode } from "react";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading — DialogTitle on desktop, sheet header below `lg`. */
  title?: string;
  /** Supporting copy under the title. */
  description?: string;
  children: ReactNode;
  /** Sticky action bar. On mobile it pins above the home indicator. */
  footer?: ReactNode;
  /** Extra classes for the desktop DialogContent panel. */
  desktopClassName?: string;
  /** Extra classes for the mobile sheet panel. */
  sheetClassName?: string;
  /** Accessible label when no visible title is provided. */
  ariaLabel?: string;
}

/**
 * The modal adapter for the mobile overhaul: centered editorial Dialog at the
 * `lg` shell boundary and above, spring-animated drag-dismissable BottomSheet
 * below it. Overlays only ever open from user interaction, so branching on the
 * runtime viewport is hydration-safe.
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  desktopClassName,
  sheetClassName,
  ariaLabel,
}: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onClose={() => onOpenChange(false)}
          className={desktopClassName}
        >
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      footer={footer}
      className={sheetClassName}
      ariaLabel={ariaLabel ?? title}
    >
      {description && (
        <p className="mb-4 text-body text-[var(--ink-2)]">{description}</p>
      )}
      {children}
    </BottomSheet>
  );
}
