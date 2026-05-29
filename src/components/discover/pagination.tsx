"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  locale: string;
}

export function Pagination({ page, totalPages, total, locale }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.pagination");

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const pageNumbers: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-sm text-[var(--ink-3)]">
        {total === 1 ? t("profileFound", { count: total }) : t("profilesFound", { count: total })}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {start > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => goToPage(1)}>1</Button>
            {start > 2 && <span className="px-1 text-[var(--ink-3)]">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(p)}
          >
            {p}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-[var(--ink-3)]">…</span>}
            <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
