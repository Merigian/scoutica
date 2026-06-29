import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.admin.settings");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

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
    </PageContainer>
  );
}
