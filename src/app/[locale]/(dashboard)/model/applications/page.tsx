import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  ApplicationsBrowser,
  type ApplicationItem,
} from "@/components/applications/applications-browser";

export default async function ModelApplicationsPage() {
  const locale = await getLocale();
  const t = await getTranslations("pages.model.applications");
  const session = await auth();

  if (!session?.user || session.user.role !== "MODEL") {
    redirect(`/${locale}/login`);
  }

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!modelProfile) redirect(`/${locale}/model/profile`);

  const [castingApplications, jobApplications] = await Promise.all([
    db.castingApplication.findMany({
      where: { modelProfileId: modelProfile.id },
      include: {
        casting: {
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            deadline: true,
            scoutProfile: {
              select: {
                businessName: true,
                subtype: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.jobApplication.findMany({
      where: { modelProfileId: modelProfile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            deadline: true,
            jobType: true,
            scoutProfile: {
              select: {
                businessName: true,
                subtype: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items: ApplicationItem[] = [
    ...castingApplications.map((app) => ({
      id: app.id,
      type: "casting" as const,
      opportunityId: app.casting.id,
      status: app.status,
      introMessage: app.introMessage,
      createdAtISO: app.createdAt.toISOString(),
      title: app.casting.title,
      scoutName: app.casting.scoutProfile.businessName ?? "Scout",
      city: app.casting.city,
      deadlineISO: app.casting.deadline ? app.casting.deadline.toISOString() : null,
      jobType: null,
    })),
    ...jobApplications.map((app) => ({
      id: app.id,
      type: "job" as const,
      opportunityId: app.job.id,
      status: app.status,
      introMessage: app.introMessage,
      createdAtISO: app.createdAt.toISOString(),
      title: app.job.title,
      scoutName: app.job.scoutProfile.businessName ?? "Scout",
      city: app.job.city,
      deadlineISO: app.job.deadline ? app.job.deadline.toISOString() : null,
      jobType: app.job.jobType,
    })),
  ].sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO));

  return (
    <PageContainer>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ApplicationsBrowser items={items} locale={locale} />
    </PageContainer>
  );
}
