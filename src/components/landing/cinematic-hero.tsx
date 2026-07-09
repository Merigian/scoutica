"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

/**
 * "Aperture" — the hero as the opening screen of a flagship iOS app. The
 * photograph owns the frame; every word of UI lives in ONE in-flow content
 * group docked to the base (flex justify-end), so on short viewports the
 * section GROWS instead of clipping and nothing can slide under the fixed
 * nav. The anti-collision invariant: all copy and CTAs share a single motion
 * group — intra-content collisions are impossible regardless of scroll
 * direction; the image is a background layer the group may pass over.
 *
 * Entrances are CSS keyframes (server HTML is never invisible — LCP, no-JS
 * and first-paint reduced-motion stay correct); Framer handles only the
 * scroll physics (image reveal drift + group lift/fade, with visibility
 * gating so a faded group is never clickable) and the press springs.
 * The hero is photo-dark in BOTH themes, so accents are hardcoded (#C8A566)
 * rather than theme tokens that would flip.
 */
export function CinematicHero({
  heroSrc,
  scoutCount = 0,
  modelCount = 0,
}: {
  heroSrc: string;
  scoutCount?: number;
  modelCount?: number;
}) {
  const t = useTranslations("landing.heroV3");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const groupY = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const groupOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  // A faded group must not remain tappable/focusable over the bare photo.
  const groupVisibility = useTransform(groupOpacity, (v) =>
    v < 0.03 ? "hidden" : "visible",
  );

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-[#0A0A0B]"
    >
      {/* Cover photograph — scroll drift (Framer) wraps a CSS Ken Burns settle */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: imgY }}
        aria-hidden="true"
      >
        <div className="hero-settle absolute inset-0">
          <Image
            src={heroSrc}
            alt=""
            fill
            priority
            quality={82}
            sizes="100vw"
            className="object-cover object-[68%_22%] md:object-[54%_30%]"
          />
        </div>
      </motion.div>

      {/* Scrims — a whisper under the fixed nav, a deep base under the stack */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-28 bg-gradient-to-b from-black/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[68%] bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      />

      {/* The single content group — in-flow, so short viewports grow the section */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-[1440px] pt-28 pb-[calc(env(safe-area-inset-bottom)+16px)] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] sm:pl-[max(2.5rem,env(safe-area-inset-left))] sm:pr-[max(2.5rem,env(safe-area-inset-right))] lg:pl-[max(3rem,env(safe-area-inset-left))] lg:pr-[max(3rem,env(safe-area-inset-right))] lg:pb-16"
        style={
          reduce
            ? undefined
            : { y: groupY, opacity: groupOpacity, visibility: groupVisibility }
        }
      >
        {/* Gilt hairline — the one ornament */}
        <span
          aria-hidden="true"
          className="hero-rule mb-4 block h-px w-8 bg-[#C8A566]"
        />

        {/* Trust chip — the objection handled before the ask */}
        <p
          className="hero-rise inline-flex h-7 items-center gap-1.5 border border-white/25 bg-black/30 px-3 font-label text-[11px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-md"
          style={{ "--rise-delay": "0.15s" } as React.CSSProperties}
        >
          <BadgeCheck className="h-3.5 w-3.5 text-[#C8A566]" aria-hidden="true" />
          {scoutCount >= 50 ? t("chip", { count: scoutCount }) : t("chipFallback")}
        </p>

        {/* Four words. */}
        <h1
          className="hero-rise mt-3.5 font-display font-normal leading-[1.02] tracking-[-0.02em] text-white text-[clamp(2rem,min(9.6vw,13svh),4.5rem)]"
          style={{ "--rise-delay": "0.22s" } as React.CSSProperties}
        >
          {t("h1a")}
          <br />
          <em className="font-light">{t("h1b")}</em>
        </h1>

        {/* Sub-copy — two tight lines on phones, one line at lg */}
        <p
          className="hero-rise mt-2.5 max-w-[30ch] text-[clamp(0.9375rem,1.2vw,1.0625rem)] leading-[1.5] text-white/80 lg:max-w-[60ch]"
          style={{ "--rise-delay": "0.29s" } as React.CSSProperties}
        >
          {t("sub")}
        </p>

        {/* Action stack — full-width thumb zone on phones, inline row at lg */}
        <div
          className="hero-rise mt-5 flex flex-col gap-1.5 [@media(max-height:700px)]:mt-4 lg:mt-7 lg:flex-row lg:items-center lg:gap-0"
          style={{ "--rise-delay": "0.36s" } as React.CSSProperties}
        >
          <motion.div
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
            className="lg:w-auto"
          >
            <Link
              href="/register"
              className="flex h-[54px] w-full items-center justify-center gap-2 bg-white px-10 text-[16px] font-semibold text-black transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white active:bg-[#E9E7E2] [@media(max-height:700px)]:h-12 lg:h-14 lg:w-auto"
            >
              {t("ctaPrimary")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div
            whileTap={reduce ? undefined : { opacity: 0.55 }}
            transition={{ duration: 0.1 }}
            className="lg:ml-6"
          >
            <a
              href="#per-chi-e"
              className="flex h-11 w-full items-center justify-center text-[15px] font-medium text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white [@media(max-height:700px)]:h-10 lg:w-auto lg:justify-start"
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>

          {/* Desktop-only stats caption, same baseline, same motion unit */}
          <p className="hidden font-label text-[11px] uppercase tracking-[0.2em] text-white/55 lg:ml-auto lg:block">
            {modelCount >= 100 && (
              <>
                <span className="tabular-nums">
                  {t("statsModels", { count: modelCount })}
                </span>
                <span aria-hidden="true"> · </span>
              </>
            )}
            {t("statsRegions")}
            <span aria-hidden="true"> · </span>
            {t("statsStudios")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
