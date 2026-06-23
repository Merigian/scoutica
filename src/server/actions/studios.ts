"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { StudioType } from "@prisma/client";
import type { WeeklyAvailability } from "@/lib/studio-availability";
import type { ActionResponse } from "@/types";

interface CreateStudioInput {
  name: string;
  description?: string;
  studioType: StudioType;
  address?: string;
  city?: string;
  region?: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  sizeSqm?: number;
  maxCapacity?: number;
  amenities: string[];
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  minHours?: number;
  weeklyAvailability?: WeeklyAvailability | null;
  contactEmail?: string;
  contactPhone?: string;
}

export async function createStudio(
  data: CreateStudioInput
): Promise<ActionResponse<{ studioId: string }>> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return { success: false, error: t("studioProfileNotFound") };
    }

    const slug = generateSlug(data.name);

    // Check if slug exists, append a suffix if so
    const existingSlug = await db.studio.findUnique({ where: { slug } });
    const finalSlug = existingSlug
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    const studio = await db.studio.create({
      data: {
        studioProfileId: studioProfile.id,
        slug: finalSlug,
        name: data.name,
        description: data.description || null,
        studioType: data.studioType,
        address: data.address || null,
        city: data.city || null,
        region: data.region || null,
        zipCode: data.zipCode || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        sizeSqm: data.sizeSqm || null,
        maxCapacity: data.maxCapacity || null,
        amenities: data.amenities,
        hourlyRate: data.hourlyRate || null,
        dailyRate: data.dailyRate || null,
        weeklyRate: data.weeklyRate || null,
        minHours: data.minHours || null,
        weeklyAvailability: data.weeklyAvailability
          ? (data.weeklyAvailability as Prisma.InputJsonValue)
          : Prisma.DbNull,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
      },
    });

    revalidatePath("/studio/studios");
    return { success: true, data: { studioId: studio.id } };
  } catch (error) {
    console.error("Create studio error:", error);
    return { success: false, error: ts("createError") };
  }
}

export async function updateStudio(
  studioId: string,
  data: Partial<CreateStudioInput>
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return { success: false, error: t("studioProfileNotFound") };
    }

    // Verify ownership
    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: studioProfile.id },
    });
    if (!studio) {
      return { success: false, error: t("studioNotFound") };
    }

    await db.studio.update({
      where: { id: studioId },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        studioType: data.studioType ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        region: data.region ?? undefined,
        zipCode: data.zipCode ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        sizeSqm: data.sizeSqm ?? undefined,
        maxCapacity: data.maxCapacity ?? undefined,
        amenities: data.amenities ?? undefined,
        hourlyRate: data.hourlyRate ?? undefined,
        dailyRate: data.dailyRate ?? undefined,
        weeklyRate: data.weeklyRate ?? undefined,
        minHours: data.minHours ?? undefined,
        weeklyAvailability:
          data.weeklyAvailability === undefined
            ? undefined
            : data.weeklyAvailability === null
              ? Prisma.DbNull
              : (data.weeklyAvailability as Prisma.InputJsonValue),
        contactEmail: data.contactEmail ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
      },
    });

    revalidatePath("/studio/studios");
    revalidatePath(`/studio/studios/${studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Update studio error:", error);
    return { success: false, error: ts("updateError") };
  }
}

export async function publishStudio(studioId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return { success: false, error: t("studioProfileNotFound") };
    }

    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: studioProfile.id },
      include: { _count: { select: { images: true } } },
    });
    if (!studio) {
      return { success: false, error: t("studioNotFound") };
    }

    // Enforce minimum completeness before a listing can go live
    const missing: string[] = [];
    if (!studio.city?.trim()) missing.push(ts("requireCity"));
    if (!studio.hourlyRate && !studio.dailyRate && !studio.weeklyRate) {
      missing.push(ts("requireRate"));
    }
    if (studio._count.images === 0) missing.push(ts("requirePhoto"));
    if (missing.length > 0) {
      return {
        success: false,
        error: ts("publishRequirements", { missing: missing.join(", ") }),
      };
    }

    await db.studio.update({
      where: { id: studioId },
      data: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: studio.publishedAt ?? new Date(),
      },
    });

    revalidatePath("/studio/studios");
    revalidatePath("/studios");
    return { success: true };
  } catch (error) {
    console.error("Publish studio error:", error);
    return { success: false, error: ts("publishError") };
  }
}

export async function pauseStudio(studioId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return { success: false, error: t("studioProfileNotFound") };
    }

    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: studioProfile.id },
    });
    if (!studio) {
      return { success: false, error: t("studioNotFound") };
    }

    await db.studio.update({
      where: { id: studioId },
      data: { status: "PAUSED", isPublished: false },
    });

    revalidatePath("/studio/studios");
    return { success: true };
  } catch (error) {
    console.error("Pause studio error:", error);
    return { success: false, error: t("error") };
  }
}

export async function deleteStudio(studioId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return { success: false, error: t("studioProfileNotFound") };
    }

    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: studioProfile.id },
    });
    if (!studio) {
      return { success: false, error: t("studioNotFound") };
    }

    await db.studio.delete({ where: { id: studioId } });

    revalidatePath("/studio/studios");
    return { success: true };
  } catch (error) {
    console.error("Delete studio error:", error);
    return { success: false, error: ts("deleteError") };
  }
}

export async function deleteStudioImage(imageId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const image = await db.studioImage.findUnique({
      where: { id: imageId },
      include: { studio: { include: { studioProfile: true } } },
    });
    if (!image || image.studio.studioProfile.userId !== session.user.id) {
      return { success: false, error: t("imageNotFound") };
    }

    await db.studioImage.delete({ where: { id: imageId } });

    // If deleted image was cover, promote next one
    if (image.isCover) {
      const nextImage = await db.studioImage.findFirst({
        where: { studioId: image.studioId },
        orderBy: { order: "asc" },
      });
      if (nextImage) {
        await db.studioImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }

    revalidatePath(`/studio/studios/${image.studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete studio image error:", error);
    return { success: false, error: ts("deleteError") };
  }
}

