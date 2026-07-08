"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { SearchFiltersPanel } from "./search-filters";

/**
 * Responsive shell for the discover filters. On desktop the panel is inline; on
 * mobile it collapses to a single "Filtri" trigger that opens an editorial
 * bottom-sheet holding the exact same controls (no information is lost, just
 * re-housed in a native, thumb-friendly pattern).
 */
export function DiscoverFilters({
  locale,
  advancedFilters,
}: {
  locale: string;
  advancedFilters: boolean;
}) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const t = useTranslations("components.searchFilters");

  const activeCount = Array.from(searchParams.keys()).filter(
    (k) => !["page", "pageSize", "sortBy", "cols"].includes(k),
  ).length;

  return (
    <>
      {/* Desktop: inline panel */}
      <div className="hidden lg:block">
        <SearchFiltersPanel locale={locale} advancedFilters={advancedFilters} instanceId="d" />
      </div>

      {/* Mobile: trigger + bottom-sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[48px] w-full items-center justify-between gap-3 hairline bg-[var(--bg-soft)] px-4 text-left transition-colors active:bg-[var(--bg-elevated)]"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2.5 font-label text-[12px] uppercase tracking-[0.14em] text-[var(--ink)]">
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters")}
          </span>
          {activeCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center bg-[var(--ink)] px-1.5 font-label text-[11px] text-[var(--bg-elevated)]">
              {activeCount}
            </span>
          )}
        </button>

        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title={t("filters")}
          footer={
            <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
              {t("apply")}
            </Button>
          }
        >
          <SearchFiltersPanel locale={locale} advancedFilters={advancedFilters} instanceId="m" bare />
        </BottomSheet>
      </div>
    </>
  );
}
