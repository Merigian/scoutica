import { db } from "@/lib/db";
import type { CastingStatus, JobStatus, JobType } from "@prisma/client";

export type SavedCastingItem = {
  kind: "casting";
  savedId: string;
  savedAt: Date;
  id: string;
  title: string;
  description: string;
  city: string | null;
  region: string | null;
  deadline: Date | null;
  castingDate: Date | null;
  compensation: string | null;
  isPaid: boolean;
  spots: number | null;
  status: CastingStatus;
  publishedAt: Date | null;
  scoutName: string | null;
  applicantCount: number;
  hasApplied: boolean;
};

export type SavedJobItem = {
  kind: "job";
  savedId: string;
  savedAt: Date;
  id: string;
  title: string;
  description: string;
  jobType: JobType;
  brand: string | null;
  city: string | null;
  region: string | null;
  deadline: Date | null;
  jobDates: string | null;
  compensation: string | null;
  isPaid: boolean;
  status: JobStatus;
  publishedAt: Date | null;
  scoutName: string | null;
  applicantCount: number;
  hasApplied: boolean;
};

export type SavedListingItem = SavedCastingItem | SavedJobItem;

export async function getSavedListings(
  userId: string
): Promise<SavedListingItem[]> {
  const modelProfile = await db.modelProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [saved, appliedCastingIds, appliedJobIds] = await Promise.all([
    db.savedListing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        casting: {
          include: {
            scoutProfile: { select: { businessName: true } },
            _count: { select: { applications: true } },
          },
        },
        job: {
          include: {
            scoutProfile: { select: { businessName: true } },
            _count: { select: { applications: true } },
          },
        },
      },
    }),
    modelProfile
      ? db.castingApplication
          .findMany({
            where: { modelProfileId: modelProfile.id },
            select: { castingId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.castingId)))
      : Promise.resolve(new Set<string>()),
    modelProfile
      ? db.jobApplication
          .findMany({
            where: { modelProfileId: modelProfile.id },
            select: { jobId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.jobId)))
      : Promise.resolve(new Set<string>()),
  ]);

  const items: SavedListingItem[] = [];

  for (const row of saved) {
    if (row.casting) {
      const c = row.casting;
      items.push({
        kind: "casting",
        savedId: row.id,
        savedAt: row.createdAt,
        id: c.id,
        title: c.title,
        description: c.description,
        city: c.city,
        region: c.region,
        deadline: c.deadline,
        castingDate: c.castingDate,
        compensation: c.compensation,
        isPaid: c.isPaid,
        spots: c.spots,
        status: c.status,
        publishedAt: c.publishedAt,
        scoutName: c.scoutProfile.businessName,
        applicantCount: c._count.applications,
        hasApplied: appliedCastingIds.has(c.id),
      });
    } else if (row.job) {
      const j = row.job;
      items.push({
        kind: "job",
        savedId: row.id,
        savedAt: row.createdAt,
        id: j.id,
        title: j.title,
        description: j.description,
        jobType: j.jobType,
        brand: j.brand,
        city: j.city,
        region: j.region,
        deadline: j.deadline,
        jobDates: j.jobDates,
        compensation: j.compensation,
        isPaid: j.isPaid,
        status: j.status,
        publishedAt: j.publishedAt,
        scoutName: j.scoutProfile.businessName,
        applicantCount: j._count.applications,
        hasApplied: appliedJobIds.has(j.id),
      });
    }
  }

  return items;
}

export async function getSavedCastingIds(userId: string): Promise<Set<string>> {
  const rows = await db.savedListing.findMany({
    where: { userId, castingId: { not: null } },
    select: { castingId: true },
  });
  return new Set(rows.map((r) => r.castingId).filter((id): id is string => id !== null));
}

export async function getSavedJobIds(userId: string): Promise<Set<string>> {
  const rows = await db.savedListing.findMany({
    where: { userId, jobId: { not: null } },
    select: { jobId: true },
  });
  return new Set(rows.map((r) => r.jobId).filter((id): id is string => id !== null));
}
