"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Megaphone } from "lucide-react";

import type { Opportunity } from "@/server/queries/opportunities";
import { cn } from "@/lib/utils";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

type Tab = "all" | "casting" | "job";

interface OpportunitiesBrowserProps {
  items: Opportunity[];
  locale: string;
  initialTab?: Tab;
}

export function OpportunitiesBrowser({
  items,
  locale,
  initialTab = "all",
}: OpportunitiesBrowserProps) {
  const t = useTranslations("pages.model.opportunities");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [paidOnly, setPaidOnly] = useState(false);

  const counts = useMemo(
    () => ({
      all: items.length,
      casting: items.filter((o) => o.kind === "casting").length,
      job: items.filter((o) => o.kind === "job").length,
    }),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (o) => (tab === "all" || o.kind === tab) && (!paidOnly || o.isPaid),
      ),
    [items, tab, paidOnly],
  );

  const emptyCopy =
    tab === "casting"
      ? { title: t("emptyCastingsTitle"), desc: t("emptyCastingsDesc") }
      : tab === "job"
        ? { title: t("emptyJobsTitle"), desc: t("emptyJobsDesc") }
        : { title: t("emptyAllTitle"), desc: t("emptyAllDesc") };

  return (
    <div>
      <SegmentedTabs
        aria-label={t("eyebrow")}
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        tabs={[
          { value: "all", label: t("tabAll"), count: counts.all },
          { value: "casting", label: t("tabCastings"), count: counts.casting },
          { value: "job", label: t("tabJobs"), count: counts.job },
        ]}
      />

      <div className="flex items-center justify-between gap-4 pt-4">
        <p className="text-meta text-[var(--ink-3)]">
          {t("count", { count: filtered.length })}
        </p>
        <button
          type="button"
          aria-pressed={paidOnly}
          onClick={() => setPaidOnly((v) => !v)}
          className={cn(
            "shrink-0 border px-3 py-1.5 text-[13px] transition-colors",
            paidOnly
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-elevated)]"
              : "border-[var(--rule-strong)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]",
          )}
        >
          {t("paidOnly")}
        </button>
      </div>

      {filtered.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.ul
            key={`${tab}:${paidOnly}`}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-2 hairline-t"
          >
            {filtered.map((o) => (
              <OpportunityCard key={`${o.kind}-${o.id}`} opportunity={o} locale={locale} />
            ))}
          </motion.ul>
        </AnimatePresence>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Megaphone} title={emptyCopy.title} description={emptyCopy.desc} />
        </div>
      )}
    </div>
  );
}
