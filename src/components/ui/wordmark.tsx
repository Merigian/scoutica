import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "display";

const SIZE: Record<Size, number> = {
  xs: 14,
  sm: 20,
  md: 26,
  lg: 32,
  xl: 60,
  display: 132,
};

interface WordmarkProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "title"> {
  size?: Size;
  height?: number;
  title?: string;
}

/**
 * Scoutica wordmark — Galleria edition. Renders the brand as a Fraunces
 * editorial masthead. `height` (or `size`) maps directly to font-size in px;
 * caller controls scale. Title-case, tight tracking, line-height 0.85 so the
 * box matches roughly the previous SVG footprint.
 */
export function ScouticaWordmark({
  size = "md",
  height,
  className,
  title = "Scoutica",
  style,
  ...props
}: WordmarkProps) {
  const h = height ?? SIZE[size];

  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        "inline-block align-middle select-none whitespace-nowrap font-[var(--font-display)]",
        className,
      )}
      style={{
        fontSize: `${h}px`,
        lineHeight: 0.85,
        letterSpacing: "-0.025em",
        fontWeight: 400,
        ...style,
      }}
      {...props}
    >
      Scoutica
    </span>
  );
}

/**
 * Single-letter "S" monogram, same Fraunces serif as the full wordmark.
 */
export function ScouticaMonogram({
  size = "md",
  height,
  className,
  title = "Scoutica",
  style,
  ...props
}: WordmarkProps) {
  const h = height ?? SIZE[size];

  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        "inline-block align-middle select-none font-[var(--font-display)]",
        className,
      )}
      style={{
        fontSize: `${h}px`,
        lineHeight: 0.85,
        letterSpacing: "-0.025em",
        fontWeight: 400,
        ...style,
      }}
      {...props}
    >
      S
    </span>
  );
}

export default ScouticaWordmark;
