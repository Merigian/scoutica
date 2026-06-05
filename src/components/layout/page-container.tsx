import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard dashboard page wrapper — Galleria editorial system.
 * Single source of truth for max-width, responsive padding and entrance.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in",
        className,
      )}
    >
      {children}
    </div>
  );
}
