"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms applied to the entrance transition. */
  delay?: number;
  /** Optional element tag. Defaults to a div wrapper. */
  as?: "div" | "section" | "li" | "ol" | "ul";
}

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/**
 * Galleria scroll-reveal — a subtle, single-shot fade + rise as the element
 * enters the viewport. Below-the-fold only (never wrap above-the-fold content).
 * Uses inline styles so the entrance is deterministic (no utility/layer races)
 * and honours prefers-reduced-motion by rendering fully visible at once.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAnimate(false);
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = animate
    ? {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(16px)",
        transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
        transitionDelay: delay ? `${delay}ms` : undefined,
        willChange: "opacity, transform",
      }
    : {};

  return (
    <Tag
      // @ts-expect-error — ref is valid for every allowed tag
      ref={ref}
      data-shown={shown}
      style={style}
      className={className}
    >
      {children}
    </Tag>
  );
}
