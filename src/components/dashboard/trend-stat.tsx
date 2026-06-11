import { useTranslations } from "next-intl";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface TrendStatProps {
  label: string;
  value: number;
  previous: number;
  icon?: React.ReactNode;
}

/**
 * Compact analytics cell: current-period value + delta vs the previous period.
 * Uses only data the dashboards already compute — no new tracking.
 */
export function TrendStat({ label, value, previous, icon }: TrendStatProps) {
  const t = useTranslations("components.trend");
  const delta = value - previous;
  const dir = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  return (
    <div className="p-6 lg:p-8 hairline-b hairline-r h-full flex flex-col">
      <div className="flex items-center justify-between text-[var(--ink-3)]">
        <span className="text-eyebrow">{label}</span>
        {icon}
      </div>
      <p className="mt-6 font-display font-light tabular-nums text-[clamp(2.25rem,3vw,3rem)] leading-none text-[var(--ink)]">
        {value}
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-meta">
        {dir === "up" && (
          <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
        )}
        {dir === "down" && (
          <ArrowDownRight className="h-3.5 w-3.5 text-[var(--danger)]" aria-hidden="true" />
        )}
        {dir === "flat" && (
          <Minus className="h-3.5 w-3.5 text-[var(--ink-3)]" aria-hidden="true" />
        )}
        <span>
          {dir === "flat"
            ? t("flat")
            : `${delta > 0 ? "+" : ""}${delta} ${t("vsLastMonth")}`}
        </span>
      </p>
    </div>
  );
}
