"use client";

/**
 * PricingPlans — interactive plans block for the pricing page.
 *
 * Adapted from a 21st.dev "Pricing Section" layout (animated Monthly/Yearly
 * toggle + animated prices + staggered reveal) but fully re-skinned to the
 * Atelier Noir design system: obsidian/bone tokens, hairlines, radius 0,
 * Bodoni/Archivo — no sparkles, glow or chromatic accent.
 *
 * Real Scoutica plan data + i18n + CTAs are preserved. To revert to the
 * previous static (server-side) pricing block, restore pricing/page.tsx and
 * delete this file.
 */

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";

type PlanKey = "model" | "scoutPro" | "agency" | "studio";
type Variant = "default" | "accent" | "outline";
type Interval = "month" | "year";

const PLANS: {
  key: PlanKey;
  href: string;
  variant: Variant;
  featured?: boolean;
  founding?: boolean;
  intervalAware: boolean;
}[] = [
  { key: "model", href: "/register/model", variant: "outline", intervalAware: false },
  { key: "scoutPro", href: "/register/scout", variant: "accent", featured: true, intervalAware: true },
  { key: "agency", href: "/register/scout?type=agency", variant: "outline", founding: true, intervalAware: true },
  { key: "studio", href: "/register/studio", variant: "outline", intervalAware: true },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function PricingPlans() {
  const t = useTranslations("pricing");
  const tPlans = useTranslations("pricing.plans");
  const reduce = useReducedMotion();
  const [interval, setIntervalState] = useState<Interval>("month");

  const intervals: { value: Interval; label: string; hint?: string }[] = [
    { value: "month", label: t("intervalMonthly") },
    { value: "year", label: t("intervalAnnual"), hint: t("annualDiscount") },
  ];

  return (
    <>
      {/* ─── Animated interval toggle ─── */}
      <div className="py-8 flex justify-center">
        <div
          role="group"
          aria-label={t("intervalMonthly") + " / " + t("intervalAnnual")}
          className="relative inline-flex hairline bg-[var(--bg-soft)] p-1"
        >
          {intervals.map((opt) => {
            const active = interval === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntervalState(opt.value)}
                aria-pressed={active}
                className="relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-300"
              >
                {active && (
                  <motion.span
                    layoutId="pricing-interval-pill"
                    className="absolute inset-0 bg-[var(--ink)]"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                )}
                <span
                  className="relative z-10 whitespace-nowrap"
                  style={{ color: active ? "var(--bg-elevated)" : "var(--ink-2)" }}
                >
                  {opt.label}
                  {opt.hint && (
                    <span className="ml-2 text-xs opacity-70">{opt.hint}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mx-auto -mt-2 mb-2 max-w-xl text-center text-meta text-[var(--ink-3)] leading-relaxed">
        {t("afterTrial")}
      </p>

      {/* ─── Plans grid · 4 hairline columns ─── */}
      <section className="hairline-b">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--rule)]">
          {PLANS.map((plan, idx) => {
            const features = (tPlans.raw(`${plan.key}.features`) as string[]) ?? [];
            const isFeatured = plan.featured;
            const name = tPlans(`${plan.key}.name` as never) as string;
            const annual = plan.intervalAware && interval === "year";
            const price = tPlans(
              `${plan.key}.${annual ? "priceAnnual" : "price"}` as never,
            ) as string;
            const period = tPlans(
              `${plan.key}.${annual ? "periodAnnual" : "period"}` as never,
            ) as string;
            const desc = tPlans(`${plan.key}.desc` as never) as string;
            const cta = tPlans(`${plan.key}.cta` as never) as string;

            return (
              <motion.article
                key={plan.key}
                initial={reduce ? undefined : { opacity: 0, y: 22 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: EASE }}
                className={`group relative flex flex-col p-8 lg:p-10 transition-colors duration-500 ${
                  isFeatured
                    ? "bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]"
                    : "bg-[var(--bg)] hover:bg-[var(--bg-soft)]"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 left-8 lg:left-10 -translate-y-1/2 bg-[var(--ink)] text-[var(--bg-elevated)] px-3 py-1 text-[12px] font-medium whitespace-nowrap">
                    {tPlans("scoutPro.badge")}
                  </div>
                )}
                {plan.founding && (
                  <div className="absolute top-0 right-8 lg:right-10 -translate-y-1/2 bg-[var(--accent)] text-[var(--bg-elevated)] px-3 py-1 text-[11px] font-medium whitespace-nowrap">
                    {tPlans("agency.foundingBadge")}
                  </div>
                )}

                <p className="text-eyebrow mb-10">{name}</p>

                <div className="relative overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.p
                      key={price}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                      transition={{ duration: 0.32, ease: EASE }}
                      className="font-display font-light text-6xl lg:text-7xl leading-none tabular-nums text-[var(--ink)]"
                    >
                      {price}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <p className="mt-3 text-meta text-[var(--ink-3)] leading-snug min-h-[2.6em]">
                  {period}
                </p>
                {annual && (
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
              </motion.article>
            );
          })}
        </div>
      </section>
    </>
  );
}
