import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContactRequestList } from "@/components/contacts/contact-request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Send } from "lucide-react";

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
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 space-y-3">
        <p className="text-eyebrow">Contatti</p>
        <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
          {t("title")}
        </h1>
        <p className="text-lead max-w-[58ch]">{t("description")}</p>
      </header>

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
    </div>
  );
}
