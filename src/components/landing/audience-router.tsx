import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/landing/reveal";
import { SectionIndex } from "@/components/landing/section-index";
import { User, Search, Camera, ArrowRight } from "lucide-react";

/**
 * Audience router — the first content block under the hero. Sends each visitor
 * down their lane (model / scout·agency / studio) before any storytelling.
 * Compact, icon-led cards keep the routing fast; the Cast marquee that follows
 * carries the visual weight.
 */
export async function AudienceRouter() {
  const t = await getTranslations("landing");

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
      id="per-chi-e"
      className="scroll-mt-24 hairline-t bg-[var(--bg)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <SectionIndex n="01" className="mb-6">
              {t("audience.eyebrow")}
            </SectionIndex>
            <h2 className="text-display max-w-[16ch]">{t("audience.title")}</h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lead">
            {t("audience.subtitle")}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {lanes.map((lane, i) => {
            const Icon = lane.icon;
            return (
              <Reveal key={lane.href} delay={i * 90} className="flex flex-col">
                <Link
                  href={lane.href as never}
                  className="group relative flex grow flex-col gap-8 bg-[var(--bg-elevated)] hairline p-8 lg:p-10 transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-[var(--bg)] motion-safe:hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="h-px w-8 bg-[var(--rule-strong)]" aria-hidden="true" />
                    <Icon
                      className="h-6 w-6 text-[var(--ink)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-110"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex grow flex-col gap-3">
                    <p className="text-eyebrow italic">{lane.label}</p>
                    <h3 className="text-h2 text-[var(--ink)]">{lane.title}</h3>
                    <p className="text-body text-[var(--ink-2)]">{lane.desc}</p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-eyebrow text-[var(--ink)]">
                    {t("audience.discover")}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
