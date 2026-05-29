"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";

export async function saveWaitlistInfo(data: {
  fullName?: string;
  businessName?: string;
  city?: string;
  professionalLink?: string;
  talentTypesNeeded?: string;
}): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: t("unauthorized") };
    }

    await db.waitlistEntry.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fullName: data.fullName || null,
        businessName: data.businessName || null,
        city: data.city || null,
        professionalLink: data.professionalLink || null,
        talentTypesNeeded: data.talentTypesNeeded || null,
      },
      update: {
        fullName: data.fullName || null,
        businessName: data.businessName || null,
        city: data.city || null,
        professionalLink: data.professionalLink || null,
        talentTypesNeeded: data.talentTypesNeeded || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Save waitlist info error:", error);
    return { success: false, error: "Error saving waitlist information" };
  }
}
