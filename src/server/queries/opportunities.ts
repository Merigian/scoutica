import { db } from "@/lib/db";
import { getSavedCastingIds, getSavedJobIds } from "@/server/queries/saved-listings";
import type { JobType, ScoutSubtype } from "@prisma/client";

export type OpportunityKind = "casting" | "job";

export interface Opportunity {
  kind: OpportunityKind;
  id: string;
  title: string;
  description: string;
  scoutName: string;
  subtype: ScoutSubtype | null;
  verified: boolean;
  city: string | null;
  /** ISO date the casting takes place (castings only). */
  startsAtISO: string | null;
  /** Free-text dates (jobs only, e.g. "15-17 maggio"). */
  datesText: string | null;
  /** ISO application deadline. */
  deadlineISO: string | null;
  compensation: string | null;
  isPaid: boolean;
  jobType: JobType | null;
  applicationsCount: number;
  publishedAtISO: string | null;
  applied: boolean;
  saved: boolean;
}

/**
 * Unified feed of open opportunities (published castings + jobs, not past
 * deadline) for a model, annotated with the model's applied/saved state.
 * Single source of truth for both /model/castings and /model/lavori.
 */
export async function getModelOpportunities(userId: string): Promise<Opportunity[]> {
  const modelProfile = await db.modelProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  const now = new Date();
  const openFilter = {
    status: "PUBLISHED" as const,
    OR: [{ deadline: null }, { deadline: { gte: now } }],
  };
  const scoutSelect = {
    select: { businessName: true, subtype: true, verificationStatus: true },
  };

  const [castings, jobs, appliedCasting, appliedJob, savedCastingIds, savedJobIds] =
    await Promise.all([
      db.casting.findMany({
        where: openFilter,
        include: { scoutProfile: scoutSelect, _count: { select: { applications: true } } },
        orderBy: { publishedAt: "desc" },
      }),
      db.job.findMany({
        where: openFilter,
        include: { scoutProfile: scoutSelect, _count: { select: { applications: true } } },
        orderBy: { publishedAt: "desc" },
      }),
      modelProfile
        ? db.castingApplication.findMany({
            where: { modelProfileId: modelProfile.id },
            select: { castingId: true },
          })
        : Promise.resolve([] as { castingId: string }[]),
      modelProfile
        ? db.jobApplication.findMany({
            where: { modelProfileId: modelProfile.id },
            select: { jobId: true },
          })
        : Promise.resolve([] as { jobId: string }[]),
      getSavedCastingIds(userId),
      getSavedJobIds(userId),
    ]);

  const appliedCastingSet = new Set(appliedCasting.map((a) => a.castingId));
  const appliedJobSet = new Set(appliedJob.map((a) => a.jobId));

  const castingItems: Opportunity[] = castings.map((c) => ({
    kind: "casting",
    id: c.id,
    title: c.title,
    description: c.description,
    scoutName: c.scoutProfile.businessName ?? "Scout",
    subtype: c.scoutProfile.subtype ?? null,
    verified: c.scoutProfile.verificationStatus === "APPROVED",
    city: c.city,
    startsAtISO: c.castingDate ? c.castingDate.toISOString() : null,
    datesText: null,
    deadlineISO: c.deadline ? c.deadline.toISOString() : null,
    compensation: c.compensation,
    isPaid: c.isPaid,
    jobType: null,
    applicationsCount: c._count.applications,
    publishedAtISO: c.publishedAt ? c.publishedAt.toISOString() : null,
    applied: appliedCastingSet.has(c.id),
    saved: savedCastingIds.has(c.id),
  }));

  const jobItems: Opportunity[] = jobs.map((j) => ({
    kind: "job",
    id: j.id,
    title: j.title,
    description: j.description,
    scoutName: j.brand ?? j.scoutProfile.businessName ?? "Scout",
    subtype: j.scoutProfile.subtype ?? null,
    verified: j.scoutProfile.verificationStatus === "APPROVED",
    city: j.city,
    startsAtISO: null,
    datesText: j.jobDates ?? null,
    deadlineISO: j.deadline ? j.deadline.toISOString() : null,
    compensation: j.compensation,
    isPaid: j.isPaid,
    jobType: j.jobType,
    applicationsCount: j._count.applications,
    publishedAtISO: j.publishedAt ? j.publishedAt.toISOString() : null,
    applied: appliedJobSet.has(j.id),
    saved: savedJobIds.has(j.id),
  }));

  return [...castingItems, ...jobItems].sort((a, b) =>
    (b.publishedAtISO ?? "").localeCompare(a.publishedAtISO ?? ""),
  );
}
