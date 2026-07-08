"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { RevealText } from "@/components/motion/reveal-text";

/**
 * The cover. A cinematic full-bleed portrait with the editorial statement
 * itself as the masthead: the giant Didone headline is set high in the sky of
 * the photograph (no brand wordmark — the nav already carries it), the
 * supporting copy and CTAs dock at the base behind a film-grain pass.
 * Layered parallax (image vs. statement) collapses cleanly under
 * prefers-reduced-motion.
 */
export function CinematicHero({ heroSrc }: { heroSrc: string }) {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#0A0A0B]"
    >
      {/* Cover photograph */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: imgY, scale: imgScale }}
      >
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          quality={82}
          sizes="100vw"
          className="object-cover object-[62%_30%] md:object-[54%_24%]"
        />
      </motion.div>

      {/* Legibility scrims — soft at the top for the statement, deep at the base */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-[46%] bg-gradient-to-b from-black/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[62%] bg-gradient-to-t from-black/90 via-black/30 to-transparent"
      />
      {/* Film grain — the tactile print pass */}
      <div aria-hidden="true" className="noir-grain absolute inset-0 z-[6]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12">
        {/* Statement set into the sky */}
        <motion.div
          className="pt-[calc(env(safe-area-inset-top)+6.25rem)] lg:pt-[calc(env(safe-area-inset-top)+8.5rem)]"
          style={reduce ? undefined : { y: headY, opacity: headOpacity }}
        >
          <motion.p
            className="flex items-center gap-3 font-label text-[11px] uppercase tracking-[0.28em] text-white/75"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="h-px w-8 bg-[var(--gilt)]" aria-hidden="true" />
            {t("cover.manifestoTop")}
          </motion.p>

          <h1 className="mt-5 font-display font-light leading-[0.96] tracking-[-0.03em] text-white text-[clamp(2.9rem,11.5vw,8.25rem)]">
            <RevealText
              as="span"
              text={t("coverV2.line1")}
              className="block max-w-[10ch]"
              delay={0.2}
            />
            <RevealText
              as="span"
              text={t("coverV2.line2")}
              className="block max-w-[10ch] italic"
              delay={0.4}
            />
          </h1>
        </motion.div>

        {/* Supporting copy + actions docked at the base */}
        <motion.div
          className="mt-auto pb-[clamp(3.5rem,8vh,6rem)]"
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        >
          <motion.p
            className="max-w-[44ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/75"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Link
              href="/register"
              className="group inline-flex min-h-[52px] items-center gap-3 bg-white px-8 py-4 font-label text-[12px] uppercase tracking-[0.2em] text-black transition-[background-color,transform] duration-300 hover:bg-white/[0.88] active:scale-[0.985]"
            >
              {t("cta.button")}
              <ArrowUpRight className="h-4 w-4 group-arrow" aria-hidden="true" />
            </Link>
            <a
              href="#per-chi-e"
              className="group inline-flex min-h-[44px] items-center py-2 font-label text-[12px] uppercase tracking-[0.18em] text-white/85 transition-colors duration-300 hover:text-white"
            >
              <span className="link-underline">{t("audience.discover")}</span>
            </a>
          </motion.div>

          {/* Editorial colophon */}
          <motion.div
            className="mt-9 flex items-baseline justify-between gap-4 border-t border-white/15 pt-4"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-white/55">
              {t("cover.reach")}
            </p>
            <p
              aria-hidden="true"
              className="hidden font-label text-[10px] uppercase tracking-[0.24em] text-white/45 sm:block"
            >
              Milano · 45°28′ N — 9°11′ E
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center sm:flex">
          <motion.span
            aria-hidden="true"
            className="h-10 w-px bg-white/40"
            style={{ transformOrigin: "top" }}
            animate={
              reduce ? undefined : { scaleY: [0.35, 1, 0.35], opacity: [0.3, 0.7, 0.3] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
