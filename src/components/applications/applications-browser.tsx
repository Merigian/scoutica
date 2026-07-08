"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CalendarDays,
  MapPin,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { JobType } from "@prisma/client";

import { JOB_TYPE_LABELS } from "@/config/enums";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { WithdrawButton } from "@/components/shared/withdraw-button";

export type ApplicationStatusValue = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface ApplicationItem {
  id: string;
  type: "casting" | "job";
  opportunityId: string;
  status: ApplicationStatusValue;
  introMessage: string | null;
  createdAtISO: string;
  title: string;
  scoutName: string;
  city: string | null;
  deadlineISO: string | null;
  jobType: JobType | null;
}

type Tab = "all" | "pending" | "accepted" | "closed";

const STATUS_META: Record<
  ApplicationStatusValue,
  { variant: "secondary" | "success" | "destructive" | "outline"; icon: LucideIcon }
> = {
  PENDING: { variant: "secondary", icon: Clock },
  ACCEPTED: { variant: "success", icon: CheckCircle },
  REJECTED: { variant: "destructive", icon: XCircle },
  WITHDRAWN: { variant: "outline", icon: ArrowLeft },
};

interface ApplicationsBrowserProps {
  items: ApplicationItem[];
  locale: string;
}

export function ApplicationsBrowser({ items, locale }: ApplicationsBrowserProps) {
  const t = useTranslations("pages.model.applications");
  const reduce = useReducedMotion();
  const lang = locale === "en" ? "en" : "it";
  const [tab, setTab] = useState<Tab>("all");

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((a) => a.status === "PENDING").length,
      accepted: items.filter((a) => a.status === "ACCEPTED").length,
      closed: items.filter((a) => a.status === "REJECTED" || a.status === "WITHDRAWN").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    switch (tab) {
      case "pending":
        return items.filter((a) => a.status === "PENDING");
      case "accepted":
        return items.filter((a) => a.status === "ACCEPTED");
      case "closed":
        return items.filter((a) => a.status === "REJECTED" || a.status === "WITHDRAWN");
      default:
        return items;
    }
  }, [items, tab]);

  const statusLabel = (s: ApplicationStatusValue) =>
    t(`status${s.charAt(0)}${s.slice(1).toLowerCase()}`);

  return (
    <div>
      <SegmentedTabs
        aria-label={t("eyebrow")}
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        tabs={[
          { value: "all", label: t("tabAll"), count: counts.all },
          { value: "pending", label: t("tabPending"), count: counts.pending },
          { value: "accepted", label: t("tabAccepted"), count: counts.accepted },
          { value: "closed", label: t("tabClosed"), count: counts.closed },
        ]}
      />

      <p className="pt-4 text-meta text-[var(--ink-3)]">
        {t("count", { count: filtered.length })}
      </p>

      {filtered.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.ul
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-2 hairline-t"
          >
            {filtered.map((a) => {
              const meta = STATUS_META[a.status];
              const StatusIcon = meta.icon;
              const isCasting = a.type === "casting";
              const href = isCasting
                ? `/${locale}/model/castings/${a.opportunityId}`
                : `/${locale}/model/lavori/${a.opportunityId}`;
              const kindLabel = isCasting
                ? t("casting")
                : a.jobType
                  ? JOB_TYPE_LABELS[a.jobType][lang]
                  : t("job");
              const isExpired = a.deadlineISO && new Date(a.deadlineISO) < new Date();

              return (
                <li key={a.id} className="group relative hairline-b">
                  <div className="flex flex-col gap-4 px-1 py-6 transition-colors duration-200 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-3 group-hover:bg-[var(--bg-soft)]">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-meta text-[var(--ink-3)]">{kindLabel}</span>
                        <Badge variant={meta.variant} className="gap-1 text-[11px]">
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {statusLabel(a.status)}
                        </Badge>
                      </div>

                      <h3 className="mt-2">
                        <Link
                          href={href}
                          className="font-display text-[1.3125rem] leading-[1.15] tracking-[-0.01em] text-[var(--ink)] after:absolute after:inset-0 sm:text-[1.5rem]"
                        >
                          {a.title}
                        </Link>
                      </h3>

                      <p className="mt-1.5 text-sm text-[var(--ink-2)]">
                        <span className="font-medium text-[var(--ink)]">{a.scoutName}</span>
                      </p>

                      {a.introMessage && (
                        <p className="mt-3 line-clamp-2 max-w-[70ch] text-body italic text-[var(--ink-2)]">
                          &ldquo;{a.introMessage}&rdquo;
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-meta text-[var(--ink-3)]">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("appliedOn")}{" "}
                          {formatDate(new Date(a.createdAtISO), lang)}
                        </span>
                        {a.city && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {a.city}
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[var(--ink-3)]">
                            {isCasting ? t("castingExpired") : t("jobExpired")}
                          </span>
                        )}
                      </div>
                    </div>

                    {a.status === "PENDING" && (
                      <div className="relative z-[1] shrink-0">
                        <WithdrawButton applicationId={a.id} type={a.type} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={FileText}
            title={
              tab === "pending"
                ? t("emptyPending")
                : tab === "accepted"
                  ? t("emptyAccepted")
                  : tab === "closed"
                    ? t("emptyClosed")
                    : t("noApplications")
            }
            description={tab === "all" ? t("noApplicationsDesc") : undefined}
            actionLabel={tab === "all" ? t("exploreCastings") : undefined}
            actionHref={tab === "all" ? `/${locale}/model/castings` : undefined}
          />
        </div>
      )}
    </div>
  );
}
