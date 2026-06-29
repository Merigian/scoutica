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
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
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
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      {bookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("noBookings")}
          description={t("noBookingsDesc")}
        />
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
                  <span className="flex items-center gap-1.5 text-[var(--ink)] font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(new Date(booking.startDate), "d MMM", { locale: dateFnsLocale })}
                    {" → "}
                    {format(new Date(booking.endDate), "d MMM yyyy", { locale: dateFnsLocale })}
                  </span>
                  {Array.isArray(booking.slots) && booking.slots.length > 0 ? (
                    <span className="flex flex-wrap items-center gap-1.5">
                      {(booking.slots as Array<{ date: string; startTime: string; endTime: string }>).map(
                        (s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 border border-[var(--rule)] bg-[var(--bg-soft)] px-1.5 py-0.5 text-[11px] text-[var(--ink-2)]"
                          >
                            <Clock className="h-2.5 w-2.5" />
                            <span className="capitalize">
                              {format(new Date(s.date + "T00:00:00"), "EEE d", { locale: dateFnsLocale })}
                            </span>
                            {s.startTime}–{s.endTime}
                          </span>
                        )
                      )}
                    </span>
                  ) : (
                    (booking.startTime || booking.endTime) && (
                      <span className="flex items-center gap-1 text-[var(--ink-3)] text-xs">
                        <Clock className="h-3 w-3" />
                        {booking.startTime || "–"} – {booking.endTime || "–"}
                      </span>
                    )
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
    </PageContainer>
  );
}
