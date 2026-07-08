"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  label: string;
  /**
   * When true (default) the mobile back affordance is a 44px chevron portaled
   * into the sticky dashboard header (slot `#scoutica-header-back`), where it
   * replaces the drawer trigger — the iOS pushed-screen pattern. The inline
   * pill then renders on desktop only. Pass false on pages outside the
   * dashboard shell (e.g. marketing), which keep the inline pill everywhere.
   */
  barMode?: boolean;
}

export function BackLink({ href, label, barMode = true }: BackLinkProps) {
  const router = useRouter();
  const [barSlot, setBarSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!barMode) return;
    setBarSlot(document.getElementById("scoutica-header-back"));
  }, [barMode]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Keep native behaviour for modifier / middle clicks (open in new tab, etc.).
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    // When there is in-app history, go back through it so the previous page's
    // scroll position is restored instead of jumping to the top. Falls back to
    // the explicit href (e.g. when the page was opened directly).
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <>
      <Link
        href={href as never}
        onClick={handleClick}
        className={cn(
          "items-center gap-1.5 text-sm font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-all bg-[var(--bg-soft)]/60 hover:bg-[var(--bg-soft)] px-3 py-1.5 w-fit mb-4",
          barMode ? "hidden lg:inline-flex" : "inline-flex min-h-11 lg:min-h-0",
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {label}
      </Link>
      {barSlot &&
        createPortal(
          <Link
            href={href as never}
            onClick={handleClick}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center text-[var(--ink)]"
          >
            <CaretLeft className="h-6 w-6" />
          </Link>,
          barSlot,
        )}
    </>
  );
}
