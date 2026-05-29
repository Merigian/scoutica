import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CastingForm } from "@/components/forms/casting-form";

export default async function NewCastingPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.castingsNew");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {t("description")}
        </p>
      </div>
      <CastingForm locale={locale} />
    </div>
  );
}
