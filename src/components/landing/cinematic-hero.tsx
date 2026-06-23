"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { User, Search, Camera, ArrowUpRight } from "lucide-react";

export function CinematicHero({ heroSrc }: { heroSrc: string }) {
  const t = useTranslations("landing");
  const isPngHero = heroSrc.toLowerCase().endsWith(".png");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Cinematic parallax: image drifts down + scales, content lifts & fades.
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // The three entries double as the "what Scoutica offers" explainer — each
  // lane routes a visitor to their register flow (model / scout / studio).
  const lanes = [
    {
      href: "/register/model",
      icon: User,
      label: t("features.forModel"),
      title: t("hero.ctaModel"),
      desc: t("hero.ctaModelDesc"),
    },
    {
      href: "/register/scout",
      icon: Search,
      label: t("features.forScout"),
      title: t("hero.ctaScout"),
      desc: t("hero.ctaScoutDesc"),
    },
    {
      href: "/register/studio",
      icon: Camera,
      label: t("features.forStudio"),
      title: t("hero.ctaStudio"),
      desc: t("hero.ctaStudioDesc"),
    },
  ] as const;

  return (
    <section
      ref={ref}
      id="per-chi-e"
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
          className="object-cover object-[51%_20%] lg:object-[52%_22%]"
        />
      </motion.div>

      {/* Legibility scrim — keeps the model clear up top, darkens the tray. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      />

      {/* Content rail — heading + the three entries, docked at the bottom. */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="mt-auto pb-[clamp(2.5rem,7vh,5rem)] pt-[clamp(6rem,18vh,9rem)] sm:pt-0">
          {/* Heading */}
          <motion.div
            className="max-w-[44rem]"
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-label text-[11px] uppercase tracking-[0.22em] text-white/65">
              {t("audience.eyebrow")}
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.875rem,4.2vw,3rem)] font-light leading-[1.04] tracking-[-0.01em] text-white">
              {t("audience.title")}
            </h1>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-white/70">
              {t("audience.subtitle")}
            </p>
          </motion.div>

          {/* Three entries */}
          <motion.div
            className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-3 lg:gap-4"
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {lanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <Link
                  key={lane.href}
                  href={lane.href as never}
                  className="group relative flex h-full flex-col overflow-hidden border border-white/12 bg-white/[0.05] p-5 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-white/30 hover:bg-white/[0.1] hover:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.75)] motion-safe:hover:-translate-y-1.5 sm:p-6 lg:p-7"
                >
                  {/* Hover sheen along the top edge */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition-colors duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:border-transparent group-hover:bg-white group-hover:text-[#0A0A0B]">
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 text-white/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:mt-8">
                    <p className="font-label text-[10px] uppercase tracking-[0.22em] text-white/50">
                      {lane.label}
                    </p>
                    <h2 className="font-display text-xl leading-[1.15] text-white lg:text-2xl lg:leading-[1.1]">
                      {lane.title}
                    </h2>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/65">
                      {lane.desc}
                    </p>
                  </div>

                  <span className="mt-auto inline-flex items-center gap-3 pt-6 font-label text-[11px] uppercase tracking-[0.18em] text-white/80 transition-colors duration-300 group-hover:text-white lg:pt-7">
                    {t("audience.discover")}
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-white/40 transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:w-10 group-hover:bg-white"
                    />
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
