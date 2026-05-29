"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { verificationSchema, scoutProfileSchema, type VerificationInput, type ScoutProfileInput } from "@/lib/validations/profile";
import type { ActionResponse } from "@/types";

export async function updateScoutProfile(data: ScoutProfileInput): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.scoutProfile");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SCOUT") {
      return { success: false, error: t("unauthorized") };
    }

    const validated = scoutProfileSchema.parse(data);

    await db.scoutProfile.update({
      where: { userId: session.user.id },
      data: {
        ...validated,
        websiteUrl: validated.websiteUrl || null,
        socialProfileUrl: validated.socialProfileUrl || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update scout profile error:", error);
    return { success: false, error: ts("updateError") };
  }
}

export async function submitVerification(data: VerificationInput): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.scoutProfile");
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SCOUT") {
      return { success: false, error: t("unauthorized") };
    }

    const validated = verificationSchema.parse(data);

    // Also update User.name if fullName provided
    if (validated.fullName) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: validated.fullName },
      }).catch(() => { /* non-critical */ });
    }

    const { fullName, purposeOfUse, ...profileData } = validated;

    await db.scoutProfile.update({
      where: { userId: session.user.id },
      data: {
        ...profileData,
        purposeOfUse: purposeOfUse || null,
        websiteUrl: profileData.websiteUrl || null,
        socialProfileUrl: profileData.socialProfileUrl || null,
        verificationStatus: "VERIFICATION_SUBMITTED",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Submit verification error:", error);
    return { success: false, error: ts("submitError") };
  }
}
