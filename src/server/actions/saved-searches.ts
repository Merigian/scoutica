"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/config/plans";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const MAX_SAVED_SEARCHES = 20;
const MAX_NAME_LENGTH = 80;

async function getScout() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") return null;
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!scoutProfile) return null;
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });
  return {
    scoutProfileId: scoutProfile.id,
    plan: subscription?.plan ?? "FREE",
  };
}

export async function saveSearch(
  name: string,
  filters: Record<string, string>
): Promise<ActionResponse<{ id: string }>> {
  const t = await getTranslations("serverErrors");
  const scout = await getScout();
  if (!scout) return { success: false, error: t("unauthorized") };

  if (!PLAN_LIMITS[scout.plan].savedSearches) {
    return { success: false, error: t("savedSearch.planRequired") };
  }

  const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!cleanName) return { success: false, error: t("savedSearch.nameRequired") };

  const count = await db.savedSearch.count({
    where: { scoutProfileId: scout.scoutProfileId },
  });
  if (count >= MAX_SAVED_SEARCHES) {
    return { success: false, error: t("savedSearch.limitReached") };
  }

  const created = await db.savedSearch.create({
    data: {
      scoutProfileId: scout.scoutProfileId,
      name: cleanName,
      filters: filters as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  revalidatePath("/[locale]/(dashboard)/scout/discover", "page");
  return { success: true, data: { id: created.id } };
}

export async function deleteSavedSearch(id: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const scout = await getScout();
  if (!scout) return { success: false, error: t("unauthorized") };

  const search = await db.savedSearch.findUnique({
    where: { id },
    select: { scoutProfileId: true },
  });
  if (!search || search.scoutProfileId !== scout.scoutProfileId) {
    return { success: false, error: t("notFound") };
  }

  await db.savedSearch.delete({ where: { id } });
  revalidatePath("/[locale]/(dashboard)/scout/discover", "page");
  return { success: true };
}
