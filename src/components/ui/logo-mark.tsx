import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "display";

const SIZE: Record<Size, number> = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 80,
  display: 160,
};

interface LogoMarkProps {
  size?: Size;
  width?: number;
  className?: string;
  title?: string;
  /**
   * When set, forces a specific source. Default ("auto") uses CSS mask + currentColor
   * so the mark inherits text color (light/dark mode safe).
   */
  variant?: "auto" | "light" | "dark";
  priority?: boolean;
}

/**
 * Scoutica icon mark. Uses CSS mask-image on a 256px PNG so the shape is
 * tinted with currentColor — same color-inheritance pattern as ScouticaWordmark.
 * Single asset, theme-adaptive, scalable.
 */
export function LogoMark({
  size = "md",
  width,
  className,
  title = "Scoutica",
  variant = "auto",
  priority: _priority,
}: LogoMarkProps) {
  const w = width ?? SIZE[size];

  if (variant === "auto") {
    return (
      <span
        role="img"
        aria-label={title}
        title={title}
        className={cn("inline-block align-middle select-none shrink-0", className)}
        style={{
          width: w,
          height: w,
          backgroundColor: "currentColor",
          WebkitMaskImage: "url(/images/logo-finale-256.png)",
          maskImage: "url(/images/logo-finale-256.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center 52.15%",
          maskPosition: "center 52.15%",
        }}
      />
    );
  }

  const src =
    variant === "light"
      ? "/images/logo-finale-256.png"
      : "/images/logo-finale-dark-256.png";

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={title}
      width={w}
      height={w}
      className={cn("inline-block align-middle select-none shrink-0", className)}
      style={{ width: w, height: w }}
    />
  );
}

/**
 * Mark + custom-spaced wordmark lockup. Use where the brand needs both
 * the icon and the SCOUTICA letters side by side.
 */
export function LogoLockup({
  size = "md",
  className,
  gap = 10,
}: {
  size?: Size;
  className?: string;
  gap?: number;
}) {
  return (
    <span className={cn("inline-flex items-center", className)} style={{ gap }}>
      <LogoMark size={size} />
    </span>
  );
}

export default LogoMark;
