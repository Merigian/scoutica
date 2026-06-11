import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel,
  label,
}: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showLabel && <span className="text-[var(--ink-3)]">{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage >= 71 ? "bg-gradient-to-r from-success to-success/80" : percentage >= 31 ? "bg-gradient-to-r from-[var(--ink)] to-[var(--ink-2)]" : "bg-[var(--ink-3)]",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
