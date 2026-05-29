"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GENDER_LABELS,
  EYE_COLOR_LABELS,
  HAIR_COLOR_LABELS,
  ETHNICITY_LABELS,
  MODEL_CATEGORY_LABELS,
  PROFESSIONAL_STATUS_LABELS,
  SPOKEN_LANGUAGES,
} from "@/config/enums";
import { ITALIAN_REGIONS, getCitiesByRegion } from "@/config/regions";
import { Search, SlidersHorizontal, X, Plane } from "lucide-react";

interface SearchFiltersProps {
  locale: string;
  advancedFilters: boolean;
}

export function SearchFiltersPanel({ locale, advancedFilters }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.searchFilters");

  const getParam = (key: string) => searchParams.get(key) ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([k]) => !["page", "pageSize", "sortBy"].includes(k)
  ).length;

  const genderOptions = Object.entries(GENDER_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const eyeColorOptions = Object.entries(EYE_COLOR_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const hairColorOptions = Object.entries(HAIR_COLOR_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const ethnicityOptions = Object.entries(ETHNICITY_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const categoryOptions = Object.entries(MODEL_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const statusOptions = Object.entries(PROFESSIONAL_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l[lang] }));
  const regionOptions = ITALIAN_REGIONS.map((r) => ({ value: r.name, label: r.name }));
  const languageOptions = SPOKEN_LANGUAGES.map((l) => ({ value: l.code, label: l.label[lang] }));

  // Cascading city options based on selected region
  const selectedRegion = getParam("region");
  const cityOptions = selectedRegion
    ? getCitiesByRegion(selectedRegion).map((c) => ({ value: c, label: c }))
    : [];

  return (
    <div className=" border bg-[var(--bg-soft)]/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search bar + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
          <Input
            id="discover-search"
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            defaultValue={getParam("query")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ query: (e.target as HTMLInputElement).value || undefined });
              }
            }}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 px-3"
          onClick={() => {
            const input = document.getElementById("discover-search") as HTMLInputElement | null;
            if (input) updateParams({ query: input.value || undefined });
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
        <div className="w-44 shrink-0">
          <Select
            options={[
              { value: "relevance", label: t("sortRelevance") },
              { value: "recent", label: t("sortRecent") },
              { value: "completeness", label: t("sortCompleteness") },
              { value: "popular", label: t("sortPopular") },
            ]}
            placeholder={t("sortBy")}
            value={getParam("sortBy") || "relevance"}
            onValueChange={(v: string) => updateParams({ sortBy: v === "relevance" ? undefined : v })}
          />
        </div>
      </div>

      {/* Quick filters */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div>
          <Label className="text-xs">{t("region")}</Label>
          <Select
            options={regionOptions}
            placeholder={t("allFem")}
            value={getParam("region")}
            onValueChange={(v: string) => updateParams({ region: v || undefined, city: undefined })}
          />
        </div>
        {selectedRegion && cityOptions.length > 0 && (
          <div>
            <Label className="text-xs">{t("city")}</Label>
            <Select
              options={cityOptions}
              placeholder={t("allFem")}
              value={getParam("city")}
              onValueChange={(v: string) => updateParams({ city: v || undefined })}
            />
          </div>
        )}
        <div>
          <Label className="text-xs">{t("gender")}</Label>
          <Select
            options={genderOptions}
            placeholder={t("allMasc")}
            value={getParam("gender")}
            onValueChange={(v: string) => updateParams({ gender: v || undefined })}
          />
        </div>
        <div>
          <Label className="text-xs">{t("category")}</Label>
          <Select
            options={categoryOptions}
            placeholder={t("allFem")}
            value={getParam("categories")}
            onValueChange={(v: string) => updateParams({ categories: v || undefined })}
          />
        </div>
      </div>

      {/* Advanced toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={!advancedFilters}
          className="text-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
          {t("advancedFilters")}
          {!advancedFilters && (
            <Badge variant="gold" className="ml-1 text-[10px]">PRO</Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-[var(--ink-3)]">
            <X className="h-3.5 w-3.5 mr-1" />
            {t("clearFilters")} ({activeFilterCount})
          </Button>
        )}
        {isPending && (
          <span className="text-xs text-[var(--ink-3)] animate-pulse">
            {t("loading")}
          </span>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && advancedFilters && (
        <div className="border  p-4 space-y-5 bg-[var(--bg-soft)]/30">
          {/* ─── BODY & MEASUREMENTS ─── */}
          <div>
            <h4 className="text-eyebrow text-[var(--ink-3)] mb-3">
              {t("bodySection")}
            </h4>

            {/* Height + Age */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <Label className="text-xs">{t("heightMin")}</Label>
                <Input type="number" placeholder="150" defaultValue={getParam("heightMin")}
                  onBlur={(e) => updateParams({ heightMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("heightMax")}</Label>
                <Input type="number" placeholder="195" defaultValue={getParam("heightMax")}
                  onBlur={(e) => updateParams({ heightMax: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("ageMin")}</Label>
                <Input type="number" placeholder="18" defaultValue={getParam("ageMin")}
                  onBlur={(e) => updateParams({ ageMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("ageMax")}</Label>
                <Input type="number" placeholder="40" defaultValue={getParam("ageMax")}
                  onBlur={(e) => updateParams({ ageMax: e.target.value || undefined })} />
              </div>
            </div>

            {/* Bust / Waist / Hips with min AND max */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-xs">{t("bustMin")}</Label>
                <Input type="number" defaultValue={getParam("bustMin")}
                  onBlur={(e) => updateParams({ bustMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("waistMin")}</Label>
                <Input type="number" defaultValue={getParam("waistMin")}
                  onBlur={(e) => updateParams({ waistMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("hipsMin")}</Label>
                <Input type="number" defaultValue={getParam("hipsMin")}
                  onBlur={(e) => updateParams({ hipsMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("bustMax")}</Label>
                <Input type="number" defaultValue={getParam("bustMax")}
                  onBlur={(e) => updateParams({ bustMax: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("waistMax")}</Label>
                <Input type="number" defaultValue={getParam("waistMax")}
                  onBlur={(e) => updateParams({ waistMax: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("hipsMax")}</Label>
                <Input type="number" defaultValue={getParam("hipsMax")}
                  onBlur={(e) => updateParams({ hipsMax: e.target.value || undefined })} />
              </div>
            </div>

            {/* Shoe size */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{t("shoeMin")}</Label>
                <Input type="number" placeholder="36" defaultValue={getParam("shoeSizeMin")}
                  onBlur={(e) => updateParams({ shoeSizeMin: e.target.value || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("shoeMax")}</Label>
                <Input type="number" placeholder="45" defaultValue={getParam("shoeSizeMax")}
                  onBlur={(e) => updateParams({ shoeSizeMax: e.target.value || undefined })} />
              </div>
            </div>
          </div>

          {/* ─── APPEARANCE ─── */}
          <div>
            <h4 className="text-eyebrow text-[var(--ink-3)] mb-3">
              {t("appearance")}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t("eyeColor")}</Label>
                <Select options={eyeColorOptions} placeholder={t("allMasc")}
                  value={getParam("eyeColor")}
                  onValueChange={(v: string) => updateParams({ eyeColor: v || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("hairColor")}</Label>
                <Select options={hairColorOptions} placeholder={t("allMasc")}
                  value={getParam("hairColor")}
                  onValueChange={(v: string) => updateParams({ hairColor: v || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("ethnicity")}</Label>
                <Select options={ethnicityOptions} placeholder={t("allMasc")}
                  value={getParam("ethnicity")}
                  onValueChange={(v: string) => updateParams({ ethnicity: v || undefined })} />
              </div>
            </div>
          </div>

          {/* ─── PROFESSIONAL ─── */}
          <div>
            <h4 className="text-eyebrow text-[var(--ink-3)] mb-3">
              {t("professional")}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t("status")}</Label>
                <Select options={statusOptions} placeholder={t("allMasc")}
                  value={getParam("professionalStatus")}
                  onValueChange={(v: string) => updateParams({ professionalStatus: v || undefined })} />
              </div>
              <div>
                <Label className="text-xs">{t("spokenLanguage")}</Label>
                <Select options={languageOptions} placeholder={t("allFem")}
                  value={getParam("spokenLanguages")}
                  onValueChange={(v: string) => updateParams({ spokenLanguages: v || undefined })} />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    const current = getParam("travelAvailability");
                    updateParams({ travelAvailability: current === "true" ? undefined : "true" });
                  }}
                  className={`flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors w-full justify-center ${
                    getParam("travelAvailability") === "true"
                      ? "bg-gold/10 border-gold text-gold-dark font-medium"
                      : "border-[var(--rule)] text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Plane className="h-3.5 w-3.5" />
                  {t("availableToTravel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