export async function setStudioCoverImage(imageId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const image = await db.studioImage.findUnique({
      where: { id: imageId },
      include: { studio: { include: { studioProfile: true } } },
    });
    if (!image || image.studio.studioProfile.userId !== session.user.id) {
      return { success: false, error: t("imageNotFound") };
    }

    // Unset all covers for this studio, then set the new one
    await db.$transaction([
      db.studioImage.updateMany({
        where: { studioId: image.studioId },
        data: { isCover: false },
      }),
      db.studioImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ]);

    revalidatePath(`/studio/studios/${image.studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Set cover error:", error);
    return { success: false, error: t("error") };
  }
}

// Studio inquiry actions
export async function sendStudioInquiry(data: {
  studioId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredDates?: string;
  durationHours?: number;
}): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();

    await db.studioInquiry.create({
      data: {
        studioId: data.studioId,
        senderUserId: session?.user?.id ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        preferredDates: data.preferredDates || null,
        durationHours: data.durationHours || null,
      },
    });

    // Get studio owner for notification
    const studio = await db.studio.findUnique({
      where: { id: data.studioId },
      include: { studioProfile: { select: { userId: true } } },
    });

    if (studio) {
      await db.notification.create({
        data: {
          userId: studio.studioProfile.userId,
          type: "STUDIO_INQUIRY_RECEIVED",
          title: ts("newInquiryTitle"),
          body: ts("newInquiryBody", { name: data.name, studio: studio.name }),
          link: "/studio/inquiries",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Send inquiry error:", error);
    return { success: false, error: t("requestSendError") };
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: "REPLIED" | "CLOSED"
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.studios");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return { success: false, error: t("unauthorized") };
    }

    const inquiry = await db.studioInquiry.findUnique({
      where: { id: inquiryId },
      include: { studio: { include: { studioProfile: true } } },
    });
    if (!inquiry || inquiry.studio.studioProfile.userId !== session.user.id) {
      return { success: false, error: ts("inquiryNotFound") };
    }

    await db.studioInquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    revalidatePath("/studio/inquiries");
    return { success: true };
  } catch (error) {
    console.error("Update inquiry error:", error);
    return { success: false, error: t("error") };
  }
}
