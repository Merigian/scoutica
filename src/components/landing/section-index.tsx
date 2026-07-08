import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section kicker — gilt folio numeral + hairline rule + eyebrow. The numeral
 * is the editorial index mark of the landing's design language; omit `n` for
 * a plain kicker.
 */
export function SectionIndex({
  n,
  children,
  className,
}: {
  n?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {n && (
        <span
          aria-hidden="true"
          className="font-display italic text-[13px] leading-none tabular-nums text-[var(--gilt)]"
        >
          {n}
        </span>
      )}
      <span className="h-px w-8 bg-[var(--rule-strong)]" aria-hidden="true" />
      <span className="text-eyebrow">{children}</span>
    </div>
  );
}
