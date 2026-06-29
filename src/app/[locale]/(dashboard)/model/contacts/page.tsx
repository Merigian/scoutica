import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContactRequestList } from "@/components/contacts/contact-request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Mail } from "lucide-react";

export default async function ModelContactsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.contacts");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const modelProfile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!modelProfile) redirect(`/${locale}/model/profile`);

  const requests = await db.contactRequest.findMany({
    where: { modelProfileId: modelProfile.id },
    include: {
      scoutProfile: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      {requests.length > 0 ? (
        <ContactRequestList requests={requests} role="MODEL" locale={locale} />
      ) : (
        <EmptyState
          icon={Mail}
          title={t("noRequests")}
          description={t("noRequestsDesc")}
        />
      )}
    </PageContainer>
  );
}
