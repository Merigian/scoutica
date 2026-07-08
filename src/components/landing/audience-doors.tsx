import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionIndex } from "@/components/landing/section-index";

/**
 * "Tre ingressi" — the three audiences as photographic doors. Each door is a
 * full-bleed editorial plate: portrait, gilt folio numeral, Didone title on
 * the scrim. Stacked edge-to-edge on mobile (hairline gaps), a 3-up gallery
 * wall at lg. Photography replaces the old text-only cards — on a fashion
 * marketplace the imagery IS the argument.
 */
export async function AudienceDoors() {
  const t = await getTranslations("landing");

  const doors = [
    {
      href: "/register/model",
      img: "/images/test23.jpg",
      pos: "object-[42%_18%]",
      label: t("features.forModel"),
      title: t("hero.ctaModel"),
      desc: t("hero.ctaModelDesc"),
    },
    {
      href: "/register/scout",
      img: "/images/test22.jpg",
      pos: "object-[44%_22%]",
      label: t("features.forScout"),
      title: t("hero.ctaScout"),
      desc: t("hero.ctaScoutDesc"),
    },
    {
      href: "/register/studio",
      img: "/images/chi-siamo.JPG",
      pos: "object-[52%_28%]",
      label: t("features.forStudio"),
      title: t("hero.ctaStudio"),
      desc: t("hero.ctaStudioDesc"),
    },
  ] as const;

  return (
    <section
      id="per-chi-e"
      className="scroll-mt-24 bg-[var(--bg)] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-10 lg:mb-16 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionIndex n="01" className="mb-6">{t("audience.eyebrow")}</SectionIndex>
            <h2 className="text-display max-w-[14ch]">{t("audience.title")}</h2>
          </div>
          <p className="self-end text-lead lg:col-span-4 lg:col-start-9">
            {t("audience.subtitle")}
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-[1440px] lg:px-12">
        <div className="flex flex-col gap-px bg-[var(--rule)] hairline-t hairline-b lg:grid lg:grid-cols-3 lg:hairline-l lg:hairline-r">
          {doors.map((d, i) => (
            <Reveal key={d.href} delay={i * 90}>
              <Link
                href={d.href as never}
                className="group relative block aspect-[7/5] overflow-hidden bg-[var(--bg-soft)] transition-transform duration-150 active:scale-[0.995] sm:aspect-[16/8] lg:aspect-[3/4]"
              >
                <Image
                  src={d.img}
                  alt={d.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  quality={80}
                  className={`object-cover transition-[filter] duration-700 group-hover:brightness-[0.92] ${d.pos}`}
                />
                {/* Scrim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"
                />
                {/* Folio numeral */}
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-4 font-display italic text-[15px] text-[var(--gilt)] lg:left-7 lg:top-6"
                >
                  0{i + 1}
                </span>
                {/* Statement */}
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
                  <p className="font-label text-[10px] uppercase tracking-[0.24em] text-white/65">
                    {d.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="max-w-[14ch] font-display text-[clamp(1.5rem,5.4vw,2rem)] font-light leading-[1.05] tracking-[-0.015em] text-white lg:text-[1.75rem]">
                      {d.title}
                    </h3>
                    <span className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center border border-white/30 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight className="group-arrow h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-white/70">
                    {d.desc}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
