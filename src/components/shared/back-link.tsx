"use client";

import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Keep native behaviour for modifier / middle clicks (open in new tab, etc.).
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    // When there is in-app history, go back through it so the previous page's
    // scroll position is restored instead of jumping to the top. Falls back to
    // the explicit href (e.g. when the page was opened directly).
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={href as never}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-all  bg-[var(--bg-soft)]/60 hover:bg-[var(--bg-soft)] px-3 py-1.5 w-fit mb-4"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
