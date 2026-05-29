"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";

export async function reportUser(
  targetUserId: string,
  reason: string,
  details?: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: t("unauthorized") };
  if (session.user.id === targetUserId) return { success: false, error: "Cannot report yourself" };

  await db.report.create({
    data: {
      reporterId: session.user.id,
      reportedUserId: targetUserId,
      reportedContentType: "USER",
      reason: reason as any,
      details: details || null,
      status: "PENDING",
    },
  });

  return { success: true };
}

export async function blockUser(targetUserId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: t("unauthorized") };
  if (session.user.id === targetUserId) return { success: false, error: "Cannot block yourself" };

  // Check if already blocked
  const existing = await db.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: session.user.id,
        blockedId: targetUserId,
      },
    },
  });

  if (!existing) {
    await db.block.create({
      data: {
        blockerId: session.user.id,
        blockedId: targetUserId,
      },
    });
  }

  return { success: true };
}
