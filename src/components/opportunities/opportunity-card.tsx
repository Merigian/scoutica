"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, CalendarDays, Clock, ArrowUpRight } from "lucide-react";

import type { Opportunity } from "@/server/queries/opportunities";
import { JOB_TYPE_LABELS, SCOUT_SUBTYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ListingBookmarkButton } from "@/components/shared/listing-bookmark-button";

interface OpportunityCardProps {
  opportunity: Opportunity;
  locale: string;
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function OpportunityCard({ opportunity: o, locale }: OpportunityCardProps) {
  const t = useTranslations("pages.model.opportunities");
  const lang = locale === "en" ? "en" : "it";

  const href =
    o.kind === "casting"
      ? `/${locale}/model/castings/${o.id}`
      : `/${locale}/model/lavori/${o.id}`;

  const kindLabel =
    o.kind === "casting"
      ? t("casting")
      : o.jobType
        ? JOB_TYPE_LABELS[o.jobType][lang]
        : t("tabJobs");

  // Deadline urgency
  let deadline: { text: string; urgent: boolean } | null = null;
  if (o.deadlineISO) {
    const d = daysUntil(o.deadlineISO);
    if (d <= 0) deadline = { text: t("deadlineToday"), urgent: true };
    else if (d <= 3) deadline = { text: t("deadlineSoon", { days: d }), urgent: true };
    else
      deadline = {
        text: `${t("deadline")} ${formatDate(new Date(o.deadlineISO), lang)}`,
        urgent: false,
      };
  }

  const whenText =
    o.kind === "casting"
      ? o.startsAtISO
        ? formatDate(new Date(o.startsAtISO), lang)
        : null
      : o.datesText;

  return (
    <li className="group relative hairline-b">
      <div className="flex items-start justify-between gap-4 px-1 py-6 transition-colors duration-200 sm:px-3 sm:gap-6 group-hover:bg-[var(--bg-soft)]">
        <div className="min-w-0 flex-1">
          {/* Kind + signals */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-meta text-[var(--ink-3)]">{kindLabel}</span>
            {o.isPaid && (
              <span className="text-meta text-[var(--ink-2)]">{t("paid")}</span>
            )}
            {o.applied && (
              <Badge variant="success" className="text-[10px]">
                {t("applied")}
              </Badge>
            )}
          </div>

          {/* Title (stretched link) */}
          <h3 className="mt-2">
            <Link
              href={href}
              className="font-display text-[1.3125rem] leading-[1.15] tracking-[-0.01em] text-[var(--ink)] after:absolute after:inset-0 sm:text-[1.5rem]"
            >
              {o.title}
            </Link>
          </h3>

          {/* Byline */}
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--ink-2)]">
            <span className="font-medium text-[var(--ink)]">{o.scoutName}</span>
            {o.verified && (
              <VerifiedBadge size={14} variant="static" className="text-[var(--ink-3)]" />
            )}
            {o.subtype && (
              <span className="text-[var(--ink-3)]">
                · {SCOUT_SUBTYPE_LABELS[o.subtype][lang]}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 line-clamp-2 max-w-[70ch] text-body text-[var(--ink-2)]">
            {o.description}
          </p>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-meta text-[var(--ink-3)]">
            {o.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {o.city}
              </span>
            )}
            {whenText && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {whenText}
              </span>
            )}
            {deadline && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  deadline.urgent && "text-[var(--color-warning)]",
                )}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {deadline.text}
              </span>
            )}
            {o.compensation && (
              <span className="text-[var(--ink-2)]">{o.compensation}</span>
            )}
          </div>
        </div>

        {/* Actions — above the stretched link */}
        <div className="relative z-[1] flex shrink-0 flex-col items-end gap-3">
          <ListingBookmarkButton
            kind={o.kind}
            listingId={o.id}
            locale={locale}
            isAuthenticated
            initialSaved={o.saved}
          />
          <span className="hidden sm:block">
            <ArrowUpRight
              className="group-arrow h-5 w-5 text-[var(--ink-3)] transition-colors group-hover:text-[var(--ink)]"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </li>
  );
}
