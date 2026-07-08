"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Faders } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { SearchFiltersPanel } from "./search-filters";

/**
 * Responsive shell for the discover filters. On desktop the panel is inline;
 * on mobile the trigger is a 44px filter icon (with active-count badge)
 * portaled into the sticky app header — always one thumb-reach away — that
 * opens an editorial bottom-sheet holding the exact same controls.
 */
export function DiscoverFilters({
  locale,
  advancedFilters,
}: {
  locale: string;
  advancedFilters: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const searchParams = useSearchParams();
  const t = useTranslations("components.searchFilters");

  useEffect(() => {
    setHeaderSlot(document.getElementById("scoutica-header-actions"));
  }, []);

  const activeCount = Array.from(searchParams.keys()).filter(
    (k) => !["page", "pageSize", "sortBy", "cols"].includes(k),
  ).length;

  return (
    <>
      {/* Desktop: inline panel */}
      <div className="hidden lg:block">
        <SearchFiltersPanel locale={locale} advancedFilters={advancedFilters} instanceId="d" />
      </div>

      {/* Mobile: header filter icon + bottom-sheet */}
      {headerSlot &&
        createPortal(
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("filters")}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="relative flex h-11 w-11 items-center justify-center text-[var(--ink)] transition-opacity active:opacity-70"
          >
            <Faders className="h-[22px] w-[22px]" />
            {activeCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-[var(--ink)] px-1 font-label text-[10px] leading-none text-[var(--bg)]">
                {activeCount}
              </span>
            )}
          </button>,
          headerSlot,
        )}

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
    </>
  );
}
