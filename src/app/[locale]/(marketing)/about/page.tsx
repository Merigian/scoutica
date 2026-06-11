import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site";
import { RevealText } from "@/components/motion/reveal-text";
import { FadeIn } from "@/components/motion/fade-in";
import { ImageReveal } from "@/components/motion/image-reveal";
import { ArrowUpRight } from "lucide-react";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85";

type PrincipleItem = { n: string; k: string; d: string };

export default async function AboutPage() {
  const t = await getTranslations("about");

  const values = [
    { key: "safety", title: t("safety"), desc: t("safetyDesc") },
    { key: "professionalism", title: t("professionalism"), desc: t("professionalismDesc") },
    { key: "quality", title: t("quality"), desc: t("qualityDesc") },
    { key: "italyFirst", title: t("italyFirst"), desc: t("italyFirstDesc") },
  ];

  const principles = (t.raw("principles.items") as PrincipleItem[]) ?? [];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* ─── Masthead ─── */}
      <header className="py-20 lg:py-32 hairline-b">
        <FadeIn onMount>
          <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
        </FadeIn>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <RevealText
            as="h1"
            text={t("title")}
            className="lg:col-span-8 text-display max-w-[14ch]"
            delay={0.1}
          />
          <FadeIn onMount delay={0.3} className="lg:col-span-4">
            <p className="text-lead">{t("lead")}</p>
          </FadeIn>
        </div>
      </header>

      {/* ─── Editorial image band ─── */}
      <ImageReveal
        src={ABOUT_IMG}
        alt=""
        className="aspect-[21/9] w-full"
        sizes="100vw"
        priority
      />

      {/* ─── Manifesto ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <p className="lg:col-span-4 text-eyebrow lg:sticky lg:top-28 self-start">
            Manifesto
          </p>
          <div className="lg:col-span-8">
            <p
              className="text-h2 max-w-3xl text-[var(--ink)]"
              dangerouslySetInnerHTML={{ __html: t.raw("intro1") as string }}
            />
            <p className="mt-8 text-body text-[var(--ink-2)] max-w-3xl text-[1.0625rem] leading-[1.7]">
              {t("intro2")}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Perché adesso ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <p className="lg:col-span-4 text-eyebrow lg:sticky lg:top-28 self-start">
            {t("whyNow.eyebrow")}
          </p>
          <div className="lg:col-span-8">
            <h2 className="text-h1 max-w-3xl">{t("whyNow.title")}</h2>
            <p className="mt-8 text-body text-[var(--ink-2)] max-w-3xl text-[1.0625rem] leading-[1.7]">
              {t("whyNow.body")}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Valori ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="mb-14 grid lg:grid-cols-12 gap-10">
          <p className="lg:col-span-4 text-eyebrow">{t("valuesTitle")}</p>
          <h2 className="lg:col-span-8 text-h1 max-w-2xl">{t("valuesTitle")}</h2>
        </div>
        <div className="grid md:grid-cols-2 hairline-t">
          {values.map((v, i) => (
            <article
              key={v.key}
              className={`p-10 lg:p-12 hairline-b ${i % 2 === 0 ? "md:hairline-r" : ""}`}
            >
              <h3 className="font-display text-2xl lg:text-[28px] leading-tight tracking-tight mb-5 text-[var(--ink)]">
                {v.title}
              </h3>
              <p className="text-body text-[var(--ink-2)] max-w-md">{v.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Principi ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="mb-14 grid lg:grid-cols-12 gap-10">
          <p className="lg:col-span-4 text-eyebrow">{t("principles.eyebrow")}</p>
          <h2 className="lg:col-span-8 text-h1 max-w-2xl">{t("principles.title")}</h2>
        </div>
        <ol className="hairline-t">
          {principles.map((p) => (
            <li
              key={p.n}
              className="grid grid-cols-12 gap-6 lg:gap-10 py-8 lg:py-10 hairline-b items-start"
            >
              <h3 className="col-span-12 lg:col-span-5 font-display text-xl lg:text-2xl leading-tight tracking-tight text-[var(--ink)]">
                {p.k}
              </h3>
              <p className="col-span-12 lg:col-span-7 text-body text-[var(--ink-2)] max-w-xl">
                {p.d}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Closing CTA ─── */}
      <section className="-mx-6 lg:-mx-12 hairline-b bg-[var(--bg-soft)] px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <p className="text-eyebrow mb-6">{t("closing.eyebrow")}</p>
            <h2 className="text-display max-w-[16ch]">{t("closing.title")}</h2>
            <p className="mt-6 text-lead max-w-2xl">{t("closing.body")}</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end flex w-full flex-col gap-4 sm:max-w-xs">
            <Button size="lg" className="w-full group" asChild>
              <Link href="/register">
                {t("closing.ctaPrimary")}
                <ArrowUpRight className="h-4 w-4 ml-2 group-arrow" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/pricing">{t("closing.ctaSecondary")}</Link>
            </Button>
            <p className="mt-2 text-meta text-[var(--ink-3)] leading-relaxed">
              {t("closing.contactLabel")}{" "}
              <a
                href={`mailto:${SITE_CONFIG.links.email}`}
                className="link-underline text-[var(--ink)]"
              >
                {t("closing.contactCta")} — {SITE_CONFIG.links.email}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Made in Milano ─── */}
      <footer className="py-16 lg:py-20 text-center">
        <p className="font-display text-2xl lg:text-[28px] leading-tight tracking-tight text-[var(--ink)]">
          {t("madeIn.line1")}
        </p>
        <p className="mt-3 text-eyebrow text-[var(--ink-3)]">{t("madeIn.line2")}</p>
      </footer>
    </div>
  );
}
