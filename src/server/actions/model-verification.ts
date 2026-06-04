"use server";

import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/storage";
import type { ActionResponse } from "@/types";

const TOKEN_TTL_MINUTES = 30;

async function requireAdmin() {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error(t("unauthorized"));
  }
  return session;
}

/**
 * Generate (or refresh) a single-use token that authorizes uploading a
 * verification selfie from another device (QR "continue on phone" flow).
 * The token is stored on the model profile and validated server-side on upload.
 */
export async function requestVerificationToken(): Promise<
  ActionResponse<{ token: string }>
> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });
  if (!profile) return { success: false, error: t("profileNotFound") };

  if (profile.verificationStatus === "APPROVED") {
    return { success: false, error: t("verification.alreadyVerified") };
  }

  const token = randomBytes(24).toString("base64url");
  const expiry = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await db.modelProfile.update({
    where: { id: profile.id },
    data: { verificationToken: token, verificationTokenExpiry: expiry },
  });

  return { success: true, data: { token } };
}

/** Admin: approve a model's verification, then discard the stored selfie. */
export async function approveModelVerification(
  modelProfileId: string
): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  const profile = await db.modelProfile.findUnique({
    where: { id: modelProfileId },
    select: { userId: true, selfieKey: true },
  });
  if (!profile) return { success: false, error: ta("notFound") };

  if (profile.selfieKey) {
    await deleteObject(profile.selfieKey).catch(() => {});
  }

  await db.modelProfile.update({
    where: { id: modelProfileId },
    data: {
      verificationStatus: "APPROVED",
      verifiedAt: new Date(),
      verificationNotes: null,
      selfieUrl: null,
      selfieKey: null,
    },
  });

  await db.notification.create({
    data: {
      userId: profile.userId,
      type: "VERIFICATION_APPROVED",
      title: ta("verificationApproved"),
      body: ta("accountVerified"),
      link: "/model/verification",
    },
  });

  return { success: true };
}

/** Admin: reject a model's verification with a reason, then discard the selfie. */
export async function rejectModelVerification(
  modelProfileId: string,
  notes: string
): Promise<ActionResponse> {
  const ta = await getTranslations("serverErrors.admin");
  await requireAdmin();

  const profile = await db.modelProfile.findUnique({
    where: { id: modelProfileId },
    select: { userId: true, selfieKey: true },
  });
  if (!profile) return { success: false, error: ta("notFound") };

  if (profile.selfieKey) {
    await deleteObject(profile.selfieKey).catch(() => {});
  }

  await db.modelProfile.update({
    where: { id: modelProfileId },
    data: {
      verificationStatus: "REJECTED",
      verificationNotes: notes,
      selfieUrl: null,
      selfieKey: null,
    },
  });

  await db.notification.create({
    data: {
      userId: profile.userId,
      type: "VERIFICATION_REJECTED",
      title: ta("verificationRejected"),
      body: notes || ta("verificationRejectedNotif"),
      link: "/model/verification",
    },
  });

  return { success: true };
}
