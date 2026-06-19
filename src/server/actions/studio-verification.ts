"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";

/**
 * Studio owner signals their account is ready for admin review.
 * Moves the profile to VERIFICATION_SUBMITTED so it surfaces (highlighted)
 * in the admin studio-verifications queue. Admins can also approve a profile
 * that is still PENDING, so this is an optional "I'm ready" nudge.
 */
export async function submitStudioVerification(): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDIO") {
    return { success: false, error: t("unauthorized") };
  }

  const profile = await db.studioProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });
  if (!profile) return { success: false, error: t("profileNotFound") };

  if (profile.verificationStatus === "APPROVED") {
    return { success: true };
  }

  await db.studioProfile.update({
    where: { id: profile.id },
    data: {
      verificationStatus: "VERIFICATION_SUBMITTED",
      verificationSubmittedAt: new Date(),
      verificationNotes: null,
    },
  });

  return { success: true };
}
