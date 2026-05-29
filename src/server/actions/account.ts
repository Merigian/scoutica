"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";
import { signOut } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function deleteAccount(): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  const userId = session.user.id;

  try {
    // Delete uploaded files (portfolio, avatar)
    const portfolioImages = await db.portfolioImage.findMany({
      where: { modelProfile: { userId } },
    });

    for (const img of portfolioImages) {
      const filePath = path.join(process.cwd(), "public", img.url);
      await fs.unlink(filePath).catch(() => {});
    }

    // Delete user and cascade (Prisma cascades handle related records)
    await db.user.delete({ where: { id: userId } });

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, error: t("genericError") };
  }
}

export async function exportUserData(): Promise<ActionResponse<Record<string, unknown>>> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  const userId = session.user.id;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        modelProfile: {
          include: { portfolioImages: true },
        },
        scoutProfile: true,
        studioProfile: true,
        subscription: true,
        notifications: { take: 100, orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      return { success: false, error: t("notFound") };
    }

    // Strip sensitive fields
    const { hashedPassword, ...safeUser } = user;

    return { success: true, data: safeUser as unknown as Record<string, unknown> };
  } catch (error) {
    console.error("Export data error:", error);
    return { success: false, error: t("genericError") };
  }
}
