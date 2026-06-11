"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Final integer value to animate to. */
  value: number;
  /** Locale for thousands formatting. Defaults to it-IT. */
  locale?: string;
  /** Animation duration in ms. */
  durationMs?: number;
  className?: string;
}

/**
 * Galleria count-up — animates an integer from 0 to its final value the first
 * time it scrolls into view. Honours prefers-reduced-motion (renders the final
 * value immediately) and degrades gracefully without IntersectionObserver.
 */
export function CountUp({ value, locale, durationMs = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(0);

  const nf = new Intl.NumberFormat(locale === "en" ? "en-US" : "it-IT");

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / durationMs);
              setDisplay(Math.round(easeOutCubic(p) * value));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className} aria-label={nf.format(value)}>
      {nf.format(display)}
    </span>
  );
}
