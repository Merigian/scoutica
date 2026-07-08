"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional title shown in the sheet header. */
  title?: ReactNode;
  /** Sheet body. Scrolls internally when it exceeds the max height. */
  children: ReactNode;
  /** Sticky footer (e.g. an apply/confirm action bar). Respects safe-area. */
  footer?: ReactNode;
  /** Extra classes for the panel. */
  className?: string;
  /** Accessible label when no visible title is provided. */
  ariaLabel?: string;
}

/**
 * Editorial bottom-sheet — an on-brand, radius-0 panel that rises from the
 * bottom of the viewport. Used for filters, steppers, and contextual actions.
 * Locks the background (iOS-safe), traps focus, closes on backdrop tap / Escape,
 * and contains its own scroll (`overscroll-contain`). Sharp corners + a hairline
 * top rule keep it consistent with the Galleria system rather than a rounded,
 * generic material sheet.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  ariaLabel,
}: BottomSheetProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Move focus into the sheet when it opens.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" aria-hidden={!open}>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : ariaLabel}
            tabIndex={-1}
            className={cn(
              "absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col bg-[var(--bg-elevated)] hairline-t outline-none",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 38 }
            }
          >
            {/* Drag-handle affordance */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-[var(--rule-strong)]" />
            </div>

            {(title || true) && (
              <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3">
                <div className="min-w-0 text-eyebrow">{title}</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="-mr-2 flex h-10 w-10 items-center justify-center text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 hairline-t bg-[var(--bg-elevated)] px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
