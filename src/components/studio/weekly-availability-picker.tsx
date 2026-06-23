"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DAY_KEYS,
  START_OPTIONS,
  TIME_OPTIONS,
  DEFAULT_BAND,
  type DayKey,
  type AvailabilityBand,
  type WeeklyAvailability,
} from "@/lib/studio-availability";

interface WeeklyAvailabilityPickerProps {
  value: WeeklyAvailability;
  onChange: (next: WeeklyAvailability) => void;
}

const selectClass =
  "h-9 rounded-md border border-[var(--rule)] bg-transparent px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]";

export function WeeklyAvailabilityPicker({ value, onChange }: WeeklyAvailabilityPickerProps) {
  const t = useTranslations("components.weeklyAvailability");

  const setDay = (day: DayKey, bands: AvailabilityBand[]) =>
    onChange({ ...value, [day]: bands });

  const toggleDay = (day: DayKey) =>
    setDay(day, value[day].length > 0 ? [] : [{ ...DEFAULT_BAND }]);

  const addBand = (day: DayKey) => {
    const existing = value[day];
    const last = existing[existing.length - 1];
    // Start the new slot where the previous one ends, so it's a distinct band
    // (e.g. morning 09:00–13:00 then afternoon 13:00–14:00) instead of a duplicate.
    let startIdx = last
      ? TIME_OPTIONS.indexOf(last.end)
      : TIME_OPTIONS.indexOf(DEFAULT_BAND.start);
    if (startIdx < 0 || startIdx > START_OPTIONS.length - 1) {
      startIdx = START_OPTIONS.length - 1;
    }
    const start = TIME_OPTIONS[startIdx];
    const end = TIME_OPTIONS[Math.min(startIdx + 2, TIME_OPTIONS.length - 1)];
    setDay(day, [...existing, { start, end }]);
  };

  const removeBand = (day: DayKey, index: number) =>
    setDay(day, value[day].filter((_, i) => i !== index));

  const updateBand = (day: DayKey, index: number, patch: Partial<AvailabilityBand>) =>
    setDay(day, value[day].map((b, i) => (i === index ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[var(--ink-3)]">{t("multiBandHint")}</p>
      {DAY_KEYS.map((day) => {
        const bands = value[day];
        const isOpen = bands.length > 0;
        return (
          <div key={day} className="border border-[var(--rule)] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={() => toggleDay(day)}
                  className="h-4 w-4 accent-[var(--ink)]"
                />
                <span className="text-sm font-medium">{t(`days.${day}`)}</span>
              </label>
              {!isOpen && (
                <span className="text-xs text-[var(--ink-3)]">{t("closed")}</span>
              )}
            </div>

            {isOpen && (
              <div className="mt-3 space-y-2 pl-[26px]">
                {bands.map((band, i) => {
                  const endOptions = TIME_OPTIONS.filter((tm) => tm > band.start);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={band.start}
                        onChange={(e) => {
                          const start = e.target.value;
                          const end =
                            band.end > start
                              ? band.end
                              : TIME_OPTIONS.find((tm) => tm > start) ?? start;
                          updateBand(day, i, { start, end });
                        }}
                        className={selectClass}
                      >
                        {START_OPTIONS.map((tm) => (
                          <option key={tm} value={tm}>{tm}</option>
                        ))}
                      </select>
                      <span className="text-[var(--ink-3)]">–</span>
                      <select
                        value={band.end}
                        onChange={(e) => updateBand(day, i, { end: e.target.value })}
                        className={selectClass}
                      >
                        {endOptions.map((tm) => (
                          <option key={tm} value={tm}>{tm}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeBand(day, i)}
                        aria-label={t("removeBand")}
                        className="ml-1 inline-flex h-7 w-7 items-center justify-center text-[var(--ink-3)] hover:text-[var(--danger)] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => addBand(day)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("addBand")}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
