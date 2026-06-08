import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial section kicker — a progressive folio number + hairline rule + eyebrow.
 * Reads as "01 — Cast", giving the landing a magazine-like running index.
 */
export function SectionIndex({
  n,
  children,
  className,
}: {
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-display tabular-nums text-[0.8125rem] tracking-[0.08em] text-[var(--ink-3)]">
        {n}
      </span>
      <span className="h-px w-6 bg-[var(--rule-strong)]" aria-hidden="true" />
      <span className="text-eyebrow">{children}</span>
    </div>
  );
}
