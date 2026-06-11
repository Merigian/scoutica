import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

/* Galleria badges — sharp edges, no uppercase, sentence case kicker style. */
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:     "bg-[var(--ink)] text-[var(--bg-elevated)]",
    secondary:   "bg-[var(--bg-soft)] text-[var(--ink)] border border-[var(--rule)]",
    outline:     "border border-[var(--rule-strong)] text-[var(--ink)]",
    success:     "border border-[var(--success)] text-[var(--success)]",
    warning:     "border border-[var(--color-warning)] text-[var(--color-warning)]",
    destructive: "border border-[var(--danger)] text-[var(--danger)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[12px] font-[var(--font-body)] font-medium leading-[1.5] transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
