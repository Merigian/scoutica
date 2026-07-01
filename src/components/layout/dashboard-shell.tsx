"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const PIN_KEY = "scoutica:sidebar-pinned";
const PIN_EVENT = "scoutica:sidebar-pinned-change";

function readPinned(): boolean {
  try {
    return localStorage.getItem(PIN_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PIN_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PIN_EVENT, onChange);
  };
}

/**
 * Coordinates the persistent collapse/pin state between the sidebar and the
 * main content margin. Reading from localStorage via useSyncExternalStore keeps
 * it SSR-safe (server snapshot = collapsed) and syncs across tabs.
 */
export function DashboardShell({
  hideVerification = false,
  completenessScore = null,
  verified = false,
  children,
}: {
  hideVerification?: boolean;
  completenessScore?: number | null;
  verified?: boolean;
  children: React.ReactNode;
}) {
  const pinned = useSyncExternalStore(subscribe, readPinned, () => false);

  const togglePin = () => {
    try {
      localStorage.setItem(PIN_KEY, readPinned() ? "0" : "1");
    } catch {
      /* localStorage unavailable — ignore */
    }
    window.dispatchEvent(new Event(PIN_EVENT));
  };

  return (
    <>
      <Sidebar
        hideVerification={hideVerification}
        completenessScore={completenessScore}
        verified={verified}
        pinned={pinned}
        onTogglePin={togglePin}
      />
      <div
        className={cn(
          "transition-[margin] duration-300 ease-out",
          pinned ? "lg:ml-64" : "lg:ml-[68px]",
        )}
      >
        <Header hideVerification={hideVerification} />
        <main className="p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </>
  );
}
