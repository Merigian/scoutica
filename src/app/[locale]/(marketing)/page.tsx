import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FeaturedProfiles } from "@/components/landing/featured-profiles";
import { HeroToneSetter } from "@/components/landing/hero-tone-setter";
import { db } from "@/lib/db";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const LOCAL_HERO = "/images/hero-cover.webp";
const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=2400&q=88&auto=format&fit=crop";

const PATH_IMAGES = {
  model:
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1400&q=85&auto=format&fit=crop",
  // Behind-the-scenes: photographer shooting a model in studio — reads as "agency/casting".
  scout:
    "https://plus.unsplash.com/premium_photo-1663054300534-3be5c4c61ae3?w=1400&q=85&auto=format&fit=crop",
  studio:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85&auto=format&fit=crop",
};

function resolveHeroSrc(): string {
  try {
    const abs = path.join(process.cwd(), "public", "images", "hero-cover.webp");
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

  const issueDate = new Date()
    .toLocaleDateString(locale === "en" ? "en-US" : "it-IT", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <>
      <HeroToneSetter tone="dark" />

      {/* ───────── HERO — immersive editorial cover, full-bleed ───────── */}
      <section className="relative w-full min-h-[92vh] lg:min-h-screen overflow-hidden bg-[#15120E]">
        {/* Full-bleed cover photo */}
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[68%_22%] lg:object-[62%_28%]"
        />

        {/* Scrims — fixed dark in both themes (the cover reads like a magazine
            front, not theme-flipped). Top for nav, bottom + left for content. */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#15120E]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15120E]/90 via-[#15120E]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#15120E]/55 via-[#15120E]/10 to-transparent" />

        {/* Content rail — aligned to the 1440px grid */}
        <div className="relative z-10 mx-auto flex min-h-[92vh] lg:min-h-screen max-w-[1440px] flex-col px-6 sm:px-10 lg:px-12">
          {/* Masthead row under the nav */}
          <div className="flex items-center justify-between pt-24 lg:pt-28 text-meta !text-white/70">
            <span>N° 01</span>
            <span>{issueDate}</span>
          </div>

          {/* Cover statement — anchored bottom-left */}
          <div className="mt-auto pb-14 lg:pb-20 max-w-[44rem]">
            <p className="text-eyebrow !text-white/80 mb-6">{t("cover.manifestoTop")}</p>
            <h1 className="font-[var(--font-display)] font-light text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02] tracking-[-0.02em] text-white max-w-[18ch]">
              {t("hero.title")}
            </h1>
            <p className="mt-7 text-[clamp(1rem,1.3vw,1.25rem)] leading-relaxed text-white/80 max-w-[42ch]">
              {t("hero.subtitle")}
            </p>
            <div className="mt-9 lg:mt-11 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="!bg-[#FBF7EF] !text-[#1A1814] hover:!bg-white !border-0"
              >
                <Link href="/register/model" className="group whitespace-nowrap">
                  {t("hero.ctaModel")}
                  <ArrowUpRight className="h-4 w-4 group-arrow" />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-transparent !border-white/70 !text-white hover:!bg-white hover:!text-[var(--ink)]"
              >
                <Link href="/register/scout" className="whitespace-nowrap">
                  {t("hero.ctaScout")}
                </Link>
              </Button>
            </div>

            <div className="mt-12 lg:mt-14 pt-6 border-t border-white/15 flex items-baseline justify-between gap-6 max-w-[42rem]">
              <p className="text-eyebrow !text-white/70">{t("cover.manifestoBottom")}</p>
              <p className="text-meta !text-white/60">Milano · Roma · Firenze</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FEATURED — marquee of real models ───────── */}
      <FeaturedProfiles />

      {/* ───────── TRE VIE — 3 paths with editorial photos ───────── */}
      <section className="hairline-t bg-[var(--bg)] py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <p className="text-eyebrow mb-6">02 — Vie</p>
              <h2 className="text-h1 max-w-[20ch]">{t("features.title")}</h2>
            </div>
            <p className="lg:col-span-4 lg:col-start-9 text-lead">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {(
              [
                {
                  href: "/register/model",
                  img: PATH_IMAGES.model,
                  label: t("features.forModel"),
                  title: t("hero.ctaModel"),
                  desc: t("hero.ctaModelDesc"),
                },
                {
                  href: "/register/scout",
                  img: PATH_IMAGES.scout,
                  label: t("features.forScout"),
                  title: t("hero.ctaScout"),
                  desc: t("hero.ctaScoutDesc"),
                },
                {
                  href: "/register/studio",
                  img: PATH_IMAGES.studio,
                  label: t("features.forStudio"),
                  title: t("hero.ctaStudio"),
                  desc: t("hero.ctaStudioDesc"),
                },
              ] as const
            ).map((p) => (
              <Link
                key={p.href}
                href={p.href as never}
                className="group relative flex flex-col bg-[var(--bg-elevated)] hairline overflow-hidden transition-colors duration-500 hover:bg-[var(--bg)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-soft)]">
                  <Image
                    src={p.img}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-[filter] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:brightness-[0.94]"
                  />
                </div>
                <div className="p-8 lg:p-10 flex flex-col gap-4 grow">
                  <div className="flex items-baseline justify-between">
                    <p className="text-eyebrow italic">
                      {p.label}
                    </p>
                    <ArrowUpRight
                      className="h-4 w-4 text-[var(--ink-3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--ink)]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-h2 text-[var(--ink)]">{p.title}</h3>
                  <p className="text-body text-[var(--ink-2)]">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── BANDI — 3 mock open calls in 3-up grid ───────── */}
      <BandiSection t={t} />

      {/* ───────── MANIFESTO + NUMERI ───────── */}
      <section className="hairline-t bg-[var(--bg-soft)] py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7">
            <p className="text-eyebrow mb-6">04 — Manifesto</p>
            <h2 className="text-h1 mb-10 max-w-[22ch]">{t("cta.title")}</h2>
            <div className="space-y-6 max-w-2xl">
              <p className="text-lead">{t("hero.subtitle")}</p>
              <p className="text-lead">{t("pricingTeaser.lead")}</p>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col">
            {(
              [
                { label: t("statsStrip.modelsPublished"), value: modelCount },
                { label: t("statsStrip.scoutsVerified"), value: scoutCount },
                { label: t("statsStrip.regionsCovered"), value: 20 },
                { label: t("statsStrip.studiosPartner"), value: 50 },
              ] as const
            ).map((s, i) => (
              <div
                key={s.label}
                className={`flex items-baseline justify-between gap-6 py-5 ${
                  i > 0 ? "hairline-t" : ""
                }`}
              >
                <p className="text-body text-[var(--ink-2)]">{s.label}</p>
                <p className="font-[var(--font-display)] tabular-nums text-4xl lg:text-5xl font-light text-[var(--ink)] leading-none">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── METODO — 3 steps ───────── */}
      <section className="hairline-t bg-[var(--bg)] py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-5">
              <p className="text-eyebrow mb-6">05 — Metodo</p>
              <h2 className="text-h1">{t("howItWorks.title")}</h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-lead self-end">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <ol className="grid md:grid-cols-3 hairline-t">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <li
                key={k}
                className={`p-8 lg:p-10 hairline-b md:border-b-0 ${
                  i > 0 ? "md:hairline-l" : ""
                }`}
              >
                <p className="text-eyebrow mb-8">
                  {String(i + 1).padStart(2, "0")} / 03
                </p>
                <h3 className="text-h2 mb-5 text-[var(--ink)]">
                  {t(`howItWorks.${k}.title`)}
                </h3>
                <p className="text-body text-[var(--ink-2)] max-w-md">
                  {t(`howItWorks.${k}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── CHIUSURA — dark band with CTA + tariffe + wordmark ───────── */}
      <section className="bg-[var(--ink)] text-[var(--bg)]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow mb-6 !text-[var(--bg)]/65">06 — Coda</p>
            <h2 className="font-[var(--font-display)] font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-[var(--bg)] max-w-[22ch]">
              {t("cta.title")}
            </h2>
            <p className="mt-8 max-w-2xl font-[var(--font-display)] text-[clamp(1.125rem,1.4vw,1.375rem)] leading-[1.45] text-[var(--bg)]/75">
              {t("cta.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button variant="accent" size="lg" asChild>
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

          <div className="lg:col-span-4 lg:col-start-9 border border-[var(--bg)]/25 p-8 lg:p-10">
            <p className="text-meta !text-[var(--bg)]/65">
              {t("pricingTeaser.startingFrom")}
            </p>
            <p className="mt-3 font-[var(--font-display)] tabular-nums text-6xl lg:text-7xl font-light text-[var(--bg)] leading-none">
              €0
            </p>
            <p className="mt-3 text-body !text-[var(--bg)]/70">
              {t("pricingTeaser.period")}
            </p>
            <p className="mt-7 pt-5 border-t border-[var(--bg)]/20 text-eyebrow !text-[var(--bg)]/75">
              {t("pricingTeaser.titleLine1")}
            </p>
          </div>
        </div>

        <div className="hairline-t border-[var(--bg)]/20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 lg:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-meta !text-[var(--bg)]/60">
              {t("cover.masthead")} — {issueDate}
            </p>
            <p className="text-eyebrow !text-[var(--bg)]/55 italic">
              {t("cover.manifestoBottom")}
            </p>
          </div>
        </div>
      </section>
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
    <section className="hairline-t bg-[var(--bg-soft)]/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow mb-6">{t("bandi.eyebrow")}</p>
            <h2 className="text-h1 max-w-[22ch]">{t("bandi.title")}</h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lead">
            {t("bandi.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((b, i) => {
            const isClosing = b.status === "closingSoon";
            return (
              <Link
                key={i}
                href={"/register" as never}
                className="group relative flex flex-col bg-[var(--bg-elevated)] hairline transition-colors duration-500 hover:bg-[var(--bg)]"
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
                  <p className="mt-2 font-[var(--font-display)] text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1] tabular-nums text-[var(--ink)] whitespace-nowrap">
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
