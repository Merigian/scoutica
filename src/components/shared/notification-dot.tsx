"use client";

import { useEffect, useState } from "react";
import { getUnreadCount } from "@/server/actions/notifications";

/**
 * Small ink dot overlaying the header notification bell while there are
 * unread notifications. Polls like `UnreadBadge` (messages) does.
 */
export function NotificationDot() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let active = true;
    const poll = () =>
      getUnreadCount()
        .then((n) => {
          if (active) setHasUnread(n > 0);
        })
        .catch(() => {});
    poll();
    const interval = setInterval(poll, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!hasUnread) return null;

  return (
    <span
      aria-hidden
      className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--ink)]"
    />
  );
}
