"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Lock, Trash2, Loader2 } from "lucide-react";
import { addBlockedDates, removeBlockedDate } from "@/server/actions/studio-bookings";
import { format } from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import { useTranslations } from "next-intl";

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

export function StudioAvailability({
  studioId,
  lang,
  blockedDates,
  bookedDates,
  blockedRecords,
}: StudioAvailabilityProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const t = useTranslations("components.studioAvailability");
  const dateFnsLocale = lang === "it" ? itLocale : enUS;

  const handleSelectDate = (date: Date) => {
    setSelectedDates((prev) => {
      const iso = date.toISOString().split("T")[0];
      const exists = prev.some(
        (d) => d.toISOString().split("T")[0] === iso
      );
      if (exists) return prev.filter((d) => d.toISOString().split("T")[0] !== iso);
      return [...prev, date];
    });
  };

  const handleBlock = () => {
    if (selectedDates.length === 0) return;
    startTransition(async () => {
      await addBlockedDates(
        studioId,
        selectedDates.map((d) => d.toISOString())
      );
      setSelectedDates([]);
      router.refresh();
    });
  };

  const handleRemove = (blockedDateId: string) => {
    startTransition(async () => {
      await removeBlockedDate(blockedDateId);
      router.refresh();
    });
  };

  // Build a custom selected range to highlight individually selected dates
  // We use the calendar in "single" mode and track our own multi-selection
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" />
            {t("title")}
          </CardTitle>
          <p className="text-xs text-[var(--ink-3)] mt-1">
            {t("instructions")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Calendar
            lang={lang}
            mode="single"
            blockedDates={blockedDates}
            bookedDates={bookedDates}
            selectedRange={null}
            onSelectDate={handleSelectDate}
            minDate={new Date()}
          />

          {/* Selected dates pills */}
          {selectedDates.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {selectedDates
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((d) => (
                    <Badge
                      key={d.toISOString()}
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-[var(--accent)]/10"
                      onClick={() => handleSelectDate(d)}
                    >
                      {format(d, "d MMM", { locale: dateFnsLocale })} ×
                    </Badge>
                  ))}
              </div>
              <Button
                size="sm"
                variant="gold"
                className="w-full"
                onClick={handleBlock}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                ) : (
                  <Lock className="h-3.5 w-3.5 mr-2" />
                )}
                {selectedDates.length === 1
                  ? t("blockDate", { count: selectedDates.length })
                  : t("blockDates", { count: selectedDates.length })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current blocked dates */}
      {blockedRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t("blockedDates")} ({blockedRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {blockedRecords
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[var(--bg-soft)]/50 text-sm"
                  >
                    <span>
                      {format(new Date(rec.date), "EEEE d MMM yyyy", { locale: dateFnsLocale })}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-[var(--accent)] hover:text-[var(--accent)]"
                      onClick={() => handleRemove(rec.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
