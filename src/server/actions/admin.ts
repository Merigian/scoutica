"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import type { ActionResponse } from "@/types";

async function requireAdmin() {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error(t("unauthorized"));
  }
  return session;
}

export async function approveVerification(scoutProfileId: string): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  await db.scoutProfile.update({
    where: { id: scoutProfileId },
    data: {
      verificationStatus: "APPROVED",
      verifiedAt: new Date(),
    },
  });

  // Notify the scout
  const profile = await db.scoutProfile.findUnique({
    where: { id: scoutProfileId },
    select: { userId: true },
  });

  if (profile) {
    await db.notification.create({
      data: {
        userId: profile.userId,
        type: "VERIFICATION_APPROVED",
        title: ta("verificationApproved"),
        body: ta("accountVerified"),
        link: "/scout/profile",
      },
    });
  }

  return { success: true };
}

export async function rejectVerification(
  scoutProfileId: string,
  notes: string
): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  await db.scoutProfile.update({
    where: { id: scoutProfileId },
    data: {
      verificationStatus: "REJECTED",
      verificationNotes: notes,
    },
  });

  const profile = await db.scoutProfile.findUnique({
    where: { id: scoutProfileId },
    select: { userId: true },
  });

  if (profile) {
    await db.notification.create({
      data: {
        userId: profile.userId,
        type: "VERIFICATION_REJECTED",
        title: ta("verificationRejected"),
        body: notes || ta("verificationRejectedNotif"),
        link: "/scout/verification",
      },
    });
  }

  return { success: true };
}

export async function approveStudioVerification(
  studioProfileId: string
): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  await db.studioProfile.update({
    where: { id: studioProfileId },
    data: {
      verificationStatus: "APPROVED",
      verifiedAt: new Date(),
      verificationNotes: null,
    },
  });

  const profile = await db.studioProfile.findUnique({
    where: { id: studioProfileId },
    select: { userId: true },
  });

  if (profile) {
    await db.notification.create({
      data: {
        userId: profile.userId,
        type: "VERIFICATION_APPROVED",
        title: ta("verificationApproved"),
        body: ta("accountVerified"),
        link: "/studio/studios",
      },
    });
  }

  return { success: true };
}

export async function rejectStudioVerification(
  studioProfileId: string,
  notes: string
): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  await db.studioProfile.update({
    where: { id: studioProfileId },
    data: {
      verificationStatus: "REJECTED",
      verificationNotes: notes,
    },
  });

  const profile = await db.studioProfile.findUnique({
    where: { id: studioProfileId },
    select: { userId: true },
  });

  if (profile) {
    await db.notification.create({
      data: {
        userId: profile.userId,
        type: "VERIFICATION_REJECTED",
        title: ta("verificationRejected"),
        body: notes || ta("verificationRejectedNotif"),
        link: "/studio/settings",
      },
    });
  }

  return { success: true };
}

export async function suspendUser(userId: string, reason: string): Promise<ActionResponse> {
  await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: { isSuspended: true, suspendedReason: reason },
  });

  return { success: true };
}

export async function unsuspendUser(userId: string): Promise<ActionResponse> {
  await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: { isSuspended: false, suspendedReason: null },
  });

  return { success: true };
}

export async function resolveReport(reportId: string, adminNotes: string): Promise<ActionResponse> {
  await requireAdmin();

  await db.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED", adminNotes, resolvedAt: new Date() },
  });

  return { success: true };
}

export async function dismissReport(reportId: string, adminNotes: string): Promise<ActionResponse> {
  await requireAdmin();

  await db.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED", adminNotes, resolvedAt: new Date() },
  });

  return { success: true };
}


