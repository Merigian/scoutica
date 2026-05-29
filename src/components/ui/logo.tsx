import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const SIZES = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-9 w-9",
};

export function Logo({ size = "md", showText = true, className, textClassName }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className={cn(SIZES[size], "flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold shrink-0 rounded-md")}>
        S
      </span>
      {showText && (
        <span className={cn("text-sm font-medium", textClassName)}>
          Scoutica
        </span>
      )}
    </span>
  );
}
