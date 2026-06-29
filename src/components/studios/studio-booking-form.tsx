"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { eachDayOfInterval, format } from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Send, CheckCircle, Euro, Clock, Plus, X } from "lucide-react";
import { createStudioBooking } from "@/server/actions/studio-bookings";

interface BookedTimeSlot {
  startTime: string;
  endTime: string;
}

interface Slot {
  date: string; // yyyy-MM-dd
  startTime: string;
  endTime: string;
}

// 06:00–23:30 in 30-minute steps
const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const idx = 12 + i;
  const h = String(Math.floor(idx / 2)).padStart(2, "0");
  const m = idx % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface StudioBookingFormProps {
  studioId: string;
  lang: "it" | "en";
  dailyRate: number | null;
  weeklyRate: number | null;
  hourlyRate: number | null;
  blockedDates: string[];
  bookedDates: string[];
  bookedTimeSlots?: BookedTimeSlot[];
}

export function StudioBookingForm({
  studioId,
  lang,
  dailyRate,
  weeklyRate,
  hourlyRate,
  blockedDates,
  bookedDates,
  bookedTimeSlots = [],
}: StudioBookingFormProps) {
  const t = useTranslations("components.studioBooking");
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [draftDate, setDraftDate] = useState("");
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = lang === "it" ? itLocale : enUS;

  const rangeDates = useMemo(() => {
    if (!selectedRange) return [] as string[];
    return eachDayOfInterval({ start: selectedRange.start, end: selectedRange.end }).map(
      (d) => format(d, "yyyy-MM-dd")
    );
  }, [selectedRange]);

  const uniqueDates = useMemo(
    () => Array.from(new Set(slots.map((s) => s.date))).sort(),
    [slots]
  );
  const totalDays = uniqueDates.length;

  const totalHours = useMemo(
    () =>
      slots.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        return sum + Math.max(0, eh + em / 60 - (sh + sm / 60));
      }, 0),
    [slots]
  );

  const totalPrice = useMemo(() => {
    if (slots.length === 0) return null;
    if (hourlyRate) return Math.round(totalHours * hourlyRate);
    if (!dailyRate) return null;
    if (weeklyRate && totalDays >= 7) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      return weeks * weeklyRate + remainingDays * dailyRate;
    }
    return totalDays * dailyRate;
  }, [slots, totalHours, totalDays, dailyRate, weeklyRate, hourlyRate]);

  const addSlot = () => {
    setError(null);
    const date = draftDate || rangeDates[0];
    if (!date || !draftStart || !draftEnd) {
      setError(t("errorSelectTime"));
      return;
    }
    if (draftStart >= draftEnd) {
      setError(t("errorEndAfterStart"));
      return;
    }
    if (slots.some((s) => s.date === date && s.startTime === draftStart && s.endTime === draftEnd)) {
      return;
    }
    setSlots((prev) =>
      [...prev, { date, startTime: draftStart, endTime: draftEnd }].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      )
    );
    setDraftStart("");
    setDraftEnd("");
  };

  const removeSlot = (index: number) =>
    setSlots((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.length === 0) {
      setError(t("errorSelectTime"));
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError(t("errorNameEmail"));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const startDate = new Date(uniqueDates[0] + "T00:00:00");
      const endDate = new Date(uniqueDates[uniqueDates.length - 1] + "T00:00:00");
      const result = await createStudioBooking({
        studioId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime: slots[0].startTime,
        endTime: slots[0].endTime,
        totalDays,
        totalPrice: totalPrice ?? undefined,
        slots,
      });
      if (result.success) setSent(true);
      else setError(result.error || t("errorSending"));
    } catch {
      setError(t("errorSending"));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-[var(--rule-strong)] bg-[var(--bg-soft)]">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-10 w-10 text-[var(--ink)] mx-auto mb-3" />
          <h3 className="font-[var(--font-display)] text-lg font-semibold mb-1">
            {t("successTitle")}
          </h3>
          <p className="text-sm text-[var(--ink-3)] max-w-xs mx-auto">
            {t("successMessage")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--ink)]" />
            {t("selectDates")}
          </CardTitle>
          <p className="text-[11px] text-[var(--ink-3)] mt-1">
            {t("calendarInstruction")}
          </p>
        </CardHeader>
        <CardContent>
          <Calendar
            lang={lang}
            mode="range"
            blockedDates={blockedDates}
            bookedDates={bookedDates}
            selectedRange={selectedRange}
            onSelectRange={setSelectedRange}
            minDate={new Date()}
          />
        </CardContent>
      </Card>

      {/* Time slots builder */}
      {selectedRange && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--ink)]" />
              {t("timeSlots")}
            </CardTitle>
            <p className="text-[11px] text-[var(--ink-3)] mt-1">{t("timeSlotsHint")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              {rangeDates.length > 1 && (
                <label className="flex flex-col gap-1 text-[11px] text-[var(--ink-3)]">
                  {t("date")}
                  <select
                    value={draftDate || rangeDates[0]}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-2 text-sm text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                  >
                    {rangeDates.map((d) => (
                      <option key={d} value={d}>
                        {format(new Date(d + "T00:00:00"), "EEE d MMM", { locale })}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 text-[11px] text-[var(--ink-3)]">
                {t("from")}
                <select
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-2 text-sm text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                >
                  <option value="">--:--</option>
                  {TIME_OPTIONS.map((tm) => (
                    <option key={tm} value={tm}>
                      {tm}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-[var(--ink-3)]">
                {t("to")}
                <select
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="h-9 border border-[var(--rule)] bg-[var(--bg)] px-2 text-sm text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                >
                  <option value="">--:--</option>
                  {TIME_OPTIONS.filter((tm) => !draftStart || tm > draftStart).map((tm) => (
                    <option key={tm} value={tm}>
                      {tm}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addSlot} className="h-9">
                <Plus className="h-4 w-4 mr-1" />
                {t("addSlot")}
              </Button>
            </div>

            {slots.length > 0 ? (
              <ul className="space-y-1.5">
                {slots.map((s, i) => (
                  <li
                    key={`${s.date}-${s.startTime}-${s.endTime}-${i}`}
                    className="flex items-center justify-between gap-3 border border-[var(--rule)] bg-[var(--bg-soft)] px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                      <span className="font-medium capitalize">
                        {format(new Date(s.date + "T00:00:00"), "EEE d MMM", { locale })}
                      </span>
                      <span className="text-[var(--ink-2)]">
                        {s.startTime}–{s.endTime}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={t("removeSlot")}
                      onClick={() => removeSlot(i)}
                      className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-[var(--ink-3)]">{t("noSlotsYet")}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price summary */}
      {slots.length > 0 && (
        <Card className="border-[var(--rule-strong)] bg-[var(--bg-soft)]">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-3)]">
                {totalDays} {totalDays === 1 ? t("day") : t("days")} · {slots.length}{" "}
                {slots.length === 1 ? t("slot") : t("slotsLabel")}
              </span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
              </span>
            </div>
            {totalPrice != null && (
              <div className="flex items-center justify-between pt-2 border-t border-[var(--rule)]">
                <span className="text-sm font-medium">
                  {t("estimatedTotal")}
                </span>
                <span className="text-lg font-bold flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  {totalPrice.toFixed(0)}
                </span>
              </div>
            )}
            {!dailyRate && !hourlyRate && (
              <p className="text-xs text-[var(--ink-3)]">
                {t("priceHelp")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("yourDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className=" bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-2 text-xs text-[var(--accent)]">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="bk-name" className="text-xs" required>
                {t("fullName")}
              </Label>
              <Input
                id="bk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-email" className="text-xs" required>
                Email
              </Label>
              <Input
                id="bk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-phone" className="text-xs">
                {t("phone")}
              </Label>
              <Input
                id="bk-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 1234567"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-message" className="text-xs">
                {t("additionalNotes")}
              </Label>
              <Textarea
                id="bk-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={2}
                className="text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={slots.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
