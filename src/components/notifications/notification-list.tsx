"use client";

import { useRouter } from "next/navigation";
import { markNotificationRead, markAllNotificationsRead } from "@/server/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NOTIFICATION_TYPE_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Bell,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Megaphone,
  Zap,
  Shield,
  Info,
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

interface NotificationListProps {
  notifications: NotificationItem[];
  locale: string;
}

const typeIcons: Record<string, typeof Bell> = {
  CONTACT_REQUEST_RECEIVED: Mail,
  CONTACT_REQUEST_ACCEPTED: CheckCircle,
  CONTACT_REQUEST_REJECTED: XCircle,
  NEW_MESSAGE: MessageCircle,
  APPLICATION_SUBMITTED: Megaphone,
  APPLICATION_ACCEPTED: CheckCircle,
  APPLICATION_REJECTED: XCircle,
  VERIFICATION_APPROVED: Shield,
  VERIFICATION_REJECTED: XCircle,
  BOOST_ACTIVATED: Zap,
  BOOST_EXPIRED: Zap,
  SYSTEM: Info,
};

export function NotificationList({ notifications, locale }: NotificationListProps) {
  const router = useRouter();
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.notifications");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id);
    }
    if (notification.link) {
      router.push(`/${locale}${notification.link}`);
    }
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllRead}>
            {t("markAllRead")}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] ?? Bell;
          return (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-[var(--bg-soft)]/50 ${
                !notification.isRead ? "border-[var(--accent)]/30 bg-gold/5" : ""
              }`}
              onClick={() => handleClick(notification)}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className={`mt-0.5 ${!notification.isRead ? "text-gold" : "text-[var(--ink-3)]"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-gold shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--ink-3)] mt-0.5">{notification.body}</p>
                  <span className="text-[10px] text-[var(--ink-3)] mt-1 block">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
