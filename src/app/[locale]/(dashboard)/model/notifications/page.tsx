import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications } from "@/server/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";

export default async function ModelNotificationsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.notifications");

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
      </div>

      {notifications.length > 0 ? (
        <NotificationList notifications={notifications} locale={locale} />
      ) : (
        <EmptyState
          icon={Bell}
          title={t("noNotifications")}
          description={t("noNotificationsDesc")}
        />
      )}
    </div>
  );
}
