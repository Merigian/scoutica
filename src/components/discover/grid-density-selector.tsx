"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_COLS = 1;
const MAX_COLS = 5;
const DEFAULT_COLS = 4;
const STORAGE_KEY = "scoutica.discover.cols";

function clampCols(value: number | undefined): number {
  if (!value || Number.isNaN(value)) return DEFAULT_COLS;
  return Math.min(MAX_COLS, Math.max(MIN_COLS, Math.trunc(value)));
}

function colsToGridClass(cols: number): string {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3";
    case 4:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4";
    case 5:
    default:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  }
}

/* ------------------------------------------------------------------ */
/* Tiny module-level store so the selector can update the grid        */
/* instantly without waiting for a server round-trip.                 */
/* ------------------------------------------------------------------ */
type Listener = (value: number) => void;
const listeners = new Set<Listener>();
let storeValue: number | null = null;

function getStoreValue(): number | null {
  return storeValue;
}
function setStoreValue(value: number) {
  storeValue = value;
  listeners.forEach((l) => l(value));
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLiveCols(initial: number): number {
  return useSyncExternalStore(
    subscribe,
    () => getStoreValue() ?? initial,
    () => initial
  );
}

/* ------------------------------------------------------------------ */
/* Grid container — reads the live value so it reflows instantly      */
/* ------------------------------------------------------------------ */
interface DiscoverGridProps {
  children: ReactNode;
  cols?: number;
  className?: string;
}

export function DiscoverGrid({ children, cols, className }: DiscoverGridProps) {
  const initial = clampCols(cols);
  const live = useLiveCols(initial);
  const safe = clampCols(live);

  if (safe === 1) {
    return (
      <div
        data-cols={1}
        className={cn(
          "mx-auto w-full max-w-5xl divide-y divide-[var(--rule)] hairline-t hairline-b",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-cols={safe}
      className={cn("grid gap-2 sm:gap-3", colsToGridClass(safe), className)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slider                                                             */
/* ------------------------------------------------------------------ */
interface GridDensitySelectorProps {
  cols: number;
  className?: string;
}

export function GridDensitySelector({ cols, className }: GridDensitySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("components.discover");

  const initial = clampCols(cols);
  const [value, setValue] = useState<number>(initial);
  const pendingPushRef = useRef<number | null>(null);

  // Hydrate from localStorage on mount if URL didn't carry a value
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasUrlCols = searchParams.get("cols") !== null;
    if (hasUrlCols) {
      setStoreValue(initial);
      return;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const n = clampCols(Number(saved));
        if (n !== initial) {
          setValue(n);
          setStoreValue(n);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setStoreValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitToUrl = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_COLS) {
        params.delete("cols");
      } else {
        params.set("cols", String(next));
      }
      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleInput = useCallback(
    (raw: number) => {
      const next = clampCols(raw);
      if (next === value) return;
      setValue(next);
      setStoreValue(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      pendingPushRef.current = next;
    },
    [value]
  );

  const handleCommit = useCallback(() => {
    if (pendingPushRef.current === null) return;
    commitToUrl(pendingPushRef.current);
    pendingPushRef.current = null;
  }, [commitToUrl]);

  const fillPct = ((value - MIN_COLS) / (MAX_COLS - MIN_COLS)) * 100;

  return (
    <div
      aria-label={t("gridDensity")}
      className={cn(
        "inline-flex h-9 items-center gap-3 hairline bg-[var(--bg)] px-3 select-none",
        className
      )}
    >
      <User
        aria-hidden="true"
        className={cn(
          "h-3.5 w-3.5 transition-colors",
          value === MIN_COLS ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
        )}
      />

      <div className="relative flex h-9 w-32 items-center sm:w-44">
        {/* base track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--rule)]"
        />
        {/* tick marks */}
        {Array.from({ length: MAX_COLS - MIN_COLS + 1 }).map((_, i) => {
          const pct = (i / (MAX_COLS - MIN_COLS)) * 100;
          const reached = i <= value - MIN_COLS;
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-1/2 h-[5px] w-px -translate-x-1/2 -translate-y-1/2 transition-colors",
                reached ? "bg-[var(--ink)]" : "bg-[var(--rule-strong)]"
              )}
              style={{ left: `${pct}%` }}
            />
          );
        })}
        {/* filled track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[var(--ink)] transition-[width] duration-150 ease-out"
          style={{ width: `${fillPct}%` }}
        />
        {/* thumb (visual) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--ink)] shadow-[0_0_0_3px_var(--bg)] transition-[left] duration-150 ease-out"
          style={{ left: `${fillPct}%` }}
        />
        {/* native range — invisible but fully interactive */}
        <input
          type="range"
          min={MIN_COLS}
          max={MAX_COLS}
          step={1}
          value={value}
          aria-label={t("gridDensity")}
          aria-valuetext={t(`density${value}` as `density${1 | 2 | 3 | 4 | 5}`)}
          onInput={(e) => handleInput(Number((e.target as HTMLInputElement).value))}
          onChange={(e) => handleInput(Number(e.target.value))}
          onPointerUp={handleCommit}
          onKeyUp={handleCommit}
          onBlur={handleCommit}
          className={cn(
            "relative z-10 h-9 w-full cursor-pointer appearance-none bg-transparent opacity-0 focus:opacity-0 focus:outline-none",
            "[&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent",
            "[&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:w-9 [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0"
          )}
        />
      </div>

      <LayoutGrid
        aria-hidden="true"
        className={cn(
          "h-3.5 w-3.5 transition-colors",
          value === MAX_COLS ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
        )}
      />
    </div>
  );
}
