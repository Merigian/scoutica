import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.admin.settings");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("generalSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--ink-3)]">
            {t("comingSoon")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
