"use client";

import { useSyncExternalStore } from "react";

/** Matches the `lg` app-shell boundary (1024px) — the sidebar/tab-bar switch. */
const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True at/above the `lg` shell boundary. SSR snapshot is `false` (mobile-first);
 * only branch on this for overlays that open after user interaction, never for
 * server-rendered layout (use CSS breakpoints there).
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
