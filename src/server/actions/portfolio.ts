"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";
import { calculateCompleteness } from "@/server/services/completeness";
import { PLAN_LIMITS } from "@/config/plans";
import type { PlanTier } from "@prisma/client";

export async function addPortfolioImage(data: {
  url: string;
  key: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tp = await getTranslations("serverErrors.portfolio");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { portfolioImages: true } } },
    });

    if (!profile) {
      return { success: false, error: t("profileNotFound") };
    }

    // Get plan-based photo limit
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    const planTier: PlanTier = subscription?.plan ?? "FREE";
    const maxPhotos = PLAN_LIMITS[planTier].maxPhotos;

    if (profile._count.portfolioImages >= maxPhotos) {
      return { success: false, error: tp("maxPhotos", { max: maxPhotos }) };
    }

    const maxOrder = await db.portfolioImage.findFirst({
      where: { modelProfileId: profile.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const isFirstImage = profile._count.portfolioImages === 0;

    await db.portfolioImage.create({
      data: {
        modelProfileId: profile.id,
        url: data.url,
        key: data.key,
        width: data.width,
        height: data.height,
        sizeBytes: data.sizeBytes,
        order: (maxOrder?.order ?? -1) + 1,
        isCover: isFirstImage, // First image is automatically cover
      },
    });

    // Recalculate completeness
    const newCount = profile._count.portfolioImages + 1;
    const completenessScore = calculateCompleteness({
      ...profile,
      portfolioImageCount: newCount,
    });

    await db.modelProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    return { success: true };
  } catch (error) {
    console.error("Add portfolio image error:", error);
    return { success: false, error: tp("uploadError") };
  }
}

export async function deletePortfolioImage(imageId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tp = await getTranslations("serverErrors.portfolio");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    const image = await db.portfolioImage.findUnique({
      where: { id: imageId },
      include: { modelProfile: { select: { userId: true, id: true } } },
    });

    if (!image || image.modelProfile.userId !== session.user.id) {
      return { success: false, error: t("imageNotFound") };
    }

    await db.portfolioImage.delete({ where: { id: imageId } });

    // If deleted image was cover, set next image as cover
    if (image.isCover) {
      const nextImage = await db.portfolioImage.findFirst({
        where: { modelProfileId: image.modelProfile.id },
        orderBy: { order: "asc" },
      });
      if (nextImage) {
        await db.portfolioImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Delete portfolio image error:", error);
    return { success: false, error: tp("deleteError") };
  }
}

export async function setCoverImage(imageId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tp = await getTranslations("serverErrors.portfolio");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    const image = await db.portfolioImage.findUnique({
      where: { id: imageId },
      include: { modelProfile: { select: { userId: true, id: true } } },
    });

    if (!image || image.modelProfile.userId !== session.user.id) {
      return { success: false, error: t("imageNotFound") };
    }

    // Reset all covers, then set the new one
    await db.portfolioImage.updateMany({
      where: { modelProfileId: image.modelProfile.id },
      data: { isCover: false },
    });

    await db.portfolioImage.update({
      where: { id: imageId },
      data: { isCover: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Set cover image error:", error);
    return { success: false, error: tp("setCoverError") };
  }
}

export async function reorderImages(imageIds: string[]): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tp = await getTranslations("serverErrors.portfolio");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    // Update each image's order
    await Promise.all(
      imageIds.map((id, index) =>
        db.portfolioImage.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Reorder images error:", error);
    return { success: false, error: tp("reorderError") };
  }
}
