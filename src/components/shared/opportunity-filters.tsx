"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";

interface OpportunityFiltersProps {
  onFilter: (filters: { search: string; paidOnly: boolean }) => void;
}

export function OpportunityFilters({ onFilter }: OpportunityFiltersProps) {
  const t = useTranslations("opportunityFilters");
  const [search, setSearch] = useState("");
  const [paidOnly, setPaidOnly] = useState(false);

  const applyFilters = () => {
    onFilter({ search, paidOnly });
  };

  const clearFilters = () => {
    setSearch("");
    setPaidOnly(false);
    onFilter({ search: "", paidOnly: false });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-3)]" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onFilter({ search: e.target.value, paidOnly });
          }}
          className="pl-9"
        />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={paidOnly}
          onChange={(e) => {
            setPaidOnly(e.target.checked);
            onFilter({ search, paidOnly: e.target.checked });
          }}
        />
        {t("paidOnly")}
      </label>
      {(search || paidOnly) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-3 w-3 mr-1" />
          {t("clearFilters")}
        </Button>
      )}
    </div>
  );
}
