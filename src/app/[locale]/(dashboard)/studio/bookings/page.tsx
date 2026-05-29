import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getMyBookings } from "@/server/queries/studios";
import { BOOKING_STATUS_LABELS } from "@/config/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Mail, Phone, CalendarDays, Euro, Clock } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import { BookingActions } from "@/components/studio/booking-actions";
import type { BookingStatus } from "@prisma/client";

const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "default",
  CONFIRMED: "outline",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
};

export default async function StudioBookingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.studio.bookings");
  const dateFnsLocale = lang === "it" ? itLocale : enUS;

  if (!session?.user || session.user.role !== "STUDIO") {
    redirect(`/${locale}/login`);
  }

  const bookings = await getMyBookings(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <Inbox className="h-12 w-12 text-[var(--ink-3)]/30 mx-auto mb-4" />
            <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2">
              {t("noBookings")}
            </h3>
            <p className="text-sm text-[var(--ink-3)]">
              {t("noBookingsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{booking.name}</h3>
                    <p className="text-xs text-[var(--ink-3)]">
                      {t("for")}:{" "}
                      <span className="font-medium">{booking.studio.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={STATUS_VARIANT[booking.status]}
                      className="text-[10px]"
                    >
                      {BOOKING_STATUS_LABELS[booking.status][lang]}
                    </Badge>
                    <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                  </div>
                </div>

                {/* Dates & price */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                  <span className="flex items-center gap-1.5 text-gold font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(new Date(booking.startDate), "d MMM", { locale: dateFnsLocale })}
                    {" → "}
                    {format(new Date(booking.endDate), "d MMM yyyy", { locale: dateFnsLocale })}
                  </span>
                  {(booking.startTime || booking.endTime) && (
                    <span className="flex items-center gap-1 text-[var(--ink-3)] text-xs">
                      <Clock className="h-3 w-3" />
                      {booking.startTime || "–"} – {booking.endTime || "–"}
                    </span>
                  )}
                  <span className="text-[var(--ink-3)] text-xs">
                    ({booking.totalDays}{" "}
                    {booking.totalDays === 1
                      ? t("day")
                      : t("days")})
                  </span>
                  {booking.totalPrice != null && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Euro className="h-3.5 w-3.5" />
                      {Number(booking.totalPrice).toFixed(0)}
                    </span>
                  )}
                </div>

                {booking.message && (
                  <p className="text-sm mb-3 whitespace-pre-wrap text-[var(--ink-3)]">
                    {booking.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-3)]">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <a
                      href={`mailto:${booking.email}`}
                      className="hover:underline"
                    >
                      {booking.email}
                    </a>
                  </span>
                  {booking.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${booking.phone}`}
                        className="hover:underline"
                      >
                        {booking.phone}
                      </a>
                    </span>
                  )}
                  <span className="text-[var(--ink-3)]/60">
                    {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
