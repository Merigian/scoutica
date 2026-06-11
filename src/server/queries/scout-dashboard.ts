"use server";

import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/config/plans";
import type { PlanTier } from "@prisma/client";

export async function getScoutDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId },
    select: { id: true, businessName: true, subtype: true, verificationStatus: true, city: true },
  });

  if (!scoutProfile) return null;

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });

  const plan = (subscription?.plan || "FREE") as PlanTier;
  const limits = PLAN_LIMITS[plan];

  const [
    contactsSentThisMonth, contactsSentPrevMonth, contactsPending, contactsAccepted,
    activeCastings, activeJobs, pendingApplications,
    applicationsThisMonth, applicationsPrevMonth,
    shortlistBoards, recentApplications, recentNotifications, totalModelsLiked,
  ] = await Promise.all([
    db.contactRequest.count({ where: { scoutProfileId: scoutProfile.id, createdAt: { gte: startOfMonth } } }),
    db.contactRequest.count({ where: { scoutProfileId: scoutProfile.id, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
    db.contactRequest.count({ where: { scoutProfileId: scoutProfile.id, status: "PENDING" } }),
    db.contactRequest.count({ where: { scoutProfileId: scoutProfile.id, status: "ACCEPTED" } }),
    db.casting.count({ where: { scoutProfileId: scoutProfile.id, status: "PUBLISHED" } }),
    db.job.count({ where: { scoutProfileId: scoutProfile.id, status: "PUBLISHED" } }),
    Promise.all([
      db.castingApplication.count({ where: { casting: { scoutProfileId: scoutProfile.id }, status: "PENDING" } }),
      db.jobApplication.count({ where: { job: { scoutProfileId: scoutProfile.id }, status: "PENDING" } }),
    ]).then(([c, j]) => c + j),
    Promise.all([
      db.castingApplication.count({ where: { casting: { scoutProfileId: scoutProfile.id }, createdAt: { gte: startOfMonth } } }),
      db.jobApplication.count({ where: { job: { scoutProfileId: scoutProfile.id }, createdAt: { gte: startOfMonth } } }),
    ]).then(([c, j]) => c + j),
    Promise.all([
      db.castingApplication.count({ where: { casting: { scoutProfileId: scoutProfile.id }, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
      db.jobApplication.count({ where: { job: { scoutProfileId: scoutProfile.id }, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } } }),
    ]).then(([c, j]) => c + j),
    db.shortlistBoard.count({ where: { scoutProfileId: scoutProfile.id } }),
    db.castingApplication.findMany({
      where: { casting: { scoutProfileId: scoutProfile.id } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, status: true, createdAt: true, introMessage: true,
        modelProfile: {
          select: {
            fullName: true, slug: true, city: true,
            portfolioImages: { where: { isCover: true }, select: { url: true }, take: 1 },
          },
        },
        casting: { select: { title: true, id: true } },
      },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, type: true, title: true, body: true, link: true, isRead: true, createdAt: true },
    }),
    db.profileLike.count({ where: { userId } }),
  ]);

  return {
    profile: scoutProfile,
    plan,
    limits,
    metrics: {
      contactsSentThisMonth,
      contactsSentPrevMonth,
      contactsRemaining: Math.max(0, limits.contactRequestsPerMonth - contactsSentThisMonth),
      contactsPending, contactsAccepted, activeCastings, activeJobs,
      pendingApplications, applicationsThisMonth, applicationsPrevMonth,
      shortlistBoards, totalModelsLiked,
    },
    recentApplications,
    recentNotifications,
  };
}
