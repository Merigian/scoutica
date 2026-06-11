import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section kicker — a hairline rule + eyebrow. The `n` prop is accepted for
 * call-site compatibility but intentionally not rendered (no magazine folios).
 */
export function SectionIndex({
  n: _n,
  children,
  className,
}: {
  n?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px w-8 bg-[var(--rule-strong)]" aria-hidden="true" />
      <span className="text-eyebrow">{children}</span>
    </div>
  );
}
