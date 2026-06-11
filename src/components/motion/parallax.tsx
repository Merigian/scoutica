"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical drift range in % of element height. */
  amount?: number;
}

/**
 * Lightweight scroll parallax wrapper (transform-only, GPU-friendly).
 * Reduced-motion → no transform.
 */
export function Parallax({ children, className, amount = 12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]) as MotionValue<string>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}
