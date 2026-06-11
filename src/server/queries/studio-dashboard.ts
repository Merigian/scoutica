import { db } from "@/lib/db";

export async function getStudioDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const studioProfile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true, businessName: true, city: true },
  });

  if (!studioProfile) return null;

  const profileScope = { studio: { studioProfileId: studioProfile.id } };

  const [
    totalStudios,
    publishedStudios,
    pendingInquiries,
    pendingBookings,
    upcomingBookings,
    bookingsThisMonth,
    bookingsPrevMonth,
    inquiriesThisMonth,
    inquiriesPrevMonth,
    recentInquiries,
    recentBookings,
    recentNotifications,
  ] = await Promise.all([
    db.studio.count({ where: { studioProfileId: studioProfile.id } }),
    db.studio.count({
      where: { studioProfileId: studioProfile.id, status: "PUBLISHED", isPublished: true },
    }),
    db.studioInquiry.count({ where: { ...profileScope, status: "PENDING" } }),
    db.studioBooking.count({ where: { ...profileScope, status: "PENDING" } }),
    db.studioBooking.count({
      where: { ...profileScope, status: "CONFIRMED", startDate: { gte: now } },
    }),
    db.studioBooking.count({ where: { ...profileScope, createdAt: { gte: startOfMonth } } }),
    db.studioBooking.count({
      where: { ...profileScope, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } },
    }),
    db.studioInquiry.count({ where: { ...profileScope, createdAt: { gte: startOfMonth } } }),
    db.studioInquiry.count({
      where: { ...profileScope, createdAt: { gte: startOfPrevMonth, lt: startOfMonth } },
    }),
    db.studioInquiry.findMany({
      where: profileScope,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        message: true,
        status: true,
        createdAt: true,
        studio: { select: { name: true, slug: true } },
      },
    }),
    db.studioBooking.findMany({
      where: profileScope,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        studio: { select: { name: true } },
      },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
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
  ]);

  return {
    profile: studioProfile,
    metrics: {
      totalStudios,
      publishedStudios,
      pendingInquiries,
      pendingBookings,
      upcomingBookings,
      bookingsThisMonth,
      bookingsPrevMonth,
      inquiriesThisMonth,
      inquiriesPrevMonth,
    },
    recentInquiries,
    recentBookings,
    recentNotifications,
  };
}
