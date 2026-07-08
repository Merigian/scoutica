"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface StudioFiltersProps {
  lang: "it" | "en";
  studioTypes: { value: string; label: string }[];
  regions: string[];
  initialQuery?: string;
  initialRegion?: string;
  initialType?: string;
  initialSort?: string;
  /** Route the filters apply to — lets the dashboard directory stay in-shell. */
  basePath?: string;
}

export function StudioFilters({
  lang,
  studioTypes,
  regions,
  initialQuery = "",
  initialRegion = "",
  initialType = "",
  initialSort = "newest",
  basePath = "/studios",
}: StudioFiltersProps) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("components.studioFilters");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (region) params.set("region", region);
    if (type) params.set("type", type);
    if (sort && sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    router.push(`/${locale}${basePath}${qs ? `?${qs}` : ""}`);
  };

  const clearFilters = () => {
    setQuery("");
    setRegion("");
    setType("");
    setSort("newest");
    router.push(`/${locale}${basePath}`);
  };

  const hasFilters = query.trim() || region || type || (sort && sort !== "newest");
  const activeCount = [query.trim(), region, type, sort !== "newest" ? sort : ""].filter(
    Boolean,
  ).length;

  const sortOptions = [
    { value: "newest", label: t("sortNewest") },
    { value: "priceAsc", label: t("sortPriceAsc") },
    { value: "priceDesc", label: t("sortPriceDesc") },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Desktop: inline filter row (unchanged) */}
      <div className="hidden lg:flex lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-3)]" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
        >
          <option value="">{t("allRegions")}</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
        >
          <option value="">{t("allTypes")}</option>
          {studioTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label={t("sortLabel")}
          className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
        >
          <option value="newest">{t("sortNewest")}</option>
          <option value="priceAsc">{t("sortPriceAsc")}</option>
          <option value="priceDesc">{t("sortPriceDesc")}</option>
        </select>
        <Button onClick={applyFilters} size="sm" className="whitespace-nowrap">
          <Search className="h-4 w-4 mr-2" />
          {t("search")}
        </Button>
        {hasFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm" className="whitespace-nowrap">
            <X className="h-4 w-4 mr-2" />
            {t("clear")}
          </Button>
        )}
      </div>

      {/* Mobile: filter trigger + bottom sheet (same pattern as discover) */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-h-[48px] w-full items-center justify-between gap-3 hairline bg-[var(--bg-soft)] px-4 text-left transition-colors active:bg-[var(--bg-elevated)]"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
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
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t("filters")}
          footer={
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setSheetOpen(false);
                  applyFilters();
                }}
              >
                {t("apply")}
              </Button>
              {hasFilters && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSheetOpen(false);
                    clearFilters();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("clear")}
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-3)]" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSheetOpen(false);
                    applyFilters();
                  }
                }}
                className="pl-9"
              />
            </div>
            <Select
              options={regions.map((r) => ({ value: r, label: r }))}
              placeholder={t("allRegions")}
              value={region}
              onValueChange={setRegion}
            />
            <Select
              options={studioTypes}
              placeholder={t("allTypes")}
              value={type}
              onValueChange={setType}
            />
            <Select
              options={sortOptions}
              value={sort}
              onValueChange={setSort}
              aria-label={t("sortLabel")}
            />
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
