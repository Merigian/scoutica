"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Subtle parallax drift of the image inside its frame as it scrolls. */
  parallax?: boolean;
  rounded?: boolean;
  /** CSS object-position for the cover crop (e.g. "center 25%", "top"). */
  objectPosition?: string;
}

/**
 * Editorial image that unveils with a clip-path wipe when it enters the
 * viewport, with optional slow parallax. Reduced-motion → static image.
 */
export function ImageReveal({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
  parallax = true,
  rounded = false,
  objectPosition = "center",
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Drive the wipe from a robust in-view check. whileInView with a negative
  // root margin could fail to fire for images already near the top of the page,
  // leaving the clip-path stuck closed (an empty box). useInView with an
  // `amount` threshold reliably triggers — and reduced-motion shows it at once.
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const revealed = reduce || inView;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-[var(--bg-soft)]", rounded && "rounded-sm", className)}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ clipPath: revealed ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div className="absolute inset-[-8%]" style={parallax && !reduce ? { y } : undefined}>
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" style={{ objectPosition }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
