import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionIndex } from "@/components/landing/section-index";

/**
 * "Tre ingressi" — the three audiences (model / scout / studio), relocated out
 * of the hero into a dedicated section. On mobile they become horizontal
 * scroll-snap "doors" (the next card peeks, so the page stays short); on desktop
 * they form a 3-up editorial grid. Each door routes to its register flow.
 */
export async function AudienceDoors() {
  const t = await getTranslations("landing");

  const doors = [
    {
      href: "/register/model",
      label: t("features.forModel"),
      title: t("hero.ctaModel"),
      desc: t("hero.ctaModelDesc"),
    },
    {
      href: "/register/scout",
      label: t("features.forScout"),
      title: t("hero.ctaScout"),
      desc: t("hero.ctaScoutDesc"),
    },
    {
      href: "/register/studio",
      label: t("features.forStudio"),
      title: t("hero.ctaStudio"),
      desc: t("hero.ctaStudioDesc"),
    },
  ] as const;

  return (
    <section
      id="per-chi-e"
      className="scroll-mt-24 hairline-t bg-[var(--bg)] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-12 lg:mb-16 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionIndex className="mb-6">{t("audience.eyebrow")}</SectionIndex>
            <h2 className="text-display max-w-[14ch]">{t("audience.title")}</h2>
          </div>
          <p className="self-end text-lead lg:col-span-4 lg:col-start-9">
            {t("audience.subtitle")}
          </p>
        </Reveal>

        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {doors.map((d, i) => (
            <Reveal
              key={d.href}
              delay={i * 90}
              className="min-w-[80vw] snap-start sm:min-w-[56vw] md:min-w-0"
            >
              <Link
                href={d.href as never}
                className="group relative flex h-full w-full flex-col justify-between bg-[var(--bg-elevated)] p-7 transition-colors duration-500 hairline hover:bg-[var(--bg-soft)] md:min-h-[clamp(26rem,38vh,32rem)] lg:p-9"
              >
                <div>
                  <p className="font-label text-[11px] uppercase tracking-[0.22em] text-[var(--ink-3)]">
                    {d.label}
                  </p>
                  <h3 className="mt-7 max-w-[12ch] font-display text-[clamp(2rem,3.2vw,2.85rem)] font-light leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
                    {d.title}
                  </h3>
                  <p className="mt-4 max-w-[30ch] text-body text-[var(--ink-2)]">
                    {d.desc}
                  </p>
                </div>
                <span className="mt-8 md:mt-10 inline-flex items-center gap-3 font-label text-[11px] uppercase tracking-[0.18em] text-[var(--ink-2)] transition-colors duration-300 group-hover:text-[var(--ink)]">
                  <span className="link-underline">{t("audience.discover")}</span>
                  <ArrowUpRight className="group-arrow h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
