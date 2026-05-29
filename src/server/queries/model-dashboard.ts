"use server";

import { db } from "@/lib/db";

export async function getModelDashboardData(userId: string) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const profile = await db.modelProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
      fullName: true,
      city: true,
      region: true,
      status: true,
      isPublished: true,
      completenessScore: true,
      viewCount: true,
      likeCount: true,
      categories: true,
      portfolioImages: {
        where: { isCover: true },
        select: { url: true },
        take: 1,
      },
      _count: {
        select: { portfolioImages: true },
      },
    },
  });

  if (!profile) return null;

  // Parallel data fetching
  const [
    viewsThisWeek,
    viewsLastWeek,
    pendingContacts,
    activeApplications,
    recentNotifications,
    recommendedCastings,
    recommendedJobs,
  ] = await Promise.all([
    // Views this week
    db.profileView.count({
      where: { modelProfileId: profile.id, createdAt: { gte: oneWeekAgo } },
    }),
    // Views last week (for trend)
    db.profileView.count({
      where: {
        modelProfileId: profile.id,
        createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
      },
    }),
    // Pending contact requests
    db.contactRequest.count({
      where: { modelProfileId: profile.id, status: "PENDING" },
    }),
    // Active applications (pending)
    db.castingApplication.count({
      where: { modelProfileId: profile.id, status: "PENDING" },
    }).then(async (castingCount) => {
      const jobCount = await db.jobApplication.count({
        where: { modelProfileId: profile.id, status: "PENDING" },
      });
      return castingCount + jobCount;
    }),
    // Recent notifications (last 10)
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        isRead: true,
        createdAt: true,
      },
    }),
    // Recommended castings (matching city/region + categories, newest first)
    db.casting.findMany({
      where: {
        status: "PUBLISHED",
        deadline: { gte: now },
        OR: [
          ...(profile.city ? [{ city: profile.city }] : []),
          ...(profile.region ? [{ region: profile.region }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        city: true,
        region: true,
        castingDate: true,
        deadline: true,
        compensation: true,
        isPaid: true,
        scoutProfile: {
          select: {
            businessName: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
    // Recommended jobs (matching city/region, newest first)
    db.job.findMany({
      where: {
        status: "PUBLISHED",
        deadline: { gte: now },
        OR: [
          ...(profile.city ? [{ city: profile.city }] : []),
          ...(profile.region ? [{ region: profile.region }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        city: true,
        region: true,
        brand: true,
        jobType: true,
        compensation: true,
        isPaid: true,
        deadline: true,
        scoutProfile: {
          select: {
            businessName: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const viewsTrend = viewsLastWeek > 0
    ? Math.round(((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100)
    : viewsThisWeek > 0 ? 100 : 0;

  return {
    profile: {
      id: profile.id,
      slug: profile.slug,
      fullName: profile.fullName,
      city: profile.city,
      status: profile.status,
      isPublished: profile.isPublished,
      completenessScore: profile.completenessScore,
      coverImage: profile.portfolioImages[0]?.url ?? null,
      photoCount: profile._count.portfolioImages,
    },
    metrics: {
      viewsThisWeek,
      viewsTrend,
      totalSaves: profile.likeCount,
      pendingContacts,
      activeApplications,
    },
    recentActivity: recentNotifications,
    opportunities: [
      ...recommendedCastings.map((c) => ({
        type: "casting" as const,
        id: c.id,
        title: c.title,
        city: c.city,
        region: c.region,
        date: c.castingDate,
        deadline: c.deadline,
        compensation: c.compensation,
        isPaid: c.isPaid,
        postedBy: c.scoutProfile.businessName || c.scoutProfile.user.name || "Scout",
      })),
      ...recommendedJobs.map((j) => ({
        type: "job" as const,
        id: j.id,
        title: j.title,
        city: j.city,
        region: j.region,
        date: null,
        deadline: j.deadline,
        compensation: j.compensation,
        isPaid: j.isPaid,
        postedBy: j.scoutProfile.businessName || j.scoutProfile.user.name || "Scout",
      })),
    ].sort((a, b) => {
      const dateA = a.deadline?.getTime() ?? 0;
      const dateB = b.deadline?.getTime() ?? 0;
      return dateB - dateA;
    }).slice(0, 4),
  };
}
