"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { castingSchema, castingApplicationSchema } from "@/lib/validations/casting";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { ActionResponse } from "@/types";

export async function createCasting(data: unknown): Promise<ActionResponse<{ castingId: string }>> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = castingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });

  if (!scoutProfile || scoutProfile.verificationStatus !== "APPROVED") {
    return { success: false, error: tc("mustBeVerified") };
  }

  const casting = await db.casting.create({
    data: {
      scoutProfileId: scoutProfile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      region: parsed.data.region,
      castingDate: parsed.data.castingDate ? new Date(parsed.data.castingDate) : null,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      requirements: parsed.data.requirements,
      compensation: parsed.data.compensation,
      isPaid: parsed.data.isPaid ?? false,
      spots: parsed.data.spots,
      notes: parsed.data.notes,
      castingType: parsed.data.castingType,
      time: parsed.data.time,
      address: parsed.data.address,
      instructions: parsed.data.instructions,
      materialsRequired: parsed.data.materialsRequired,
      status: "DRAFT",
    },
  });

  return { success: true, data: { castingId: casting.id } };
}

export async function updateCasting(
  castingId: string,
  data: unknown
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = castingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const casting = await db.casting.findUnique({
    where: { id: castingId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!casting || casting.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tc("notFound") };
  }

  await db.casting.update({
    where: { id: castingId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      region: parsed.data.region,
      castingDate: parsed.data.castingDate ? new Date(parsed.data.castingDate) : null,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      requirements: parsed.data.requirements,
      compensation: parsed.data.compensation,
      isPaid: parsed.data.isPaid ?? false,
      spots: parsed.data.spots,
      notes: parsed.data.notes,
      castingType: parsed.data.castingType,
      time: parsed.data.time,
      address: parsed.data.address,
      instructions: parsed.data.instructions,
      materialsRequired: parsed.data.materialsRequired,
    },
  });

  return { success: true };
}

export async function publishCasting(castingId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const tm = await getTranslations("serverErrors.modelProfile");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const casting = await db.casting.findUnique({
    where: { id: castingId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!casting || casting.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tc("notFound") };
  }

  if (!casting.title || !casting.description) {
    return { success: false, error: tm("titleDescRequired") };
  }

  await db.casting.update({
    where: { id: castingId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  return { success: true };
}

export async function closeCasting(castingId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const casting = await db.casting.findUnique({
    where: { id: castingId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!casting || casting.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tc("notFound") };
  }

  await db.casting.update({
    where: { id: castingId },
    data: { status: "CLOSED" },
  });

  return { success: true };
}

export async function applyToCasting(data: unknown): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const cfg = RATE_LIMITS.application;
  const rl = await rateLimit(`apply:${session.user.id}`, cfg.limit, cfg.windowMs);
  if (!rl.success) {
    return { success: false, error: "Hai inviato troppe candidature. Riprova tra un'ora." };
  }

  const parsed = castingApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isPublished: true },
  });

  if (!modelProfile || !modelProfile.isPublished) {
    return { success: false, error: tc("profileMustBePublished") };
  }

  // Check casting exists and is published
  const casting = await db.casting.findUnique({
    where: { id: parsed.data.castingId, status: "PUBLISHED" },
    select: { id: true, deadline: true, scoutProfileId: true },
  });

  if (!casting) {
    return { success: false, error: tc("notFoundOrClosed") };
  }

  if (casting.deadline && new Date(casting.deadline) < new Date()) {
    return { success: false, error: tc("deadlineExpired") };
  }

  // Check if already applied
  const existing = await db.castingApplication.findUnique({
    where: {
      castingId_modelProfileId: {
        castingId: parsed.data.castingId,
        modelProfileId: modelProfile.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: tc("alreadyApplied") };
  }

  await db.castingApplication.create({
    data: {
      castingId: parsed.data.castingId,
      modelProfileId: modelProfile.id,
      introMessage: parsed.data.introMessage,
    },
  });

  // Notify scout
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { id: casting.scoutProfileId },
    select: { userId: true },
  });

  if (scoutProfile) {
    await db.notification.create({
      data: {
        userId: scoutProfile.userId,
        type: "APPLICATION_SUBMITTED",
        title: tc("newApplicationTitle"),
        body: tc("newApplicationBody"),
        link: `/scout/castings/${casting.id}/applications`,
      },
    });
  }

  return { success: true };
}

export async function reviewApplication(
  applicationId: string,
  action: "accept" | "reject"
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tc = await getTranslations("serverErrors.castings");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const application = await db.castingApplication.findUnique({
    where: { id: applicationId },
    include: {
      casting: {
        include: { scoutProfile: { select: { userId: true } } },
      },
      modelProfile: { select: { userId: true } },
    },
  });

  if (!application || application.casting.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tc("applicationNotFound") };
  }

  const status = action === "accept" ? "ACCEPTED" : "REJECTED";
  const notificationType = action === "accept" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED";

  await db.castingApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  await db.notification.create({
    data: {
      userId: application.modelProfile.userId,
      type: notificationType as any,
      title: action === "accept" ? tc("applicationAccepted") : tc("applicationRejected"),
      body: action === "accept"
              ? tc("applicationAcceptedBody", { title: application.casting.title })
              : tc("applicationRejectedBody", { title: application.casting.title }),
      link: "/model/castings",
    },
  });

  return { success: true };
}

export async function withdrawCastingApplication(
  applicationId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const application = await db.castingApplication.findUnique({
    where: { id: applicationId },
    include: { modelProfile: { select: { userId: true } } },
  });

  if (!application || application.modelProfile.userId !== session.user.id) {
    return { success: false, error: t("notFound") };
  }

  if (application.status !== "PENDING") {
    return { success: false, error: "Cannot withdraw non-pending application" };
  }

  await db.castingApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });

  return { success: true };
}
