import { db } from "@/lib/db";
import type { SearchFilters } from "@/types";
import type { Prisma } from "@prisma/client";

export type ModelProfileCard = {
  id: string;
  slug: string;
  fullName: string | null;
  city: string | null;
  region: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  height: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoeSize: number | null;
  dressSize: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  ethnicity: string | null;
  spokenLanguages: string[];
  travelAvailability: boolean;
  categories: string[];
  professionalStatus: string | null;
  completenessScore: number;
  coverImage: string | null;
  images: string[];
  imageCount: number;
  isBoosted: boolean;
  isVerified: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  lastActiveAt: Date | null;
};

export type SearchResult = {
  profiles: ModelProfileCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function searchModelProfiles(
  filters: SearchFilters,
  verifiedScoutUserId?: string
): Promise<SearchResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const skip = (page - 1) * pageSize;

  // Defense in depth: re-verify the caller is actually an APPROVED scout
  // before granting access to VERIFIED_SCOUTS_ONLY profiles.
  let trustedScoutUserId: string | undefined;
  if (verifiedScoutUserId) {
    const scout = await db.scoutProfile.findUnique({
      where: { userId: verifiedScoutUserId },
      select: { verificationStatus: true },
    });
    if (scout?.verificationStatus === "APPROVED") {
      trustedScoutUserId = verifiedScoutUserId;
    }
  }

  const where = buildWhereClause(filters, trustedScoutUserId);

  const [profiles, total] = await Promise.all([
    db.modelProfile.findMany({
      where,
      include: {
        user: { select: { lastActiveAt: true } },
        portfolioImages: {
          orderBy: { order: "asc" as const },
          select: { url: true },
        },
        _count: {
          select: { portfolioImages: true },
        },
        boosts: {
          where: {
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
          take: 1,
          select: { id: true },
        },
      },
      orderBy: buildOrderBy(filters.sortBy),
      skip,
      take: pageSize,
    }),
    db.modelProfile.count({ where }),
  ]);

  const mapped: ModelProfileCard[] = profiles.map((p) => ({
    id: p.id,
    slug: p.slug,
    fullName: p.fullName,
    city: p.city,
    region: p.region,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    height: p.height,
    bust: p.bust,
    waist: p.waist,
    hips: p.hips,
    shoeSize: p.shoeSize,
    dressSize: p.dressSize,
    eyeColor: p.eyeColor,
    hairColor: p.hairColor,
    ethnicity: p.ethnicity,
    spokenLanguages: p.spokenLanguages,
    travelAvailability: p.travelAvailability,
    categories: p.categories,
    professionalStatus: p.professionalStatus,
    completenessScore: p.completenessScore,
    coverImage: p.portfolioImages[0]?.url ?? null,
    images: p.portfolioImages.map((img) => img.url),
    imageCount: p._count.portfolioImages,
    isBoosted: p.boosts.length > 0,
    isVerified: p.verificationStatus === "APPROVED",
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    createdAt: p.createdAt,
    lastActiveAt: p.user.lastActiveAt,
  }));

  // Sort boosted profiles to the top for relevance sort
  if (filters.sortBy === "relevance" || !filters.sortBy) {
    mapped.sort((a, b) => {
      if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
      return b.completenessScore - a.completenessScore;
    });
  }

  return {
    profiles: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

function buildWhereClause(
  filters: SearchFilters,
  scoutUserId?: string
): Prisma.ModelProfileWhereInput {
  const conditions: Prisma.ModelProfileWhereInput[] = [
    { isPublished: true },
    { user: { isSuspended: false } },
  ];

  // Visibility — verified scouts can see everything, unverified can only see PUBLIC
  if (scoutUserId) {
    conditions.push({
      OR: [
        { visibility: "PUBLIC" },
        { visibility: "VERIFIED_SCOUTS_ONLY" },
      ],
    });
  } else {
    conditions.push({ visibility: "PUBLIC" });
  }

  // Block filter — exclude blocked users (both directions)
  if (scoutUserId) {
    conditions.push({
      user: {
        AND: [
          { blocksReceived: { none: { blockerId: scoutUserId } } },
          { blocksGiven: { none: { blockedId: scoutUserId } } },
        ],
      },
    });
  }

  // Text search
  if (filters.query) {
    const q = filters.query.trim();
    conditions.push({
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { region: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  // Location
  if (filters.city) {
    conditions.push({ city: { equals: filters.city, mode: "insensitive" } });
  }
  if (filters.region) {
    conditions.push({ region: { equals: filters.region, mode: "insensitive" } });
  }

  // Demographics
  if (filters.gender) {
    conditions.push({ gender: filters.gender as any });
  }

  // Age range (calculated from dateOfBirth)
  if (filters.ageMin || filters.ageMax) {
    const now = new Date();
    if (filters.ageMax) {
      const minDate = new Date(now.getFullYear() - filters.ageMax - 1, now.getMonth(), now.getDate());
      conditions.push({ dateOfBirth: { gte: minDate } });
    }
    if (filters.ageMin) {
      const maxDate = new Date(now.getFullYear() - filters.ageMin, now.getMonth(), now.getDate());
      conditions.push({ dateOfBirth: { lte: maxDate } });
    }
  }

  // Body measurements
  if (filters.heightMin) conditions.push({ height: { gte: filters.heightMin } });
  if (filters.heightMax) conditions.push({ height: { lte: filters.heightMax } });
  if (filters.bustMin) conditions.push({ bust: { gte: filters.bustMin } });
  if (filters.bustMax) conditions.push({ bust: { lte: filters.bustMax } });
  if (filters.waistMin) conditions.push({ waist: { gte: filters.waistMin } });
  if (filters.waistMax) conditions.push({ waist: { lte: filters.waistMax } });
  if (filters.hipsMin) conditions.push({ hips: { gte: filters.hipsMin } });
  if (filters.hipsMax) conditions.push({ hips: { lte: filters.hipsMax } });

  // Appearance
  if (filters.eyeColor) conditions.push({ eyeColor: filters.eyeColor as any });
  if (filters.hairColor) conditions.push({ hairColor: filters.hairColor as any });
  if (filters.ethnicity) conditions.push({ ethnicity: filters.ethnicity as any });

  // Professional
  if (filters.categories && filters.categories.length > 0) {
    conditions.push({ categories: { hasSome: filters.categories as any[] } });
  }
  if (filters.professionalStatus) {
    conditions.push({ professionalStatus: filters.professionalStatus as any });
  }
  if (filters.travelAvailability) {
    conditions.push({ travelAvailability: true });
  }

  // Social
  if (filters.followerMin) conditions.push({ followerCount: { gte: filters.followerMin } });
  if (filters.followerMax) conditions.push({ followerCount: { lte: filters.followerMax } });

  // Languages
  if (filters.spokenLanguages && filters.spokenLanguages.length > 0) {
    conditions.push({ spokenLanguages: { hasSome: filters.spokenLanguages } });
  }

  // Shoe size
  if (filters.shoeSizeMin) conditions.push({ shoeSize: { gte: filters.shoeSizeMin } });
  if (filters.shoeSizeMax) conditions.push({ shoeSize: { lte: filters.shoeSizeMax } });

  return { AND: conditions };
}

function buildOrderBy(
  sortBy?: string
): Prisma.ModelProfileOrderByWithRelationInput | Prisma.ModelProfileOrderByWithRelationInput[] {
  switch (sortBy) {
    case "recent":
      return { createdAt: "desc" };
    case "completeness":
      return { completenessScore: "desc" };
    case "popular":
      return [{ viewCount: "desc" }, { likeCount: "desc" }, { createdAt: "desc" }];
    case "relevance":
    default:
      return [{ completenessScore: "desc" }, { createdAt: "desc" }];
  }
}

// Get all currently-boosted profiles for the featured carousel
export async function getFeaturedProfiles(): Promise<ModelProfileCard[]> {
  const profiles = await db.modelProfile.findMany({
    where: {
      isPublished: true,
      visibility: "PUBLIC",
      user: { isSuspended: false },
      completenessScore: { gte: 40 },
      portfolioImages: { some: {} },
    },
    include: {
      user: { select: { lastActiveAt: true } },
      portfolioImages: {
        orderBy: { order: "asc" as const },
        select: { url: true },
      },
      _count: {
        select: { portfolioImages: true },
      },
    },
    orderBy: [{ completenessScore: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return profiles.map((p) => ({
    id: p.id,
    slug: p.slug,
    fullName: p.fullName,
    city: p.city,
    region: p.region,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    height: p.height,
    bust: p.bust,
    waist: p.waist,
    hips: p.hips,
    shoeSize: p.shoeSize,
    dressSize: p.dressSize,
    eyeColor: p.eyeColor,
    hairColor: p.hairColor,
    ethnicity: p.ethnicity,
    spokenLanguages: p.spokenLanguages,
    travelAvailability: p.travelAvailability,
    categories: p.categories,
    professionalStatus: p.professionalStatus,
    completenessScore: p.completenessScore,
    coverImage: p.portfolioImages[0]?.url ?? null,
    images: p.portfolioImages.map((img) => img.url),
    imageCount: p._count.portfolioImages,
    isBoosted: false,
    isVerified: p.verificationStatus === "APPROVED",
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    createdAt: p.createdAt,
    lastActiveAt: p.user.lastActiveAt,
  }));
}

// Get the most popular profiles (by views + likes), excluding currently-boosted ones
export async function getPopularProfiles(limit = 10): Promise<ModelProfileCard[]> {
  const now = new Date();

  const profiles = await db.modelProfile.findMany({
    where: {
      isPublished: true,
      visibility: "PUBLIC",
      user: { isSuspended: false },
      // Exclude currently-boosted profiles (they appear in featured section)
      boosts: {
        none: {
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
      },
      // Must have at least some engagement
      OR: [
        { viewCount: { gt: 0 } },
        { likeCount: { gt: 0 } },
      ],
    },
    include: {
      user: { select: { lastActiveAt: true } },
      portfolioImages: {
        orderBy: { order: "asc" as const },
        select: { url: true },
      },
      _count: {
        select: { portfolioImages: true },
      },
    },
    orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return profiles.map((p) => ({
    id: p.id,
    slug: p.slug,
    fullName: p.fullName,
    city: p.city,
    region: p.region,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    height: p.height,
    bust: p.bust,
    waist: p.waist,
    hips: p.hips,
    shoeSize: p.shoeSize,
    dressSize: p.dressSize,
    eyeColor: p.eyeColor,
    hairColor: p.hairColor,
    ethnicity: p.ethnicity,
    spokenLanguages: p.spokenLanguages,
    travelAvailability: p.travelAvailability,
    categories: p.categories,
    professionalStatus: p.professionalStatus,
    completenessScore: p.completenessScore,
    coverImage: p.portfolioImages[0]?.url ?? null,
    images: p.portfolioImages.map((img) => img.url),
    imageCount: p._count.portfolioImages,
    isBoosted: false,
    isVerified: p.verificationStatus === "APPROVED",
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    createdAt: p.createdAt,
    lastActiveAt: p.user.lastActiveAt,
  }));
}

export async function getFavoriteProfiles(userId: string): Promise<ModelProfileCard[]> {
  const likes = await db.profileLike.findMany({
    where: {
      userId,
      modelProfile: {
        isPublished: true,
        user: { isSuspended: false },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      modelProfile: {
        include: {
          user: { select: { lastActiveAt: true } },
          portfolioImages: {
            orderBy: { order: "asc" as const },
            select: { url: true },
          },
          _count: {
            select: { portfolioImages: true },
          },
          boosts: {
            where: {
              startsAt: { lte: new Date() },
              endsAt: { gte: new Date() },
            },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  return likes.map(({ modelProfile: p }) => ({
    id: p.id,
    slug: p.slug,
    fullName: p.fullName,
    city: p.city,
    region: p.region,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    height: p.height,
    bust: p.bust,
    waist: p.waist,
    hips: p.hips,
    shoeSize: p.shoeSize,
    dressSize: p.dressSize,
    eyeColor: p.eyeColor,
    hairColor: p.hairColor,
    ethnicity: p.ethnicity,
    spokenLanguages: p.spokenLanguages,
    travelAvailability: p.travelAvailability,
    categories: p.categories,
    professionalStatus: p.professionalStatus,
    completenessScore: p.completenessScore,
    coverImage: p.portfolioImages[0]?.url ?? null,
    images: p.portfolioImages.map((img) => img.url),
    imageCount: p._count.portfolioImages,
    isBoosted: p.boosts.length > 0,
    isVerified: p.verificationStatus === "APPROVED",
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    createdAt: p.createdAt,
    lastActiveAt: p.user.lastActiveAt,
  }));
}

// Get a model profile by userId for the chat sidebar panel
export async function getModelProfileForChat(userId: string) {
  return db.modelProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
      city: true,
      region: true,
      bio: true,
      height: true,
      bust: true,
      waist: true,
      hips: true,
      shoeSize: true,
      dressSize: true,
      eyeColor: true,
      hairColor: true,
      ethnicity: true,
      categories: true,
      professionalStatus: true,
      spokenLanguages: true,
      travelAvailability: true,
      instagramUrl: true,
      tiktokUrl: true,
      websiteUrl: true,
      followerCount: true,
      portfolioImages: {
        orderBy: { order: "asc" as const },
        select: { id: true, url: true, isCover: true },
      },
    },
  });
}

// Get a single model profile by slug for public view
export async function getModelProfileBySlug(slug: string) {
  return db.modelProfile.findUnique({
    where: { slug, isPublished: true },
    include: {
      user: {
        select: { id: true, name: true, image: true, createdAt: true, lastActiveAt: true },
      },
      portfolioImages: {
        orderBy: { order: "asc" },
      },
      boosts: {
        where: {
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
        take: 1,
      },
    },
  });
}
