"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/ui/logo-mark";
import { ScouticaWordmark } from "@/components/ui/wordmark";

const KEY = "scoutica:intro-seen";
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Atelier Noir brand intro — full-bleed obsidian curtain that reveals the
 * logo + wordmark, then lifts to unveil the page. Shows once per browser
 * session. Reduced-motion → renders nothing.
 */
export function BrandPreloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      setShow(false);
      document.documentElement.style.overflow = "";
    }, 2200);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0B]"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div
            className="flex items-center gap-3 sm:gap-4 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.span
              initial={{ rotateY: 0, opacity: 0 }}
              animate={{ rotateY: 360, opacity: 1 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.1 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <LogoMark size="xl" />
            </motion.span>
            <span className="overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              >
                <ScouticaWordmark size="xl" />
              </motion.span>
            </span>
          </motion.div>

          {/* thin progress hairline */}
          <motion.span
            className="absolute bottom-0 left-0 h-px bg-white/40"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
