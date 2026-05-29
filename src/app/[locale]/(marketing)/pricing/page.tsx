import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";

type PlanKey = "model" | "scoutPro" | "agency" | "studio";
type Variant = "default" | "accent" | "outline";

const PLANS: { key: PlanKey; href: string; variant: Variant; featured?: boolean }[] = [
  { key: "model", href: "/register/model", variant: "outline" },
  { key: "scoutPro", href: "/register/scout", variant: "accent", featured: true },
  { key: "agency", href: "/contact", variant: "outline" },
  { key: "studio", href: "/register/studio", variant: "outline" },
];

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const tPlans = await getTranslations("pricing.plans");
  const tTx = await getTranslations("pricing.transactional");
  const txItems =
    (tTx.raw("items") as { name: string; rate: string; desc: string }[]) ?? [];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* ─── Header ─── */}
      <header className="py-16 lg:py-24 hairline-b">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <p className="text-eyebrow mb-6">
              {t("eyebrow")}
            </p>
            <h1 className="text-display max-w-4xl">{t("title")}</h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lead">{t("subtitle")}</p>
          </div>
        </div>
      </header>

      {/* ─── Plans grid · 4 equal columns ─── */}
      <section className="hairline-b">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--rule)]">
          {PLANS.map((plan, idx) => {
            const features =
              (tPlans.raw(`${plan.key}.features`) as string[]) ?? [];
            const isFeatured = plan.featured;
            const name = tPlans(`${plan.key}.name` as never) as string;
            const price = tPlans(`${plan.key}.price` as never) as string;
            const period = tPlans(`${plan.key}.period` as never) as string;
            const desc = tPlans(`${plan.key}.desc` as never) as string;
            const cta = tPlans(`${plan.key}.cta` as never) as string;

            return (
              <article
                key={plan.key}
                className={`relative flex flex-col p-8 lg:p-10 ${
                  isFeatured ? "bg-[var(--bg-soft)]" : "bg-[var(--bg)]"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 left-8 lg:left-10 -translate-y-1/2 bg-[var(--ink)] text-[var(--bg-elevated)] px-3 py-1 text-[12px] font-medium whitespace-nowrap">
                    {tPlans("scoutPro.badge")}
                  </div>
                )}

                <p className="text-eyebrow mb-10">
                  {String(idx + 1).padStart(2, "0")} · {name}
                </p>

                <p className="font-[var(--font-display)] font-light text-6xl lg:text-7xl leading-none tabular-nums text-[var(--ink)]">
                  {price}
                </p>
                <p className="mt-3 text-meta text-[var(--ink-3)] leading-snug min-h-[2.6em]">
                  {period}
                </p>

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
                  <p className="font-[var(--font-display)] font-light text-4xl lg:text-5xl leading-none tabular-nums text-[var(--ink)]">
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
