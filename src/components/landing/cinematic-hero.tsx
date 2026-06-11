"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { RevealText } from "@/components/motion/reveal-text";
import { ArrowUpRight, ArrowDown } from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function CinematicHero({ heroSrc }: { heroSrc: string }) {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Cinematic parallax: image drifts down + scales, content lifts & fades.
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const title = t("hero.title");
  const [lead, ...rest] = title.split(/(?<=\.)\s+/);
  const emph = rest.join(" ");

  return (
    <section
      ref={ref}
      className="noir-vignette relative w-full min-h-[100svh] overflow-hidden bg-[#0A0A0B]"
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
          quality={92}
          sizes="100vw"
          className="object-cover object-[62%_22%] lg:object-[58%_26%]"
        />
      </motion.div>

      {/* Scrims — fixed obsidian, cinematic grade */}
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#0A0A0B]/80 via-[#0A0A0B]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-[#0A0A0B]/20 to-transparent" />

      {/* Content rail */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          className="flex items-baseline justify-between gap-4 pt-28 lg:pt-32"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-[11px] uppercase tracking-[0.32em] text-[#F4F1EA]/55">
            {t("cover.masthead")}
          </span>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#F4F1EA]/45">
            {t("cover.reach")}
          </span>
        </motion.div>

        <div className="mt-auto pb-[clamp(3rem,8vh,7rem)] max-w-[52rem]">
          <motion.p
            className="mb-6 text-[12px] uppercase tracking-[0.34em] text-[#F4F1EA]/70"
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {t("cover.manifestoTop")}
          </motion.p>

          <h1 className="font-display font-light text-[#F4F1EA] tracking-[-0.02em]">
            <RevealText
              text={lead}
              as="span"
              delay={0.35}
              className="block text-[clamp(2.9rem,7vw,6.5rem)] leading-[0.96]"
            />
            {emph && (
              <RevealText
                text={emph}
                as="span"
                by="word"
                delay={0.75}
                className="mt-1 block italic text-[#F4F1EA]/75 text-[clamp(1.7rem,3.8vw,3.4rem)] leading-[1.05]"
              />
            )}
          </h1>

          <motion.p
            className="mt-8 max-w-[46ch] text-[clamp(1rem,1.3vw,1.25rem)] leading-relaxed text-[#F4F1EA]/75"
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-3"
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.15 }}
          >
            <Magnetic>
              <Button
                size="lg"
                asChild
                className="!bg-[#F4F1EA] !text-[#0A0A0B] hover:!bg-white !border-0"
              >
                <Link href="/register/model" className="group whitespace-nowrap">
                  {t("hero.ctaModel")}
                  <ArrowUpRight className="h-4 w-4 group-arrow" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                size="lg"
                asChild
                className="bg-transparent !border-[#F4F1EA]/45 !text-[#F4F1EA] hover:!bg-[#F4F1EA] hover:!text-[#0A0A0B]"
              >
                <Link href="/register/scout" className="whitespace-nowrap">
                  {t("hero.ctaScout")}
                </Link>
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#per-chi-e"
        aria-label={t("cover.scroll")}
        className="group absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#F4F1EA]/55 group-hover:text-[#F4F1EA]/90 transition-colors">
          {t("cover.scroll")}
        </span>
        <ArrowDown className="h-4 w-4 text-[#F4F1EA]/60 animate-bounce group-hover:text-[#F4F1EA]" />
      </a>
    </section>
  );
}
