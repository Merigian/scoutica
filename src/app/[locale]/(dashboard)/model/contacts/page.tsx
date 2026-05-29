import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContactRequestList } from "@/components/contacts/contact-request-list";
import { EmptyState } from "@/components/shared/empty-state";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {requests.length > 0 ? (
        <ContactRequestList requests={requests} role="MODEL" locale={locale} />
      ) : (
        <EmptyState
          icon={Mail}
          title={t("noRequests")}
          description={t("noRequestsDesc")}
        />
      )}
    </div>
  );
}
