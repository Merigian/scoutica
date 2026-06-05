import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Eyebrow label (e.g. section name). Rendered with the numbered prefix if `index` is set. */
  eyebrow?: string;
  /** Optional two-digit section index shown before the eyebrow (e.g. "01 — Sommario"). */
  index?: number;
  title: string;
  /** Lead paragraph below the title. */
  description?: string;
  /** Optional actions rendered to the right of the title on desktop. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard dashboard page header — Galleria editorial system.
 * eyebrow (numbered) + display H1 (fluid clamp) + lead, with optional actions.
 */
export function PageHeader({ eyebrow, index, title, description, actions, className }: PageHeaderProps) {
  const eyebrowText =
    eyebrow && typeof index === "number"
      ? `${String(index).padStart(2, "0")} — ${eyebrow}`
      : eyebrow;

  return (
    <header
      className={cn(
        "hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14",
        actions && "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrowText && <p className="text-eyebrow">{eyebrowText}</p>}
        <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)] max-w-[22ch]">
          {title}
        </h1>
        {description && <p className="text-lead max-w-[58ch]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </header>
  );
}
