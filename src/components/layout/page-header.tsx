import { cn } from "@/lib/utils";
import { CondensedTitle } from "@/components/layout/condensed-title";

interface PageHeaderProps {
  /** Eyebrow label (e.g. section name). */
  eyebrow?: string;
  title: string;
  /** Lead paragraph below the title. */
  description?: string;
  /** Optional actions rendered to the right of the title on desktop. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard dashboard page header — Galleria editorial system.
 * eyebrow + display H1 (fluid clamp) + lead, with optional actions.
 */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14",
        actions && "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6",
        className,
      )}
    >
      <div className="space-y-3">
        <CondensedTitle title={title} />
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)] max-w-[22ch]">
          {title}
        </h1>
        {description && <p className="text-lead max-w-[58ch]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </header>
  );
}
