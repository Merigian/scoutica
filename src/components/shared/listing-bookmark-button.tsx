"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  toggleSavedCasting,
  toggleSavedJob,
} from "@/server/actions/saved-listings";

interface ListingBookmarkButtonProps {
  kind: "casting" | "job";
  listingId: string;
  locale: string;
  isAuthenticated: boolean;
  initialSaved: boolean;
  className?: string;
}

export function ListingBookmarkButton({
  kind,
  listingId,
  locale,
  isAuthenticated,
  initialSaved,
  className,
}: ListingBookmarkButtonProps) {
  const t = useTranslations("pages.model.saved");
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res =
        kind === "casting"
          ? await toggleSavedCasting(listingId)
          : await toggleSavedJob(listingId);
      if (res.success && res.data) {
        setSaved(res.data.saved);
      } else {
        setSaved(!next);
      }
    });
  };

  const label = saved ? t("removeFromSaved") : t("addToSaved");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--rule)] bg-[var(--bg)] transition-colors",
        "hover:border-[var(--rule-strong)] hover:bg-[var(--bg-soft)]",
        saved ? "text-[var(--accent)]" : "text-[var(--ink-2)]",
        isPending && "opacity-60",
        className
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
