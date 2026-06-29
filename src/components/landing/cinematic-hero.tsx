"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function CinematicHero({ heroSrc }: { heroSrc: string }) {
  const t = useTranslations("landing");
  const isPngHero = heroSrc.toLowerCase().endsWith(".png");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Cinematic parallax: image drifts + scales, content lifts & fades.
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#0A0A0B]"
    >
      {/* Cinematic cover */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: imgY, scale: imgScale }}
      >
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          unoptimized={isPngHero}
          quality={92}
          sizes="100vw"
          className="object-cover object-[55%_28%] md:object-[51%_20%] lg:object-[52%_22%]"
        />
      </motion.div>

      {/* Legibility scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/90 via-black/35 to-black/20"
      />

      {/* Statement + single primary CTA, docked at the bottom. */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="mt-auto pb-[clamp(3.5rem,10vh,7rem)] pt-[clamp(6rem,18vh,9rem)] sm:pt-0">
          <motion.p
            className="font-label text-[11px] uppercase tracking-[0.28em] text-white/65"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {t("cover.manifestoTop")}
          </motion.p>

          <motion.h1
            className="mt-5 max-w-[15ch] font-display font-light leading-[0.98] tracking-[-0.03em] text-white text-[clamp(2.75rem,8.5vw,7rem)]"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25 }}
          >
            {t("cover.manifestoBottom")}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[46ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/72"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-white px-7 py-4 font-label text-[12px] uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:bg-white/[0.88]"
            >
              {t("cta.button")}
              <ArrowUpRight className="h-4 w-4 group-arrow" aria-hidden="true" />
            </Link>
            <a
              href="#per-chi-e"
              className="group inline-flex items-center py-2 font-label text-[12px] uppercase tracking-[0.18em] text-white/85 transition-colors duration-300 hover:text-white"
            >
              <span className="link-underline">{t("audience.discover")}</span>
            </a>
          </motion.div>
        </div>

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
      </motion.div>
    </section>
  );
}
