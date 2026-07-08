"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkPlus, X, Lock } from "lucide-react";
import { saveSearch, deleteSavedSearch } from "@/server/actions/saved-searches";

type SavedSearch = { id: string; name: string; filters: Record<string, string> };

interface SavedSearchBarProps {
  enabled: boolean;
  savedSearches: SavedSearch[];
}

const IGNORED_KEYS = ["page", "pageSize", "cols"];

export function SavedSearchBar({ enabled, savedSearches }: SavedSearchBarProps) {
  const t = useTranslations("savedSearch");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  const currentFilters: Record<string, string> = {};
  for (const [k, v] of searchParams.entries()) {
    if (!IGNORED_KEYS.includes(k)) currentFilters[k] = v;
  }
  const hasActiveFilters = Object.keys(currentFilters).some(
    (k) => k !== "sortBy"
  );

  const applySearch = (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await saveSearch(name.trim(), currentFilters);
      if (res.success) {
        setName("");
        setNaming(false);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSavedSearch(id);
      router.refresh();
    });
  };

  if (!enabled) {
    return (
      <div className="flex items-center gap-2 text-meta text-[var(--ink-3)]">
        <Lock className="h-3.5 w-3.5" />
        <span>{t("locked")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-eyebrow text-[var(--ink-3)]">
          <Bookmark className="h-3.5 w-3.5" />
          {t("title")}
        </span>

        {savedSearches.map((s) => (
          <span
            key={s.id}
            className="group inline-flex min-h-11 items-center gap-1 border border-[var(--rule)] pl-3 pr-1 py-1 text-sm hover:border-[var(--rule-strong)] transition-colors lg:min-h-0"
          >
            <button
              type="button"
              onClick={() => applySearch(s.filters)}
              className="inline-flex items-center self-stretch text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
            >
              {s.name}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              aria-label={t("delete")}
              className="inline-flex items-center self-stretch px-2 lg:px-0.5 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        {!naming && (
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={() => setNaming(true)}
          >
            <BookmarkPlus className="h-4 w-4 mr-1" />
            {t("saveCurrent")}
          </Button>
        )}
      </div>

      {naming && (
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            maxLength={80}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setNaming(false);
            }}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            size="sm"
            isLoading={isPending}
            onClick={handleSave}
          >
            {t("save")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNaming(false);
              setName("");
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
