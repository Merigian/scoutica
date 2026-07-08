"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * iOS-style condensing header behavior. Renders a layout-neutral sentinel at
 * the page's large title and portals a compact copy of the title into the
 * sticky mobile header (slot `#scoutica-condensed-title` in `Header`). The
 * compact title fades in once the large title scrolls under the header; the
 * brand lockup crossfades out via the `[data-condensed]` CSS in globals.css.
 * Inert on desktop (the slot is `lg:hidden`) and on pages without the
 * dashboard header (no slot found).
 */
export function CondensedTitle({ title }: { title: string }) {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    setSlot(document.getElementById("scoutica-condensed-title"));
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Condensed only when the sentinel has scrolled up past the h-14
        // header, not when it merely sits below the fold.
        setCondensed(!entry.isIntersecting && entry.boundingClientRect.top < 56);
      },
      { rootMargin: "-56px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute h-px w-px"
      />
      {slot &&
        createPortal(
          <span
            aria-hidden
            data-condensed={condensed}
            className={cn(
              "max-w-full truncate pr-2 font-label text-[13px] font-medium tracking-[0.02em] text-[var(--ink)] transition-opacity duration-200",
              condensed ? "opacity-100" : "opacity-0",
            )}
          >
            {title}
          </span>,
          slot,
        )}
    </>
  );
}
