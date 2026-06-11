import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/landing/reveal";
import { FileCheck, ShieldCheck, UserCheck } from "lucide-react";

/**
 * Verifica — the trust section and the platform's primary differentiator.
 * Rendered on a fixed-dark band (never theme-flipped) so it reads as a
 * credential page in the editorial flow: document checks, protections,
 * professionals-only access.
 */
export async function TrustSection() {
  const t = await getTranslations("landing");

  const pillars = [
    { icon: FileCheck, key: "documental" },
    { icon: ShieldCheck, key: "transparency" },
    { icon: UserCheck, key: "professionals" },
  ] as const;

  return (
    <section
      id="verifica"
      className="scroll-mt-24 bg-[var(--bg-soft)] py-24 lg:py-32 text-[var(--ink)]"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-16 lg:mb-24 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            {/* Kicker — light variant for the dark band */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--ink)]/30" aria-hidden="true" />
              <span className="text-eyebrow !text-[var(--ink)]/70">
                {t("verification.eyebrow")}
              </span>
            </div>
            <h2 className="font-display font-light text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.025em] text-[var(--ink)] max-w-[18ch]">
              {t("verification.title")}
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[clamp(1rem,1.3vw,1.25rem)] leading-relaxed text-[var(--ink)]/70 max-w-[40ch]">
              {t("verification.subtitle")}
            </p>
            <p className="mt-6 font-display italic text-[clamp(1rem,1.2vw,1.1875rem)] leading-[1.4] text-[var(--ink)]/55 max-w-[42ch]">
              {t("verification.marketContext")}
            </p>
          </div>
        </Reveal>

        <ol className="grid md:grid-cols-3 gap-px bg-[var(--ink)]/10 hairline-t border-[var(--ink)]/15">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal
                as="li"
                key={p.key}
                delay={i * 90}
                className="flex flex-col gap-6 bg-[var(--bg-soft)] px-8 py-10 lg:px-10 lg:py-12"
              >
                <Icon
                  className="h-7 w-7 text-[var(--ink-2)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="font-display text-[1.375rem] font-normal leading-snug text-[var(--ink)]">
                  {t(`verification.pillars.${p.key}.title`)}
                </h3>
                <p className="text-[15px] leading-relaxed text-[var(--ink)]/65">
                  {t(`verification.pillars.${p.key}.description`)}
                </p>
                <p className="mt-auto flex items-center gap-2.5 pt-6 text-[12px] tracking-[0.04em] text-[var(--ink)]/55">
                  <span className="h-px w-5 bg-[var(--ink)]/30" aria-hidden="true" />
                  {t(`verification.pillars.${p.key}.detail`)}
                </p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
