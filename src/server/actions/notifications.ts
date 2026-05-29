"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";

export async function getNotifications(limit = 50) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function markNotificationRead(notificationId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: t("unauthorized") };

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: t("unauthorized") };

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return db.notification.create({
    data: {
      userId: data.userId,
      type: data.type as any,
      title: data.title,
      body: data.body,
      link: data.link,
    },
  });
}
