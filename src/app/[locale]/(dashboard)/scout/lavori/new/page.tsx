import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/forms/job-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewJobPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.lavoriNew");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="max-w-3xl">
        <JobForm locale={locale} />
      </div>
    </PageContainer>
  );
}
