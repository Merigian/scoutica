"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type VerifiedBadgeVariant = "shimmer" | "static";

export interface VerifiedBadgeProps
  extends Omit<
    ComponentPropsWithoutRef<"span">,
    | "children"
    | "role"
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  /** Kept for backward compatibility; both values render the same mark. */
  variant?: VerifiedBadgeVariant;
  size?: number;
  /** Visible label revealed on hover. Defaults to the translated "Verified". */
  label?: string;
}

/**
 * Editorial verification mark — a hairline ring enclosing a thin check.
 * Monochrome (inherits `currentColor`) so it sits quietly beside text instead
 * of standing out like a social-network seal. On hover/focus the check redraws,
 * the mark lifts slightly and a small uppercase label ("Verificato" / "Verified")
 * slides in — a quiet editorial flourish, no colour accent, no glossy fill.
 */
export function VerifiedBadge({
  variant = "static",
  size = 18,
  label,
  className,
  "aria-label": ariaLabel,
  style,
  ...props
}: VerifiedBadgeProps) {
  const t = useTranslations("components.verifiedBadge");
  const prefersReducedMotion = useReducedMotion();

  const text = label ?? t("label");
  const accessibleName = ariaLabel ?? text;

  return (
    <motion.span
      aria-label={accessibleName}
      animate="rest"
      className={cn(
        "group relative inline-flex shrink-0 align-middle",
        className
      )}
      data-variant={variant}
      initial="rest"
      role="img"
      style={{ width: size, height: size, ...style }}
      whileFocus="hover"
      whileHover="hover"
      {...props}
    >
      <motion.svg
        aria-hidden="true"
        className="h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transformOrigin: "center" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        variants={{
          rest: { scale: 1 },
          hover: { scale: prefersReducedMotion ? 1 : 1.08 },
        }}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9.25" strokeWidth="1.1" />
        <motion.path
          d="M7.9 12.4l2.8 2.85L16.3 9"
          strokeWidth="1.4"
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.55, ease: "easeInOut" }
          }
          variants={{
            rest: { pathLength: 1 },
            hover: prefersReducedMotion
              ? { pathLength: 1 }
              : { pathLength: [0, 1] },
          }}
        />
      </motion.svg>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-full z-20 ml-2 flex items-center"
      >
        <motion.span
          className="whitespace-nowrap border px-2 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.16em]"
          style={{
            borderColor: "var(--rule)",
            background: "var(--bg)",
            color: "var(--ink-2)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          variants={{
            rest: { opacity: 0, x: prefersReducedMotion ? 0 : -4 },
            hover: { opacity: 1, x: 0 },
          }}
        >
          {text}
        </motion.span>
      </span>
    </motion.span>
  );
}

export default VerifiedBadge;
