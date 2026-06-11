"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface RevealTextProps {
  text: string;
  /** Render element. */
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** Stagger unit: words (default) or characters. */
  by?: "word" | "char";
  delay?: number;
  /** Trigger on scroll into view instead of on mount. */
  whileInView?: boolean;
}

/**
 * Editorial line reveal — each word/char rises from a clipped baseline with a
 * cascading stagger. Honours prefers-reduced-motion (renders static).
 */
export function RevealText({
  text,
  as = "div",
  className,
  by = "word",
  delay = 0,
  whileInView = false,
}: RevealTextProps) {
  const reduce = useReducedMotion();
  const units = by === "word" ? text.split(" ") : Array.from(text);
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: by === "word" ? 0.08 : 0.025, delayChildren: delay },
    },
  };
  const child: Variants = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={container}
      initial="hidden"
      {...(whileInView
        ? { whileInView: "visible", viewport: { once: true, margin: "-12%" } }
        : { animate: "visible" })}
      aria-label={text}
    >
      {units.map((u, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.06em", marginBottom: "-0.06em" }}
        >
          <motion.span variants={child} className="inline-block">
            {u}
            {by === "word" && i < units.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
