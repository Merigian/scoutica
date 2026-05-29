import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { JobForm } from "@/components/forms/job-form";
import { BackLink } from "@/components/shared/back-link";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.lavoriNew");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const job = await db.job.findUnique({
    where: { id },
    include: { scoutProfile: true },
  });

  if (!job || job.scoutProfile.userId !== session.user.id) {
    redirect(`/${locale}/scout/lavori`);
  }

  const initialData = {
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.jobType,
    brand: job.brand || "",
    city: job.city || "",
    region: job.region || "",
    location: job.location || "",
    jobDates: job.jobDates || "",
    compensation: job.compensation || "",
    isPaid: job.isPaid,
    modelRequirements: job.modelRequirements || "",
    spotsNeeded: job.spotsNeeded || undefined,
    deadline: job.deadline?.toISOString().split("T")[0] || "",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <BackLink href="/scout/lavori" label="← Lavori" />
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("editTitle")}
        </h1>
      </div>
      <JobForm locale={locale} initialData={initialData} />
    </div>
  );
}
