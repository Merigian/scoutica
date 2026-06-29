import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function StudioSettingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.studio.settings");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, locale: true, image: true },
  });

  if (!user) redirect(`/${locale}/login`);

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      <div className="max-w-2xl">
        <SettingsForm
          user={{ name: user.name ?? "", email: user.email, locale: user.locale, image: user.image }}
          locale={locale}
        />
      </div>
    </PageContainer>
  );
}
