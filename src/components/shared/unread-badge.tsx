"use client";

import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/server/actions/unread-count";

export function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadMessageCount().then(setCount);
    const interval = setInterval(() => {
      getUnreadMessageCount().then(setCount);
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white px-1">
      {count > 9 ? "9+" : count}
    </span>
  );
}
