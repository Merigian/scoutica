import { existsSync } from "fs";
import path from "path";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/landing/cinematic-hero";
import { AudienceDoors } from "@/components/landing/audience-doors";
import { StickyCta } from "@/components/landing/sticky-cta";
import { FeaturedProfiles } from "@/components/landing/featured-profiles";
import { TrustSection } from "@/components/landing/trust-section";
import { StudiosShowcase } from "@/components/landing/studios-showcase";
import { HeroToneSetter } from "@/components/landing/hero-tone-setter";
import { Reveal } from "@/components/landing/reveal";
import { CountUp } from "@/components/landing/count-up";
import { SectionIndex } from "@/components/landing/section-index";
import { db } from "@/lib/db";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const LOCAL_HERO = "/images/marghe-hero.png";
const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=2400&q=88&auto=format&fit=crop";

function resolveHeroSrc(): string {
  try {
    const abs = path.join(process.cwd(), "public", "images", "marghe-hero.png");
    return existsSync(abs) ? LOCAL_HERO : HERO_FALLBACK;
  } catch {
    return HERO_FALLBACK;
  }
}

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const heroSrc = resolveHeroSrc();

  const [modelCount, scoutCount] = await Promise.all([
    db.modelProfile.count({ where: { isPublished: true } }),
    db.scoutProfile.count({ where: { verificationStatus: "APPROVED" } }),
  ]).catch(() => [0, 0] as const);

  const stats = [
    { label: t("statsStrip.modelsPublished"), value: modelCount },
    { label: t("statsStrip.scoutsVerified"), value: scoutCount },
    { label: t("statsStrip.regionsCovered"), value: 20 },
    { label: t("statsStrip.studiosPartner"), value: 50 },
  ];

  return (
    <>
      <HeroToneSetter tone="dark" />

      {/* ───────── HERO — cinematic Atelier Noir cover ───────── */}
      <CinematicHero heroSrc={heroSrc} />

      {/* ───────── PER CHI È — three audiences as horizontal doors ───────── */}
      <AudienceDoors />

      {/* ───────── CAST — volti reali (social proof, early) ───────── */}
      <div id="cast" className="scroll-mt-24">
        <FeaturedProfiles />
      </div>

      {/* ───────── MANIFESTO — what Scoutica stands for ───────── */}
      <section className="bg-[var(--bg)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <Reveal className="max-w-[64rem]">
            <p className="text-eyebrow mb-7">{t("quote.eyebrow")}</p>
            <h2 className="font-display font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-[var(--ink)]">
              {t("quote.text")}
            </h2>
            <p className="mt-8 text-meta">{t("quote.attribution")}</p>
          </Reveal>
        </div>
      </section>

      {/* ───────── METODO — 3 steps (orienta prima della prova) ───────── */}
      <section
        id="metodo"
        className="scroll-mt-24 hairline-t bg-[var(--bg)] py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <Reveal className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <SectionIndex n="07" className="mb-6">{t("sections.method")}</SectionIndex>
              <h2 className="text-display text-balance">{t("howItWorks.title")}</h2>
            </div>
            <p className="lg:col-span-4 lg:col-start-9 text-lead self-end">
              {t("howItWorks.subtitle")}
            </p>
          </Reveal>

          <ol className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-0 md:overflow-visible md:px-0 md:snap-none md:hairline-t [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <Reveal
                as="li"
                key={k}
                delay={i * 90}
                className={`min-w-[78vw] snap-start bg-[var(--bg-soft)] p-8 sm:min-w-[52vw] md:min-w-0 md:bg-transparent md:p-10 ${
                  i > 0 ? "md:hairline-l" : ""
                }`}
              >
                <p className="font-display font-light tabular-nums text-[clamp(2rem,3vw,2.75rem)] leading-none text-[var(--ink-3)] mb-6">
                  0{i + 1}
                </p>
                <h3 className="text-h2 mb-5 text-[var(--ink)]">
                  {t(`howItWorks.${k}.title`)}
                </h3>
                <p className="text-body text-[var(--ink-2)] max-w-md">
                  {t(`howItWorks.${k}.description`)}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── 03 — VERIFICA — trust differentiator (dark) ───────── */}
      <TrustSection />

      {/* ───────── 04 — BANDI — 3 mock open calls in 3-up grid ───────── */}
      <BandiSection t={t} />

      {/* ───────── STUDI — bookable studios showcase ───────── */}
      <StudiosShowcase />

      {/* ───────── MANIFESTO + NUMERI ───────── */}
      <section
        id="manifesto"
        className="scroll-mt-24 hairline-t bg-[var(--bg-soft)] py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <Reveal className="grid lg:grid-cols-12 gap-10 lg:gap-20 items-end">
            <div className="lg:col-span-7">
              <SectionIndex n="06" className="mb-6">{t("sections.manifesto")}</SectionIndex>
              <h2 className="font-display font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.025em] text-[var(--ink)] max-w-[18ch]">
                {t("cta.title")}
              </h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-lead max-w-[42ch]">
              {t("pricingTeaser.lead")}
            </p>
          </Reveal>

          {/* Numbers — the review in figures */}
          <ol className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[var(--rule)]">
            {stats.map((s, i) => (
              <Reveal
                as="li"
                key={s.label}
                delay={i * 70}
                className="border-r border-b border-[var(--rule)] px-6 lg:px-8 py-10 lg:py-14"
              >
                <p className="font-display font-light tabular-nums text-[clamp(2.75rem,5.5vw,4.75rem)] leading-[0.92] text-[var(--ink)]">
                  <CountUp value={s.value} locale={locale} />
                </p>
                <p className="mt-4 text-meta max-w-[16ch]">{s.label}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── CHIUSURA — dark band with CTA + tariffe + wordmark ───────── */}
      <section className="bg-[var(--ink)] text-[var(--bg)]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <h2 className="font-display font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-[var(--bg)] max-w-[22ch]">
              {t("socialProof.title")}
            </h2>
            <p className="mt-8 max-w-2xl font-display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-[1.45] text-[var(--bg)]/75">
              {t("cta.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                size="lg"
                asChild
                className="!bg-[var(--bg)] !text-[var(--ink)] hover:!opacity-90 !border-0"
              >
                <Link href="/register" className="group">
                  {t("cta.button")}
                  <ArrowUpRight className="h-4 w-4 group-arrow" />
                </Link>
              </Button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-2 py-3 text-[15px] text-[var(--bg)]/85 hover:text-[var(--bg)] transition-colors"
              >
                {t("pricingTeaser.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 border border-[var(--bg)]/25">
            {/* Per modelli — gratuito */}
            <div className="p-8 lg:p-10">
              <p className="text-eyebrow italic !text-[var(--bg)]/70">
                {t("features.forModel")}
              </p>
              <p className="mt-4 font-display tabular-nums text-6xl lg:text-7xl font-light text-[var(--bg)] leading-none">
                €0
              </p>
              <p className="mt-3 text-meta !text-[var(--bg)]/60">
                {t("pricingTeaser.freeLabel")}
              </p>
            </div>
            {/* Per scout & agenzie — a pagamento */}
            <div className="p-8 lg:p-10 hairline-t border-[var(--bg)]/20">
              <p className="text-eyebrow italic !text-[var(--bg)]/70">
                {t("features.forScout")}
              </p>
              <p className="mt-4 flex items-baseline gap-2 font-display tabular-nums text-4xl lg:text-5xl font-light text-[var(--bg)] leading-none">
                {t("pricingTeaser.proPrice")}
                <span className="text-meta not-italic !text-[var(--bg)]/60">
                  {t("pricingTeaser.perMonth")}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="hairline-t border-[var(--bg)]/20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 lg:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-meta !text-[var(--bg)]/60">
              {t("cover.masthead")}
            </p>
            <p className="text-eyebrow !text-[var(--bg)]/55 italic">
              {t("cover.manifestoBottom")}
            </p>
          </div>
        </div>
      </section>

      <StickyCta />
    </>
  );
}

// ─── Bandi (mock preview — illustrative samples only) ───
type BandoType = "casting" | "job" | "editorial";
type BandoStatus = "open" | "closingSoon";
type Bando = {
  type: BandoType;
  title: string;
  scout: string;
  city: string;
  description: string;
  fee: string;
  shootDate: string;
  daysLeft: number;
  status: BandoStatus;
};

function BandiSection({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations<"landing">>>;
}) {
  const items = (t.raw("bandi.items") as Bando[]).slice(0, 3);

  return (
    <section
      id="bandi"
      className="scroll-mt-24 hairline-t bg-[var(--bg-soft)]/40 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <SectionIndex n="04" className="mb-6">{t("bandi.eyebrow")}</SectionIndex>
            <h2 className="text-display max-w-[16ch]">{t("bandi.title")}</h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lead">
            {t("bandi.subtitle")}
          </p>
        </Reveal>

        <div className="flex md:grid md:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
          {items.map((b, i) => {
            const isClosing = b.status === "closingSoon";
            return (
              <Reveal
                key={i}
                delay={i * 90}
                className="flex flex-col min-w-[82vw] sm:min-w-[68vw] md:min-w-0 snap-start"
              >
                <Link
                  href={"/register" as never}
                  className="group relative flex grow flex-col bg-[var(--bg-elevated)] hairline transition-colors duration-500 hover:bg-[var(--bg)]"
                >
                {/* Tipo */}
                <div className="flex items-center justify-between px-7 lg:px-9 pt-7 lg:pt-8 pb-4 hairline-b border-dashed">
                  <span className="text-eyebrow italic">
                    {t(`bandi.type.${b.type}` as never)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 text-eyebrow italic whitespace-nowrap ${
                      isClosing
                        ? "!text-[var(--danger)]"
                        : "!text-[var(--success)]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isClosing
                          ? "bg-[var(--danger)]"
                          : "bg-[var(--success)]"
                      }`}
                      aria-hidden="true"
                    />
                    {t(`bandi.status.${b.status}` as never)}
                  </span>
                </div>

                {/* Titolo + scout */}
                <div className="px-7 lg:px-9 pt-6 lg:pt-7 pb-4">
                  <h3 className="text-h2 text-[var(--ink)] text-balance leading-[1.05]">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-meta">
                    {b.scout}{" "}
                    <span className="text-[var(--ink-3)]">·</span> {b.city}
                  </p>
                </div>

                {/* Descrizione */}
                <div className="px-7 lg:px-9 pb-8">
                  <p className="text-body text-[var(--ink-2)] leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Compenso — protagonista */}
                <div className="mt-auto px-7 lg:px-9 pt-7 pb-3 hairline-t">
                  <span className="text-eyebrow">
                    {t("bandi.compensoLabel")}
                  </span>
                  <p className="mt-2 font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1] tabular-nums text-[var(--ink)] whitespace-nowrap">
                    {b.fee}
                  </p>
                </div>

                {/* Meta row: Riprese + Scadenza */}
                <div className="px-7 lg:px-9 pb-6 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-meta">
                  <span>
                    <span className="text-eyebrow mr-2">
                      {t("bandi.periodLabel")}
                    </span>
                    <span className="italic">{b.shootDate}</span>
                  </span>
                  <span>
                    <span className="text-eyebrow mr-2">
                      {t("bandi.deadlineLabel")}
                    </span>
                    <span className="tabular-nums">
                      {t("bandi.daysLeft", { n: b.daysLeft })}
                    </span>
                  </span>
                </div>

                {/* Footer CTA */}
                <div className="px-7 lg:px-9 py-5 hairline-t flex items-center justify-end gap-4">
                  <span className="inline-flex items-center gap-2 text-eyebrow text-[var(--ink)]">
                    {t("bandi.ctaLabel")}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href={"/register" as never}
            className="group inline-flex items-center gap-2 text-eyebrow hover:text-[var(--ink)] transition-colors"
          >
            {t("bandi.viewAll")}
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
