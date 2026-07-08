"use client";

import { cn } from "@/lib/utils";

export interface SegmentedTab {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * Editorial underline tab-bar (Galleria system): hairline baseline, the active
 * tab carries a 1px ink underline. Horizontally scrollable on narrow screens,
 * no scrollbar chrome. Keyboard-accessible tablist.
 */
export function SegmentedTabs({
  tabs,
  value,
  onValueChange,
  "aria-label": ariaLabel,
  className,
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "hairline-b flex items-stretch gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "group relative -mb-px shrink-0 whitespace-nowrap border-b py-3 text-[15px] transition-colors",
              active
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "ml-1.5 tabular-nums text-[12px]",
                  active ? "text-[var(--ink-2)]" : "text-[var(--ink-3)]",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
