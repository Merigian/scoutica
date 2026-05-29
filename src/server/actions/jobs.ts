"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { jobSchema, jobApplicationSchema } from "@/lib/validations/job";
import type { ActionResponse } from "@/types";

export async function createJob(data: unknown): Promise<ActionResponse<{ jobId: string }>> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });

  if (!scoutProfile || scoutProfile.verificationStatus !== "APPROVED") {
    return { success: false, error: tj("mustBeVerified") };
  }

  const job = await db.job.create({
    data: {
      scoutProfileId: scoutProfile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      jobType: parsed.data.jobType,
      brand: parsed.data.brand,
      city: parsed.data.city,
      region: parsed.data.region,
      location: parsed.data.location,
      jobDates: parsed.data.jobDates,
      compensation: parsed.data.compensation,
      isPaid: parsed.data.isPaid ?? false,
      modelRequirements: parsed.data.modelRequirements,
      spotsNeeded: parsed.data.spotsNeeded,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      notes: parsed.data.notes,
      status: "DRAFT",
    },
  });

  return { success: true, data: { jobId: job.id } };
}

export async function updateJob(
  jobId: string,
  data: unknown
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!job || job.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tj("notFound") };
  }

  await db.job.update({
    where: { id: jobId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      jobType: parsed.data.jobType,
      brand: parsed.data.brand,
      city: parsed.data.city,
      region: parsed.data.region,
      location: parsed.data.location,
      jobDates: parsed.data.jobDates,
      compensation: parsed.data.compensation,
      isPaid: parsed.data.isPaid ?? false,
      modelRequirements: parsed.data.modelRequirements,
      spotsNeeded: parsed.data.spotsNeeded,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      notes: parsed.data.notes,
    },
  });

  return { success: true };
}

export async function publishJob(jobId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const tm = await getTranslations("serverErrors.modelProfile");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!job || job.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tj("notFound") };
  }

  if (!job.title || !job.description) {
    return { success: false, error: tm("titleDescRequired") };
  }

  await db.job.update({
    where: { id: jobId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  return { success: true };
}

export async function closeJob(jobId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!job || job.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tj("notFound") };
  }

  await db.job.update({
    where: { id: jobId },
    data: { status: "CLOSED" },
  });

  return { success: true };
}

export async function applyToJob(data: unknown): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = jobApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: t("invalidData") };
  }

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isPublished: true },
  });

  if (!modelProfile || !modelProfile.isPublished) {
    return { success: false, error: tj("profileMustBePublished") };
  }

  const job = await db.job.findUnique({
    where: { id: parsed.data.jobId, status: "PUBLISHED" },
    select: { id: true, deadline: true, scoutProfileId: true, title: true },
  });

  if (!job) {
    return { success: false, error: tj("notFoundOrClosed") };
  }

  if (job.deadline && new Date(job.deadline) < new Date()) {
    return { success: false, error: tj("deadlineExpired") };
  }

  const existing = await db.jobApplication.findUnique({
    where: {
      jobId_modelProfileId: {
        jobId: parsed.data.jobId,
        modelProfileId: modelProfile.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: tj("alreadyApplied") };
  }

  await db.jobApplication.create({
    data: {
      jobId: parsed.data.jobId,
      modelProfileId: modelProfile.id,
      introMessage: parsed.data.introMessage,
    },
  });

  // Notify scout
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { id: job.scoutProfileId },
    select: { userId: true },
  });

  if (scoutProfile) {
    await db.notification.create({
      data: {
        userId: scoutProfile.userId,
        type: "JOB_APPLICATION_SUBMITTED",
        title: tj("newApplicationTitle"),
        body: tj("newApplicationBody", { title: job.title }),
        link: `/scout/lavori/${job.id}/applications`,
      },
    });
  }

  return { success: true };
}

export async function reviewJobApplication(
  applicationId: string,
  action: "accept" | "reject"
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const tj = await getTranslations("serverErrors.jobs");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: { scoutProfile: { select: { userId: true } } },
      },
      modelProfile: { select: { userId: true } },
    },
  });

  if (!application || application.job.scoutProfile.userId !== session.user.id) {
    return { success: false, error: tj("applicationNotFound") };
  }

  const status = action === "accept" ? "ACCEPTED" : "REJECTED";
  const notificationType = action === "accept" ? "JOB_APPLICATION_ACCEPTED" : "JOB_APPLICATION_REJECTED";

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  await db.notification.create({
    data: {
      userId: application.modelProfile.userId,
      type: notificationType as any,
      title: action === "accept" ? tj("applicationAccepted") : tj("applicationRejected"),
      body: action === "accept"
              ? tj("applicationAcceptedBody", { title: application.job.title })
              : tj("applicationRejectedBody", { title: application.job.title }),
      link: "/model/lavori",
    },
  });

  return { success: true };
}

export async function withdrawJobApplication(
  applicationId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return { success: false, error: t("unauthorized") };
  }

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: { modelProfile: { select: { userId: true } } },
  });

  if (!application || application.modelProfile.userId !== session.user.id) {
    return { success: false, error: t("notFound") };
  }

  if (application.status !== "PENDING") {
    return { success: false, error: "Cannot withdraw non-pending application" };
  }

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });

  return { success: true };
}
