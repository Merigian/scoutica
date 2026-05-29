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

/**
 * Toggle the Scout Gate (open/close access for new talent buyers).
 */
export async function toggleScoutGate(open: boolean): Promise<ActionResponse> {
  await requireAdmin();

  await db.siteSettings.upsert({
    where: { key: "scout_gate_open" },
    create: { key: "scout_gate_open", value: open ? "true" : "false" },
    update: { value: open ? "true" : "false" },
  });

  // If opening the gate, move all WAITLISTED scouts to VERIFICATION_REQUIRED
  if (open) {
    const waitlistedProfiles = await db.scoutProfile.findMany({
      where: { verificationStatus: "WAITLISTED" },
      select: { id: true, userId: true },
    });

    if (waitlistedProfiles.length > 0) {
      await db.scoutProfile.updateMany({
        where: { verificationStatus: "WAITLISTED" },
        data: { verificationStatus: "VERIFICATION_REQUIRED" },
      });

      // Notify all waitlisted scouts
      await db.notification.createMany({
        data: waitlistedProfiles.map((p) => ({
          userId: p.userId,
          type: "SYSTEM" as const,
          title: "Scoutica is now open!",
          body: "You can now complete your verification to access the platform.",
          link: "/scout/verification",
        })),
      });
    }
  }

  return { success: true };
}
