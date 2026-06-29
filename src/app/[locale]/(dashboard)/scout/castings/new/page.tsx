import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CastingForm } from "@/components/forms/casting-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewCastingPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.castingsNew");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="max-w-3xl">
        <CastingForm locale={locale} />
      </div>
    </PageContainer>
  );
}
