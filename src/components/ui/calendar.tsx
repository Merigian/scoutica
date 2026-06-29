"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { it, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CalendarProps {
  lang: "it" | "en";
  blockedDates?: string[];
  bookedDates?: string[];
  selectedRange?: { start: Date; end: Date } | null;
  onSelectRange?: (range: { start: Date; end: Date } | null) => void;
  onSelectDate?: (date: Date) => void;
  mode?: "range" | "single" | "view";
  minDate?: Date;
}

export function Calendar({
  lang,
  blockedDates = [],
  bookedDates = [],
  selectedRange,
  onSelectRange,
  onSelectDate,
  mode = "range",
  minDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(
    selectedRange?.start ?? null
  );
  const locale = lang === "it" ? it : enUS;
  const t = useTranslations("components.calendar");

  const blocked = useMemo(
    () => new Set(blockedDates.map((d) => d.slice(0, 10))),
    [blockedDates]
  );
  const booked = useMemo(
    () => new Set(bookedDates.map((d) => d.slice(0, 10))),
    [bookedDates]
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = (lang === "it" ? t("daysShortIt") : t("daysShortEn")).split(",");

  const isUnavailable = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return blocked.has(key) || booked.has(key);
  };

  const isDisabled = (date: Date) => {
    const pastDay = minDate
      ? isBefore(date, startOfDay(minDate))
      : isBefore(date, startOfDay(new Date()));
    return pastDay || isUnavailable(date);
  };

  const inRange = (date: Date) => {
    if (rangeStart && !selectedRange) {
      return isSameDay(date, rangeStart);
    }
    if (selectedRange) {
      return date >= selectedRange.start && date <= selectedRange.end;
    }
    return false;
  };

  const isRangeStart = (date: Date) =>
    selectedRange && isSameDay(date, selectedRange.start);
  const isRangeEnd = (date: Date) =>
    selectedRange && isSameDay(date, selectedRange.end);

  const handleDayClick = (date: Date) => {
    if (mode === "view") return;
    if (isDisabled(date)) return;

    if (mode === "single") {
      onSelectDate?.(date);
      return;
    }

    // range mode
    if (!rangeStart || (rangeStart && selectedRange)) {
      setRangeStart(date);
      onSelectRange?.(null);
    } else {
      const start = date < rangeStart ? date : rangeStart;
      const end = date < rangeStart ? rangeStart : date;
      // Check no blocked/booked dates in range
      const rangeDays = eachDayOfInterval({ start, end });
      const hasConflict = rangeDays.some((d) => isUnavailable(d));
      if (hasConflict) {
        setRangeStart(date);
        onSelectRange?.(null);
        return;
      }
      onSelectRange?.({ start, end });
      setRangeStart(null);
    }
  };

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-[var(--ink-3)] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const sameMonth = isSameMonth(day, currentMonth);
          const disabled = isDisabled(day);
          const unavailable = isUnavailable(day) && sameMonth;
          const selected = inRange(day);
          const rangeStartDay = isRangeStart(day);
          const rangeEndDay = isRangeEnd(day);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled && mode !== "view"}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative h-9 w-full text-xs font-medium transition-all",
                // Base
                !sameMonth && "text-[var(--ink-3)]/25",
                sameMonth &&
                  !disabled &&
                  !selected &&
                  "hover:bg-secondary rounded-md",
                // Disabled/past
                disabled &&
                  !unavailable &&
                  mode !== "view" &&
                  "cursor-not-allowed opacity-30",
                // Unavailable (blocked/booked)
                unavailable &&
                  "bg-[var(--bg-soft)] text-[var(--ink-3)]/50 line-through cursor-not-allowed",
                // Selected range middle
                selected &&
                  !rangeStartDay &&
                  !rangeEndDay &&
                  "bg-primary/10 text-primary",
                // Range start
                rangeStartDay && "bg-primary text-primary-foreground rounded-l-md",
                // Range end
                rangeEndDay && "bg-primary text-primary-foreground rounded-r-md",
                // Single day selection (start === end)
                rangeStartDay &&
                  rangeEndDay &&
                  "rounded-md",
                // Today indicator
                today && !selected && "ring-1 ring-[var(--ink)] ring-inset rounded-md"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t text-[10px] text-[var(--ink-3)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          {t("selected")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive/20" />
          {t("unavailable")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-[var(--ink)]" />
          {t("today")}
        </span>
      </div>
    </div>
  );
}
