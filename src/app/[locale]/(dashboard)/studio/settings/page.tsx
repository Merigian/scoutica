import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
      </div>
      <SettingsForm
        user={{ name: user.name ?? "", email: user.email, locale: user.locale, image: user.image }}
        locale={locale}
      />
    </div>
  );
}
