"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { eachDayOfInterval, format } from "date-fns";

interface CreateBookingInput {
  studioId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalDays: number;
  totalPrice?: number;
}

export async function createStudioBooking(
  data: CreateBookingInput
): Promise<ActionResponse<{ bookingId: string }>> {
  const t = await getTranslations("serverErrors");
  const tb = await getTranslations("serverErrors.studioBookings");
  try {
    const session = await auth();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Verify studio exists and is published
    const studio = await db.studio.findUnique({
      where: { id: data.studioId, isPublished: true, status: "PUBLISHED" },
      include: { studioProfile: { select: { userId: true } } },
    });
    if (!studio) return { success: false, error: t("studioNotFound") };

    // Check no overlap with existing pending/confirmed bookings
    const overlapping = await db.studioBooking.findFirst({
      where: {
        studioId: data.studioId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
    if (overlapping) {
      return {
        success: false,
        error: tb("datesNoLongerAvailable"),
      };
    }

    // Check no blocked dates in range
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dateValues = days.map(
      (d) => new Date(format(d, "yyyy-MM-dd") + "T00:00:00.000Z")
    );
    const blockedCount = await db.studioBlockedDate.count({
      where: {
        studioId: data.studioId,
        date: { in: dateValues },
      },
    });
    if (blockedCount > 0) {
      return {
        success: false,
        error: tb("someDatesUnavailable"),
      };
    }

    const booking = await db.studioBooking.create({
      data: {
        studioId: data.studioId,
        senderUserId: session?.user?.id || null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        startDate,
        endDate,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        totalDays: data.totalDays,
        totalPrice: data.totalPrice || null,
        status: "PENDING",
      },
    });

    // Notify studio owner
    await db.notification.create({
      data: {
        userId: studio.studioProfile.userId,
        type: "BOOKING_RECEIVED",
        title: tb("newBookingTitle", { studio: studio.name }),
        body: tb("newBookingBody", { name: data.name, from: format(startDate, "dd/MM"), to: format(endDate, "dd/MM/yyyy") }),
      },
    });

    revalidatePath("/studio/bookings");
    return { success: true, data: { bookingId: booking.id } };
  } catch (error) {
    console.error("Create booking error:", error);
    return { success: false, error: tb("bookingError") };
  }
}

export async function confirmBooking(
  bookingId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tb = await getTranslations("serverErrors.studioBookings");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO")
      return { success: false, error: t("unauthorized") };

    const profile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: t("profileNotFound") };

    const booking = await db.studioBooking.findUnique({
      where: { id: bookingId },
      include: {
        studio: { select: { studioProfileId: true, name: true } },
      },
    });
    if (!booking || booking.studio.studioProfileId !== profile.id)
      return { success: false, error: tb("bookingNotFound") };
    if (booking.status !== "PENDING")
      return { success: false, error: tb("bookingNotPending") };

    await db.studioBooking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    // Notify sender
    if (booking.senderUserId) {
      await db.notification.create({
        data: {
          userId: booking.senderUserId,
          type: "BOOKING_CONFIRMED",
          title: tb("bookingConfirmedTitle", { studio: booking.studio.name }),
          body: tb("bookingConfirmedBody", { from: format(booking.startDate, "dd/MM"), to: format(booking.endDate, "dd/MM/yyyy") }),
        },
      });
    }

    revalidatePath("/studio/bookings");
    return { success: true };
  } catch (error) {
    console.error("Confirm booking error:", error);
    return { success: false, error: t("error") };
  }
}

export async function cancelBooking(
  bookingId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tb = await getTranslations("serverErrors.studioBookings");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO")
      return { success: false, error: t("unauthorized") };

    const profile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: t("profileNotFound") };

    const booking = await db.studioBooking.findUnique({
      where: { id: bookingId },
      include: {
        studio: { select: { studioProfileId: true, name: true } },
      },
    });
    if (!booking || booking.studio.studioProfileId !== profile.id)
      return { success: false, error: tb("bookingNotFound") };

    await db.studioBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (booking.senderUserId) {
      await db.notification.create({
        data: {
          userId: booking.senderUserId,
          type: "BOOKING_CANCELLED",
          title: tb("bookingCancelledTitle", { studio: booking.studio.name }),
          body: tb("bookingCancelledBody", { from: format(booking.startDate, "dd/MM"), to: format(booking.endDate, "dd/MM/yyyy") }),
        },
      });
    }

    revalidatePath("/studio/bookings");
    return { success: true };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: t("error") };
  }
}

export async function completeBooking(
  bookingId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tb = await getTranslations("serverErrors.studioBookings");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO")
      return { success: false, error: t("unauthorized") };

    const profile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: t("profileNotFound") };

    const booking = await db.studioBooking.findUnique({
      where: { id: bookingId },
      include: {
        studio: { select: { studioProfileId: true } },
      },
    });
    if (!booking || booking.studio.studioProfileId !== profile.id)
      return { success: false, error: tb("bookingNotFound") };
    if (booking.status !== "CONFIRMED")
      return { success: false, error: tb("onlyConfirmedBookings") };

    await db.studioBooking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/studio/bookings");
    return { success: true };
  } catch (error) {
    console.error("Complete booking error:", error);
    return { success: false, error: t("error") };
  }
}

export async function addBlockedDates(
  studioId: string,
  dates: string[]
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO")
      return { success: false, error: t("unauthorized") };

    const profile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: t("profileNotFound") };

    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: profile.id },
    });
    if (!studio) return { success: false, error: t("studioNotFound") };

    await db.studioBlockedDate.createMany({
      data: dates.map((d) => ({
        studioId,
        date: new Date(d + "T00:00:00.000Z"),
      })),
      skipDuplicates: true,
    });

    revalidatePath(`/studio/studios/${studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Block dates error:", error);
    return { success: false, error: t("error") };
  }
}

export async function removeBlockedDate(
  blockedDateId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO")
      return { success: false, error: t("unauthorized") };

    const profile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: t("profileNotFound") };

    const blockedDate = await db.studioBlockedDate.findUnique({
      where: { id: blockedDateId },
      include: { studio: { select: { studioProfileId: true } } },
    });
    if (!blockedDate || blockedDate.studio.studioProfileId !== profile.id)
      return { success: false, error: t("notFound") };

    await db.studioBlockedDate.delete({ where: { id: blockedDateId } });

    revalidatePath(`/studio/studios/${blockedDate.studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Remove blocked date error:", error);
    return { success: false, error: t("error") };
  }
}
