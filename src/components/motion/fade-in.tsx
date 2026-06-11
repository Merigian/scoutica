"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Animate on mount instead of on scroll into view. */
  onMount?: boolean;
  as?: "div" | "section" | "header" | "li" | "ul";
}

/**
 * Block-level fade/rise. Scroll-triggered by default (once), or on mount.
 * Reduced-motion → static. Server pages can wrap content in this client island.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  onMount = false,
  as = "div",
}: FadeInProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y: 22 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1], delay }}
      {...(onMount
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-12%" } })}
    >
      {children}
    </MotionTag>
  );
}
