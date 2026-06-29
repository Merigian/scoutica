import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications } from "@/server/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Bell } from "lucide-react";

export default async function StudioNotificationsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.studio.notifications");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const notifications = await getNotifications();

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      {notifications.length > 0 ? (
        <NotificationList notifications={notifications} locale={locale} />
      ) : (
        <EmptyState
          icon={Bell}
          title={t("noNotifications")}
          description={t("noNotificationsDesc")}
        />
      )}
    </PageContainer>
  );
}
