import { cn } from "@/lib/utils";

/**
 * Skeleton — reusable loading placeholder.
 * Decorative by itself (aria-hidden); wrap groups in a container with
 * role="status" aria-busy="true" so assistive tech announces the loading state.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-[var(--bg-soft)]/60", className)}
      {...props}
    />
  );
}
