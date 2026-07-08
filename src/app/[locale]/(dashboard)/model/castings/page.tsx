import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getModelOpportunities } from "@/server/queries/opportunities";
import { OpportunitiesBrowser } from "@/components/opportunities/opportunities-browser";

export default async function ModelOpportunitiesPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.opportunities");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const items = await getModelOpportunities(session.user.id);

  return (
    <PageContainer>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <OpportunitiesBrowser items={items} locale={locale} initialTab="all" />
    </PageContainer>
  );
}
