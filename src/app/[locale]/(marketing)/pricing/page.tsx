import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { RevealText } from "@/components/motion/reveal-text";
import { FadeIn } from "@/components/motion/fade-in";
import { ArrowUpRight, Check } from "lucide-react";

type PlanKey = "model" | "scoutPro" | "agency" | "studio";
type Variant = "default" | "accent" | "outline";
type Interval = "month" | "year";

const PLANS: { key: PlanKey; href: string; variant: Variant; featured?: boolean; intervalAware: boolean }[] = [
  { key: "model", href: "/register/model", variant: "outline", intervalAware: false },
  { key: "scoutPro", href: "/register/scout", variant: "accent", featured: true, intervalAware: true },
  { key: "agency", href: "/register/scout?type=agency", variant: "outline", intervalAware: true },
  { key: "studio", href: "/register/studio", variant: "outline", intervalAware: true },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  const sp = await searchParams;
  const interval: Interval = sp.interval === "year" ? "year" : "month";

  const t = await getTranslations("pricing");
  const tPlans = await getTranslations("pricing.plans");
  const tTx = await getTranslations("pricing.transactional");
  const tCompare = await getTranslations("pricing.comparison");
  const txItems =
    (tTx.raw("items") as { name: string; rate: string; desc: string }[]) ?? [];
  const compareRows =
    (tCompare.raw("rows") as {
      label: string;
      scoutPro: string;
      agency: string;
      studio: string;
    }[]) ?? [];
  const compareCols = ["scoutPro", "agency", "studio"] as const;

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* ─── Header ─── */}
      <header className="py-16 lg:py-24 hairline-b">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <FadeIn onMount>
              <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
            </FadeIn>
            <RevealText as="h1" text={t("title")} className="text-display max-w-4xl" delay={0.1} />
          </div>
          <FadeIn onMount delay={0.3} className="lg:col-span-4">
            <p className="text-lead">{t("subtitle")}</p>
          </FadeIn>
        </div>
      </header>

      {/* ─── Interval toggle (server-side via searchParams) ─── */}
      <div className="py-8 flex justify-center">
        <div className="inline-flex rounded-md border p-1 text-sm">
          <Link
            href={{ pathname: "/pricing", query: { interval: "month" } } as never}
            scroll={false}
            className={`px-4 py-2 rounded-sm transition-colors ${
              interval === "month"
                ? "bg-[var(--ink)] text-[var(--bg-elevated)]"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            {t("intervalMonthly")}
          </Link>
          <Link
            href={{ pathname: "/pricing", query: { interval: "year" } } as never}
            scroll={false}
            className={`px-4 py-2 rounded-sm transition-colors ${
              interval === "year"
                ? "bg-[var(--ink)] text-[var(--bg-elevated)]"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            {t("intervalAnnual")}{" "}
            <span className="text-xs opacity-70 ml-1">{t("annualDiscount")}</span>
          </Link>
        </div>
      </div>

      <p className="mx-auto -mt-2 mb-2 max-w-xl text-center text-meta text-[var(--ink-3)] leading-relaxed">
        {t("afterTrial")}
      </p>

      {/* ─── Plans grid · 4 equal columns ─── */}
      <section className="hairline-b">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--rule)]">
          {PLANS.map((plan, idx) => {
            const features =
              (tPlans.raw(`${plan.key}.features`) as string[]) ?? [];
            const isFeatured = plan.featured;
            const name = tPlans(`${plan.key}.name` as never) as string;
            // For interval-aware plans, pick annual or monthly price/period keys.
            const priceKey = plan.intervalAware && interval === "year" ? "priceAnnual" : "price";
            const periodKey = plan.intervalAware && interval === "year" ? "periodAnnual" : "period";
            const price = tPlans(`${plan.key}.${priceKey}` as never) as string;
            const period = tPlans(`${plan.key}.${periodKey}` as never) as string;
            const desc = tPlans(`${plan.key}.desc` as never) as string;
            const cta = tPlans(`${plan.key}.cta` as never) as string;
            const showFounding = plan.key === "agency";

            return (
              <article
                key={plan.key}
                className={`group relative flex flex-col p-8 lg:p-10 transition-colors duration-500 ${
                  isFeatured
                    ? "bg-[var(--bg-soft)] hover:bg-[var(--bg-elevated)]"
                    : "bg-[var(--bg)] hover:bg-[var(--bg-soft)]"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 left-8 lg:left-10 -translate-y-1/2 bg-[var(--ink)] text-[var(--bg-elevated)] px-3 py-1 text-[12px] font-medium whitespace-nowrap">
                    {tPlans("scoutPro.badge")}
                  </div>
                )}
                {showFounding && (
                  <div className="absolute top-0 right-8 lg:right-10 -translate-y-1/2 bg-[var(--accent)] text-[var(--bg-elevated)] px-3 py-1 text-[11px] font-medium whitespace-nowrap">
                    {tPlans("agency.foundingBadge")}
                  </div>
                )}

                <p className="text-eyebrow mb-10">{name}</p>

                <p className="font-display font-light text-6xl lg:text-7xl leading-none tabular-nums text-[var(--ink)]">
                  {price}
                </p>
                <p className="mt-3 text-meta text-[var(--ink-3)] leading-snug min-h-[2.6em]">
                  {period}
                </p>
                {plan.intervalAware && interval === "year" && (
                  <p className="mt-3 inline-flex w-fit items-center bg-[var(--ink)]/[0.06] px-2.5 py-1 text-[12px] font-medium text-[var(--ink)]">
                    {tPlans(`${plan.key}.priceAnnualSaving` as never) as string}
                  </p>
                )}

                <p className="mt-6 text-sm text-[var(--ink-2)] leading-relaxed min-h-[3.6em]">
                  {desc}
                </p>

                <div className="mt-8 pt-8 hairline-t flex-1">
                  <ul className="space-y-3.5">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-[var(--ink-2)] leading-relaxed"
                      >
                        <Check
                          className="h-4 w-4 mt-0.5 shrink-0 text-[var(--ink)]"
                          strokeWidth={1.5}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10">
                  <Button
                    variant={plan.variant}
                    size="lg"
                    className="w-full group"
                    asChild
                  >
                    <Link href={plan.href as never}>
                      {cta}
                      <ArrowUpRight className="h-4 w-4 ml-2 group-arrow" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── Comparison matrix ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="mb-12 lg:mb-16 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <p className="text-eyebrow mb-6">{tCompare("eyebrow")}</p>
            <h2 className="text-h1">{tCompare("title")}</h2>
          </div>
          <p className="lg:col-span-4 text-lead">{tCompare("subtitle")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="hairline-b">
                <th
                  scope="col"
                  className="py-5 pr-6 align-bottom text-meta font-normal text-[var(--ink-3)]"
                >
                  {tCompare("featureCol")}
                </th>
                {compareCols.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="py-5 px-4 align-bottom text-eyebrow whitespace-nowrap text-[var(--ink)]"
                  >
                    {tCompare(`cols.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className="hairline-b">
                  <th
                    scope="row"
                    className="py-4 pr-6 align-middle text-sm font-normal text-[var(--ink-2)]"
                  >
                    {row.label}
                  </th>
                  {compareCols.map((c) => {
                    const v = row[c];
                    return (
                      <td key={c} className="py-4 px-4 align-middle">
                        {v === "yes" ? (
                          <>
                            <Check
                              className="h-4 w-4 text-[var(--ink)]"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            <span className="sr-only">{tCompare("yesLabel")}</span>
                          </>
                        ) : v === "no" ? (
                          <>
                            <span aria-hidden="true" className="text-[var(--ink-3)]">
                              {tCompare("no")}
                            </span>
                            <span className="sr-only">{tCompare("noLabel")}</span>
                          </>
                        ) : v === "soon" ? (
                          <span className="inline-flex items-center border border-[var(--rule)] px-2 py-0.5 text-[11px] text-[var(--ink-3)]">
                            {tCompare("soonLabel")}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--ink)]">{v}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Take-rate section ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p className="text-eyebrow mb-6">{tTx("label")}</p>
            <h2 className="text-h2 max-w-sm">{tTx("title")}</h2>
            <p className="mt-6 text-sm text-[var(--ink-2)] leading-relaxed max-w-sm">
              {t("transactionalNote")}
            </p>
          </div>
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-px bg-[var(--rule)] hairline">
              {txItems.map((item, i) => (
                <div key={i} className="bg-[var(--bg)] p-8 lg:p-10 flex flex-col">
                  <p className="font-display font-light text-4xl lg:text-5xl leading-none tabular-nums text-[var(--ink)]">
                    {item.rate}
                  </p>
                  <p className="mt-6 text-eyebrow text-[var(--ink)]">
                    {item.name}
                  </p>
                  <p className="mt-3 text-sm text-[var(--ink-2)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer note ─── */}
      <footer className="py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-4">{t("payTeaserEyebrow")}</p>
          <p className="text-body text-[var(--ink-2)]">
            {t("promotedTeaser")}
          </p>
          <div className="mt-8">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link href="/about">
                {t("payTeaserCta")}
                <ArrowUpRight className="h-4 w-4 ml-2 group-arrow" />
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
