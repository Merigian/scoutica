import { db } from "@/lib/db";
import { eachDayOfInterval } from "date-fns";
import type { StudioType } from "@prisma/client";

export type StudioCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  studioType: string;
  city: string | null;
  region: string | null;
  coverImage: string | null;
  images: string[];
  imageCount: number;
  hourlyRate: number | null;
  dailyRate: number | null;
  amenities: string[];
  latitude: number | null;
  longitude: number | null;
  ownerName: string | null;
};

export type StudioSearchResult = {
  studios: StudioCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

interface StudioFilters {
  page?: number;
  pageSize?: number;
  city?: string;
  region?: string;
  studioType?: StudioType;
  priceMax?: number;
  query?: string;
}

export async function searchStudios(filters: StudioFilters = {}): Promise<StudioSearchResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    isPublished: true,
    status: "PUBLISHED",
  };

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }
  if (filters.region) {
    where.region = { equals: filters.region, mode: "insensitive" };
  }
  if (filters.studioType) {
    where.studioType = filters.studioType;
  }
  if (filters.priceMax) {
    where.OR = [
      { hourlyRate: { lte: filters.priceMax } },
      { dailyRate: { lte: filters.priceMax } },
    ];
  }
  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const [studios, total] = await Promise.all([
    db.studio.findMany({
      where: where as never,
      include: {
        images: {
          orderBy: { order: "asc" as const },
          select: { url: true, isCover: true },
        },
        _count: { select: { images: true } },
        studioProfile: {
          select: { businessName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.studio.count({ where: where as never }),
  ]);

  return {
    studios: studios.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      studioType: s.studioType,
      city: s.city,
      region: s.region,
      coverImage: s.images.find((i) => i.isCover)?.url ?? s.images[0]?.url ?? null,
      images: s.images.map((i) => i.url),
      imageCount: s._count.images,
      hourlyRate: s.hourlyRate,
      dailyRate: s.dailyRate,
      amenities: s.amenities,
      latitude: s.latitude,
      longitude: s.longitude,
      ownerName: s.studioProfile.businessName,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getStudioBySlug(slug: string) {
  return db.studio.findUnique({
    where: { slug, isPublished: true, status: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
      studioProfile: {
        select: {
          businessName: true,
          bio: true,
          city: true,
          websiteUrl: true,
          phoneNumber: true,
        },
      },
    },
  });
}

export async function getMyStudios(userId: string) {
  const profile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  return db.studio.findMany({
    where: { studioProfileId: profile.id },
    include: {
      images: {
        where: { isCover: true },
        take: 1,
        select: { url: true },
      },
      _count: { select: { images: true, inquiries: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudioWithImages(studioId: string, userId: string) {
  const profile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  return db.studio.findFirst({
    where: { id: studioId, studioProfileId: profile.id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getMyInquiries(userId: string) {
  const profile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  return db.studioInquiry.findMany({
    where: {
      studio: { studioProfileId: profile.id },
    },
    include: {
      studio: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudioUnavailableDates(studioId: string) {
  const [blocked, booked] = await Promise.all([
    db.studioBlockedDate.findMany({
      where: { studioId },
      select: { id: true, date: true, reason: true },
    }),
    db.studioBooking.findMany({
      where: {
        studioId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startDate: true, endDate: true, startTime: true, endTime: true },
    }),
  ]);

  const blockedDates = blocked.map((b) => b.date.toISOString());

  // Expand booked ranges into individual dates
  const bookedDates: string[] = [];
  for (const b of booked) {
    const days = eachDayOfInterval({ start: b.startDate, end: b.endDate });
    bookedDates.push(...days.map((d) => d.toISOString()));
  }

  // Extract booked time slots for the time grid
  const bookedTimeSlots = booked
    .filter((b) => b.startTime && b.endTime)
    .map((b) => ({ startTime: b.startTime!, endTime: b.endTime! }));

  return { blockedDates, bookedDates, blockedRecords: blocked, bookedTimeSlots };
}

export async function getMyBookings(userId: string) {
  const profile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  return db.studioBooking.findMany({
    where: { studio: { studioProfileId: profile.id } },
    include: { studio: { select: { name: true, slug: true } } },
    orderBy: { startDate: "desc" },
  });
}

export async function getStudioBlockedDates(studioId: string, userId: string) {
  const profile = await db.studioProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  return db.studioBlockedDate.findMany({
    where: { studioId, studio: { studioProfileId: profile.id } },
    orderBy: { date: "asc" },
  });
}
