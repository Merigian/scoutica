import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={cn("hairline p-12 lg:p-16 text-center flex flex-col items-center", className)}>
      {Icon && (
        <div className="mb-6 h-14 w-14 hairline flex items-center justify-center">
          <Icon className="h-6 w-6 text-[var(--ink-3)]" />
        </div>
      )}
      <h3 className="font-[var(--font-display)] text-2xl leading-tight text-[var(--ink)]">{title}</h3>
      {description && (
        <p className="mt-4 max-w-md text-body text-[var(--ink-2)]">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
      {actionLabel && actionHref && (
        <div className="mt-8">
          <Link
            href={actionHref}
            className="link-underline inline-flex items-center gap-2 text-[15px] text-[var(--ink)]"
          >
            {actionLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

