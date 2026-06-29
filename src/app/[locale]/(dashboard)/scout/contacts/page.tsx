import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContactRequestList } from "@/components/contacts/contact-request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Send } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function ScoutContactsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.contacts");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!scoutProfile) redirect(`/${locale}/scout/profile`);

  const requests = await db.contactRequest.findMany({
    where: { scoutProfileId: scoutProfile.id },
    include: {
      modelProfile: {
        include: {
          user: { select: { name: true, image: true } },
          portfolioImages: {
            where: { isCover: true },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Contatti"
        title={t("title")}
        description={t("description")}
      />

      {requests.length > 0 ? (
        <ContactRequestList requests={requests} role="SCOUT" locale={locale} />
      ) : (
        <EmptyState
          icon={Send}
          title={t("noRequests")}
          description={t("noRequestsDesc")}
          actionLabel={t("discoverTalent")}
          actionHref={`/${locale}/scout/discover`}
        />
      )}
    </PageContainer>
  );
}
