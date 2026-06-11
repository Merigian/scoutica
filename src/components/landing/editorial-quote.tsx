import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/landing/reveal";

/**
 * Editorial pull-quote — the manifesto voice between proof sections. No
 * fabricated testimonials; this is the platform speaking in its own register.
 */
export async function EditorialQuote() {
  const t = await getTranslations("landing");

  return (
    <section className="hairline-t bg-[var(--bg-soft)] py-28 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <p className="text-eyebrow italic">{t("quote.eyebrow")}</p>
          <blockquote className="font-display font-light text-[clamp(1.75rem,4.2vw,3.25rem)] leading-[1.16] tracking-[-0.02em] text-[var(--ink)] text-balance">
            {t("quote.text")}
          </blockquote>
          <span className="h-px w-10 bg-[var(--rule-strong)]" aria-hidden="true" />
          <cite className="not-italic text-meta">{t("quote.attribution")}</cite>
        </Reveal>
      </div>
    </section>
  );
}
