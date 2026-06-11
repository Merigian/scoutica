"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface StudioFiltersProps {
  lang: "it" | "en";
  studioTypes: { value: string; label: string }[];
  regions: string[];
  initialQuery?: string;
  initialRegion?: string;
  initialType?: string;
  initialSort?: string;
}

export function StudioFilters({
  lang,
  studioTypes,
  regions,
  initialQuery = "",
  initialRegion = "",
  initialType = "",
  initialSort = "newest",
}: StudioFiltersProps) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
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
    router.push(`/${locale}/studios${qs ? `?${qs}` : ""}`);
  };

  const clearFilters = () => {
    setQuery("");
    setRegion("");
    setType("");
    setSort("newest");
    router.push(`/${locale}/studios`);
  };

  const hasFilters = query.trim() || region || type || (sort && sort !== "newest");

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
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
          className="h-9 rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t("allRegions")}</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-9 rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-ring"
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
          className="h-9 rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-ring"
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
    </div>
  );
}
