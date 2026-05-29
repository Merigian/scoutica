"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { contactRequestSchema } from "@/lib/validations/contact";
import { PLAN_LIMITS } from "@/config/plans";
import type { ActionResponse } from "@/types";

export async function sendContactRequest(
  data: unknown
): Promise<ActionResponse<{ requestId: string }>> {
  const t = await getTranslations("serverErrors");
  const tcr = await getTranslations("serverErrors.contactRequest");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = contactRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const { modelProfileId, subject, message, reason } = parsed.data;

  // Get scout profile
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });

  if (!scoutProfile) {
    return { success: false, error: t("scoutProfileNotFound") };
  }

  if (scoutProfile.verificationStatus !== "APPROVED") {
    return { success: false, error: tcr("mustBeVerified") };
  }

  // Check subscription limits
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });

  const plan = subscription?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  if (limits.contactRequestsPerMonth === 0) {
    return { success: false, error: tcr("planNoContacts") };
  }

  // Check monthly limit
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await db.contactRequest.count({
    where: {
      scoutProfileId: scoutProfile.id,
      createdAt: { gte: startOfMonth },
    },
  });

  if (monthlyCount >= limits.contactRequestsPerMonth) {
    return { success: false, error: tcr("monthlyLimitReached", { limit: limits.contactRequestsPerMonth }) };
  }

  // Check daily limit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyCount = await db.contactRequest.count({
    where: {
      scoutProfileId: scoutProfile.id,
      createdAt: { gte: startOfDay },
    },
  });

  if (dailyCount >= limits.contactRequestsPerDay) {
    return { success: false, error: tcr("dailyLimitReached", { limit: limits.contactRequestsPerDay }) };
  }

  // Check if already contacted
  const existing = await db.contactRequest.findUnique({
    where: {
      scoutProfileId_modelProfileId: {
        scoutProfileId: scoutProfile.id,
        modelProfileId,
      },
    },
    select: { status: true, conversationId: true },
  });

  if (existing) {
    if (existing.status === "ACCEPTED" && existing.conversationId) {
      return { success: false, error: tcr("alreadyAccepted") };
    }
    if (existing.status === "PENDING") {
      return { success: false, error: tcr("alreadySent") };
    }
    // REJECTED: allow re-sending — delete old request
    await db.contactRequest.delete({
      where: {
        scoutProfileId_modelProfileId: {
          scoutProfileId: scoutProfile.id,
          modelProfileId,
        },
      },
    });
  }

  // Verify model exists and is published  
  const modelProfile = await db.modelProfile.findUnique({
    where: { id: modelProfileId, isPublished: true },
    select: { id: true, userId: true, visibility: true },
  });

  if (!modelProfile) {
    return { success: false, error: t("profileNotFoundOrNotPublished") };
  }

  // Check blocks
  const block = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: modelProfile.userId },
        { blockerId: modelProfile.userId, blockedId: session.user.id },
      ],
    },
  });

  if (block) {
    return { success: false, error: tcr("cannotContactProfile") };
  }

  // Create the contact request
  const request = await db.contactRequest.create({
    data: {
      scoutProfileId: scoutProfile.id,
      modelProfileId,
      subject,
      message,
      reason: reason as any,
    },
  });

  // Create notification for the model
  await db.notification.create({
    data: {
      userId: modelProfile.userId,
      type: "CONTACT_REQUEST_RECEIVED",
      title: tcr("newContactRequestTitle"),
      body: subject,
      link: "/model/contacts",
    },
  });

  return { success: true, data: { requestId: request.id } };
}

export async function respondToContactRequest(
  requestId: string,
  action: "accept" | "reject"
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tcr = await getTranslations("serverErrors.contactRequest");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const request = await db.contactRequest.findUnique({
    where: { id: requestId },
    include: {
      modelProfile: { select: { userId: true } },
      scoutProfile: { select: { userId: true } },
    },
  });

  if (!request) {
    return { success: false, error: tcr("requestNotFound") };
  }

  if (request.modelProfile.userId !== session.user.id) {
    return { success: false, error: t("unauthorized") };
  }

  if (request.status !== "PENDING") {
    return { success: false, error: tcr("alreadyHandled") };
  }

  if (action === "accept") {
    // Create conversation
    const conversation = await db.conversation.create({
      data: {
        lastMessageAt: new Date(),
        participants: {
          createMany: {
            data: [
              { userId: request.modelProfile.userId },
              { userId: request.scoutProfile.userId },
            ],
          },
        },
      },
    });

    await db.contactRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
        conversationId: conversation.id,
      },
    });

    // Notify scout
    await db.notification.create({
      data: {
        userId: request.scoutProfile.userId,
        type: "CONTACT_REQUEST_ACCEPTED",
        title: tcr("accepted"),
        body: tcr("requestAccepted"),
        link: `/scout/messages/${conversation.id}`,
      },
    });
  } else {
    await db.contactRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });

    await db.notification.create({
      data: {
        userId: request.scoutProfile.userId,
        type: "CONTACT_REQUEST_REJECTED",
        title: tcr("rejected"),
        body: tcr("requestRejected"),
        link: "/scout/contacts",
      },
    });
  }

  return { success: true };
}
