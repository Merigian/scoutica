"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
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
        initial={reduce ? undefined : { clipPath: "inset(100% 0 0 0)" }}
        whileInView={reduce ? undefined : { clipPath: "inset(0% 0 0 0)" }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div className="absolute inset-[-8%]" style={parallax && !reduce ? { y } : undefined}>
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}
