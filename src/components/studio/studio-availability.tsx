"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
  Loader2,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";
import {
  addBlockedDates,
  removeBlockedDate,
} from "@/server/actions/studio-bookings";
import { cn } from "@/lib/utils";

interface BlockedRecord {
  id: string;
  date: Date;
  reason: string | null;
}

interface StudioAvailabilityProps {
  studioId: string;
  lang: "it" | "en";
  blockedDates: string[];
  bookedDates: string[];
  blockedRecords: BlockedRecord[];
}

type DayState =
  | "past"
  | "available"
  | "toBlock"
  | "blocked"
  | "toUnblock"
  | "booked";

export function StudioAvailability({
  studioId,
  lang,
  blockedDates,
  bookedDates,
  blockedRecords,
}: StudioAvailabilityProps) {
  const router = useRouter();
  const t = useTranslations("components.studioAvailability");
  const locale = lang === "it" ? itLocale : enUS;

  const [isPending, startTransition] = useTransition();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [toBlock, setToBlock] = useState<Set<string>>(new Set());
  const [toUnblock, setToUnblock] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const blockedSet = useMemo(
    () => new Set(blockedDates.map((d) => d.slice(0, 10))),
    [blockedDates]
  );
  const bookedSet = useMemo(
    () => new Set(bookedDates.map((d) => d.slice(0, 10))),
    [bookedDates]
  );
  const recordIdByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of blockedRecords) {
      map.set(new Date(r.date).toISOString().slice(0, 10), r.id);
    }
    return map;
  }, [blockedRecords]);

  const today = startOfDay(new Date());
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdays = t("weekdays").split(",");
  const pendingCount = toBlock.size + toUnblock.size;

  const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

  const stateOf = (d: Date): DayState => {
    const k = dayKey(d);
    if (isBefore(d, today)) return "past";
    if (bookedSet.has(k)) return "booked";
    if (blockedSet.has(k)) return toUnblock.has(k) ? "toUnblock" : "blocked";
    return toBlock.has(k) ? "toBlock" : "available";
  };

  const onDayClick = (d: Date) => {
    const k = dayKey(d);
    const s = stateOf(d);
    setError(null);
    if (s === "past" || s === "booked") return;
    if (s === "available" || s === "toBlock") {
      setToBlock((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    } else {
      setToUnblock((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    }
  };

  const cancel = () => {
    setToBlock(new Set());
    setToUnblock(new Set());
    setError(null);
  };

  const save = () => {
    if (pendingCount === 0) return;
    setError(null);
    startTransition(async () => {
      let ok = true;
      if (toBlock.size > 0) {
        const res = await addBlockedDates(studioId, Array.from(toBlock));
        if (!res.success) ok = false;
      }
      for (const k of toUnblock) {
        const id = recordIdByKey.get(k);
        if (!id) continue;
        const res = await removeBlockedDate(id);
        if (!res.success) ok = false;
      }
      if (ok) {
        setToBlock(new Set());
        setToUnblock(new Set());
        router.refresh();
      } else {
        setError(t("saveError"));
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-[var(--ink-3)] mt-1 leading-relaxed">
          {t("intro")}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="mx-auto w-full max-w-md space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label={t("prevMonth")}
            disabled={isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium capitalize">
            {format(month, "MMMM yyyy", { locale })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label={t("nextMonth")}
            disabled={isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {weekdays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium uppercase tracking-wide text-[var(--ink-3)] py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const s = stateOf(d);
            const outside = !isSameMonth(d, month);
            const clickable = s !== "past" && s !== "booked";
            const title =
              s === "booked"
                ? t("tipBooked")
                : s === "blocked" || s === "toUnblock"
                  ? t("tipBlocked")
                  : s === "past"
                    ? undefined
                    : t("tipAvailable");
            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={!clickable || isPending}
                onClick={() => onDayClick(d)}
                title={title}
                className={cn(
                  "relative aspect-square w-full rounded-md text-xs font-medium transition-colors flex items-center justify-center",
                  outside && "opacity-40",
                  isToday(d) && "ring-1 ring-[var(--ink)] ring-inset",
                  s === "available" &&
                    "text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--bg-soft)]",
                  s === "toBlock" &&
                    "bg-[var(--ink)]/15 text-[var(--ink)] ring-2 ring-[var(--ink)] ring-inset",
                  s === "blocked" && "bg-[var(--ink)] text-[var(--bg)]",
                  s === "toUnblock" &&
                    "bg-[var(--ink)]/30 text-[var(--ink)] line-through opacity-70",
                  s === "booked" &&
                    "bg-[var(--ink)]/10 text-[var(--ink-3)] cursor-not-allowed",
                  s === "past" && "text-[var(--ink-3)]/30 cursor-not-allowed"
                )}
              >
                {format(d, "d")}
                {(s === "blocked" || s === "toUnblock") && (
                  <Lock className="absolute right-1 top-1 h-2.5 w-2.5" />
                )}
                {s === "booked" && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--ink-3)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 border-t border-[var(--rule)] text-[10px] text-[var(--ink-3)]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-[var(--rule-strong)]" />
            {t("legendAvailable")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[var(--ink)]" />
            {t("legendBlocked")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative h-3 w-3 rounded-sm bg-[var(--ink)]/15">
              <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-[var(--ink-3)]" />
            </span>
            {t("legendBooked")}
          </span>
        </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Pending changes action bar */}
        {pendingCount > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--rule-strong)] bg-[var(--bg-soft)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--ink-2)]">
              {toBlock.size > 0 && (
                <span>{t("pendingBlock", { count: toBlock.size })}</span>
              )}
              {toBlock.size > 0 && toUnblock.size > 0 && <span> · </span>}
              {toUnblock.size > 0 && (
                <span>{t("pendingUnblock", { count: toUnblock.size })}</span>
              )}
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={cancel}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={save} disabled={isPending}>
                {isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                {t("save")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
