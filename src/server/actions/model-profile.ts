"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { modelProfileSchema, type ModelProfileInput } from "@/lib/validations/profile";
import { calculateCompleteness, checkPublishRequirements, checkActivationRequirements } from "@/server/services/completeness";
import { generateSlug } from "@/lib/utils";
import type { ActionResponse } from "@/types";

export async function updateModelProfile(data: ModelProfileInput): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tm = await getTranslations("serverErrors.modelProfile");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    const validated = modelProfileSchema.parse(data);
    const fullName = `${validated.firstName} ${validated.lastName}`.trim();
    const { firstName, lastName, ...profileData } = validated;

    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true } },
        _count: { select: { portfolioImages: true } },
      },
    });

    if (!profile) {
      return { success: false, error: t("profileNotFound") };
    }

    // Calculate new completeness score
    const updatedData = { ...profile, ...profileData, fullName };
    const completenessScore = calculateCompleteness({
      ...updatedData,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : profile.dateOfBirth,
      portfolioImageCount: profile._count.portfolioImages,
    });

    // Convert usernames to full URLs
    const toUrl = (handle: string | null | undefined, base: string) => {
      if (!handle) return null;
      const clean = handle.replace(/^@/, "").trim();
      if (!clean) return null;
      if (clean.startsWith("http")) return clean;
      return `${base}${clean}`;
    };

    // Auto-update slug when fullName is set for the first time and slug is temporary
    let newSlug: string | undefined;
    if (fullName && fullName.length >= 2 && profile.slug.startsWith("model-") && profile.slug.length <= 14) {
      const candidateSlug = generateSlug(fullName);
      // Verify uniqueness
      const existing = await db.modelProfile.findUnique({ where: { slug: candidateSlug } });
      if (!existing) {
        newSlug = candidateSlug;
      }
    }

    // Check activation requirements
    const activationData = {
      ...updatedData,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : profile.dateOfBirth,
      portfolioImageCount: profile._count.portfolioImages,
    };
    const { canActivate } = checkActivationRequirements(activationData);

    // Determine new status
    let newStatus = profile.status;
    if (canActivate && profile.status === "INCOMPLETE") {
      newStatus = "ACTIVE";
    } else if (!canActivate && profile.status === "ACTIVE") {
      newStatus = "INCOMPLETE";
    }

    // If deactivating, also unpublish
    const shouldUnpublish = newStatus === "INCOMPLETE" && profile.isPublished;

    // Also update User.name if not yet set
    if (fullName && fullName.length >= 2 && !profile.user?.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: fullName },
      }).catch(() => { /* non-critical */ });
    }

    await db.modelProfile.update({
      where: { id: profile.id },
      data: {
        ...profileData,
        fullName,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        instagramUrl: toUrl(validated.instagramUrl, "https://instagram.com/"),
        tiktokUrl: toUrl(validated.tiktokUrl, "https://tiktok.com/@"),
        youtubeUrl: toUrl(validated.youtubeUrl, "https://youtube.com/@"),
        xUrl: toUrl(validated.xUrl, "https://x.com/"),
        websiteUrl: validated.websiteUrl || null,
        completenessScore,
        status: newStatus,
        ...(newSlug ? { slug: newSlug } : {}),
        ...(shouldUnpublish ? { isPublished: false, publishedAt: null } : {}),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update model profile error:", error);
    return { success: false, error: tm("updateError") };
  }
}

export async function publishModelProfile(): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tm = await getTranslations("serverErrors.modelProfile");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        portfolioImages: { select: { isCover: true } },
        _count: { select: { portfolioImages: true } },
      },
    });

    if (!profile) {
      return { success: false, error: t("profileNotFound") };
    }

    // Must be ACTIVE to publish
    if (profile.status !== "ACTIVE") {
      return { success: false, error: tm("profileNotActive") };
    }

    const hasCover = profile.portfolioImages.some((img) => img.isCover);
    const { canPublish, missing } = checkPublishRequirements({
      ...profile,
      portfolioImageCount: profile._count.portfolioImages,
      hasCover,
    });

    if (!canPublish) {
      return { success: false, error: tm("missingRequirements", { missing: missing.join(", ") }) };
    }

    await db.modelProfile.update({
      where: { id: profile.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Publish model profile error:", error);
    return { success: false, error: tm("publishError") };
  }
}

export async function unpublishModelProfile(): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tm = await getTranslations("serverErrors.modelProfile");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return { success: false, error: t("unauthorized") };
    }

    await db.modelProfile.update({
      where: { userId: session.user.id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Unpublish model profile error:", error);
    return { success: false, error: tm("unpublishError") };
  }
}
