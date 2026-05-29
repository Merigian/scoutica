"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface TimeSlot {
  time: string;
  label: string;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotPickerProps {
  lang: "it" | "en";
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  bookedSlots?: BookedSlot[];
}

// Generate 30-min slots from 06:00 to 23:30
const ALL_SLOTS: TimeSlot[] = Array.from({ length: 36 }, (_, i) => {
  const idx = 12 + i; // start from 06:00
  const h = String(Math.floor(idx / 2)).padStart(2, "0");
  const m = idx % 2 === 0 ? "00" : "30";
  return { time: `${h}:${m}`, label: `${h}:${m}` };
});

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isSlotBooked(slotTime: string, bookedSlots: BookedSlot[]): boolean {
  const slotMin = timeToMinutes(slotTime);
  return bookedSlots.some((bs) => {
    if (!bs.startTime || !bs.endTime) return false;
    return slotMin >= timeToMinutes(bs.startTime) && slotMin < timeToMinutes(bs.endTime);
  });
}

export function TimeSlotPicker({
  lang,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  bookedSlots = [],
}: TimeSlotPickerProps) {
  // 3 states:
  //   idle:        startTime === "" && endTime === ""
  //   waitingEnd:  startTime !== "" && endTime === ""
  //   complete:    startTime !== "" && endTime !== ""
  const isIdle = startTime === "" && endTime === "";
  const waitingForEnd = startTime !== "" && endTime === "";
  const hasSelection = startTime !== "" && endTime !== "";
  const t = useTranslations("components.timeSlotPicker");

  const startMin = startTime ? timeToMinutes(startTime) : -1;
  const endMin = endTime ? timeToMinutes(endTime) : -1;

  const handleSlotClick = (slotTime: string) => {
    if (isSlotBooked(slotTime, bookedSlots)) return;
    const slotMin = timeToMinutes(slotTime);

    // STATE: complete selection exists
    if (hasSelection) {
      if (slotTime === startTime) {
        // Deselect
        onStartTimeChange("");
        onEndTimeChange("");
      } else {
        // New start
        onStartTimeChange(slotTime);
        onEndTimeChange("");
      }
      return;
    }

    // STATE: waiting for end click
    if (waitingForEnd) {
      if (slotTime === startTime) {
        // Deselect
        onStartTimeChange("");
        onEndTimeChange("");
        return;
      }
      if (slotMin > startMin) {
        // Set end = next slot boundary after clicked slot
        const nextIdx = ALL_SLOTS.findIndex((s) => s.time === slotTime) + 1;
        const endSlot = nextIdx < ALL_SLOTS.length ? ALL_SLOTS[nextIdx].time : slotTime;
        // Check for booked conflicts in the range
        const hasConflict = ALL_SLOTS.some((s) => {
          const sMin = timeToMinutes(s.time);
          return sMin >= startMin && sMin < timeToMinutes(endSlot) && isSlotBooked(s.time, bookedSlots);
        });
        if (!hasConflict) {
          onEndTimeChange(endSlot);
          return;
        }
      }
      // Clicked before start or conflict → make this the new start
      onStartTimeChange(slotTime);
      onEndTimeChange("");
      return;
    }

    // STATE: idle → set start, wait for end
    onStartTimeChange(slotTime);
    onEndTimeChange("");
  };

  const periods = useMemo(() => {
    const morning = ALL_SLOTS.filter((s) => parseInt(s.time) >= 6 && parseInt(s.time) < 12);
    const afternoon = ALL_SLOTS.filter((s) => parseInt(s.time) >= 12 && parseInt(s.time) < 18);
    const evening = ALL_SLOTS.filter((s) => parseInt(s.time) >= 18);
    return [
      { label: t("morning"), icon: "☀️", slots: morning },
      { label: t("afternoon"), icon: "🌤", slots: afternoon },
      { label: t("evening"), icon: "🌙", slots: evening },
    ];
  }, [lang]);

  const selectedHours = hasSelection ? (endMin - startMin) / 60 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-foreground/70" />
          <span className="font-medium">
            {t("selectTime")}
          </span>
        </div>
        {hasSelection && (
          <div className="flex items-center gap-1.5 bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium">
            {startTime} — {endTime}
            <span className="opacity-50 ml-1">({selectedHours}h)</span>
          </div>
        )}
        {waitingForEnd && (
          <div className="flex items-center gap-1.5 border border-foreground/20 rounded-full px-3 py-1 text-xs font-medium text-foreground/70">
            {startTime} — ?
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {waitingForEnd
          ? t("selectEnd")
          : t("instructions")}
      </p>

      {/* Periods */}
      {periods.map((period) => (
        <div key={period.label}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs">{period.icon}</span>
            <span className="text-eyebrow text-[var(--ink-3)]">
              {period.label}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {period.slots.map((slot) => {
              const slotMin = timeToMinutes(slot.time);
              const booked = isSlotBooked(slot.time, bookedSlots);
              const isStartSlot = slot.time === startTime && (hasSelection || waitingForEnd);
              const isEndSlot =
                hasSelection &&
                (() => {
                  const idx = ALL_SLOTS.findIndex((s) => s.time === slot.time);
                  const next = idx + 1 < ALL_SLOTS.length ? ALL_SLOTS[idx + 1].time : slot.time;
                  return next === endTime;
                })();
              const inRange = hasSelection && slotMin >= startMin && slotMin < endMin && !isStartSlot && !isEndSlot;

              let cn =
                "relative flex items-center justify-center h-9 rounded-sm text-xs font-medium transition-all duration-150 cursor-pointer select-none ";

              if (booked) {
                cn +=
                  "bg-red-500/8 text-red-400/70 line-through cursor-not-allowed border border-red-500/10";
              } else if (isStartSlot || isEndSlot) {
                cn +=
                  "bg-foreground text-background shadow-sm ring-1 ring-foreground/20";
              } else if (inRange) {
                cn += "bg-foreground/8 text-foreground border border-foreground/10";
              } else {
                cn +=
                  "bg-muted/40 text-muted-foreground/70 hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50";
              }

              return (
                <button
                  key={slot.time}
                  type="button"
                  className={cn}
                  onClick={() => handleSlotClick(slot.time)}
                  disabled={booked}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-foreground" />
          {t("selected")}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-foreground/10 border border-foreground/15" />
          {t("range")}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500/10 border border-red-500/15" />
          {t("occupied")}
        </div>
      </div>
    </div>
  );
}
