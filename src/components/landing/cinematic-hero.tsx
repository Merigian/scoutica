"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDown } from "lucide-react";

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
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
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
          className="object-cover object-[51%_22%] lg:object-[52%_24%]"
        />
      </motion.div>

      {/* Content rail — minimal. The SCOUTICA wordmark already lives in the
          photo and the explanatory copy sits in the statement section right
          below, so the cover stays clean: just the two actions. */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="mt-auto pb-[clamp(3rem,9vh,7rem)] max-w-[42rem]">
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <Button
              size="lg"
              asChild
              className="!bg-[#0A0A0B] !text-[#F4F1EA] hover:!bg-[#1A1814] !border-0 shadow-lg shadow-black/15"
            >
              <Link href="/register/model" className="group whitespace-nowrap">
                {t("hero.ctaModel")}
                <ArrowUpRight className="h-4 w-4 group-arrow" />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="!bg-[#F4F1EA] !text-[#0A0A0B] hover:!bg-white !border-0 shadow-lg shadow-black/10"
            >
              <Link href="/register/scout" className="whitespace-nowrap">
                {t("hero.ctaScout")}
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#per-chi-e"
        aria-label={t("cover.scroll")}
        className="group absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#14110C]/65 group-hover:text-[#14110C] transition-colors" style={{ textShadow: "0 1px 16px rgba(245,241,234,0.6)" }}>
          {t("cover.scroll")}
        </span>
        <ArrowDown className="h-4 w-4 text-[#14110C]/70 animate-bounce group-hover:text-[#14110C]" />
      </a>
    </section>
  );
}
