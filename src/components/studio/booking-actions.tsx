"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { confirmBooking, cancelBooking, completeBooking } from "@/server/actions/studio-bookings";
import { Button } from "@/components/ui/button";
import { Check, X, CheckCircle } from "lucide-react";
import type { BookingStatus } from "@prisma/client";

interface BookingActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingActions({ bookingId, currentStatus }: BookingActionsProps) {
  const router = useRouter();
  const t = useTranslations("components.bookingActions");
  const [loading, setLoading] = useState(false);

  if (currentStatus === "CANCELLED" || currentStatus === "COMPLETED") return null;

  const handleConfirm = async () => {
    setLoading(true);
    await confirmBooking(bookingId);
    setLoading(false);
    router.refresh();
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelBooking(bookingId);
    setLoading(false);
    router.refresh();
  };

  const handleComplete = async () => {
    setLoading(true);
    await completeBooking(bookingId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-1">
      {currentStatus === "PENDING" && (
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 text-success hover:bg-success/10"
          onClick={handleConfirm}
          disabled={loading}
          title={t("confirmBooking")}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}
      {currentStatus === "CONFIRMED" && (
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 text-success hover:bg-success/10"
          onClick={handleComplete}
          disabled={loading}
          title={t("markCompleted")}
        >
          <CheckCircle className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 text-[var(--accent)] hover:bg-[var(--accent)]/10"
        onClick={handleCancel}
        disabled={loading}
        title={t("cancelBooking")}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
