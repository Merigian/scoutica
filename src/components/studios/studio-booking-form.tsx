"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { differenceInCalendarDays, format } from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/ui/time-slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Send, CheckCircle, Euro, Clock } from "lucide-react";
import { createStudioBooking } from "@/server/actions/studio-bookings";

interface BookedTimeSlot {
  startTime: string;
  endTime: string;
}

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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = lang === "it" ? itLocale : enUS;

  const totalDays = useMemo(() => {
    if (!selectedRange) return 0;
    return differenceInCalendarDays(selectedRange.end, selectedRange.start) + 1;
  }, [selectedRange]);

  const totalPrice = useMemo(() => {
    if (!selectedRange) return null;
    const days = totalDays;
    // Same-day booking: use hourly rate if available
    if (days === 1 && hourlyRate && startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const hours = eh + em / 60 - (sh + sm / 60);
      if (hours > 0) return Math.round(hours * hourlyRate);
    }
    if (!dailyRate) return null;
    if (weeklyRate && days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * weeklyRate + remainingDays * dailyRate;
    }
    return days * dailyRate;
  }, [selectedRange, totalDays, dailyRate, weeklyRate, hourlyRate, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRange) {
      setError(t("errorSelectDates"));
      return;
    }
    if (!startTime || !endTime) {
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
      const result = await createStudioBooking({
        studioId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        startDate: selectedRange.start.toISOString(),
        endDate: selectedRange.end.toISOString(),
        startTime,
        endTime,
        totalDays,
        totalPrice: totalPrice ?? undefined,
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
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
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
            <CalendarDays className="h-4 w-4 text-gold" />
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

      {/* Time slot picker */}
      {selectedRange && (
        <Card>
          <CardContent className="pt-5">
            <TimeSlotPicker
              lang={lang}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              bookedSlots={bookedTimeSlots}
            />
          </CardContent>
        </Card>
      )}

      {/* Price summary */}
      {selectedRange && (
        <Card className="border-[var(--accent)]/30 bg-gold/5">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-3)]">
                {format(selectedRange.start, "d MMM", { locale })} →{" "}
                {format(selectedRange.end, "d MMM yyyy", { locale })}
              </span>
              <span className="font-medium">
                {totalDays}{" "}
                {totalDays === 1
                  ? t("day")
                  : t("days")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--ink-3)]">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {startTime} – {endTime}
              </span>
            </div>
            {totalPrice != null && (
              <div className="flex items-center justify-between pt-2 border-t border-[var(--accent)]/20">
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
              disabled={!selectedRange}
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
