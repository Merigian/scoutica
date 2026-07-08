import type { ReactNode } from "react";

/**
 * Thumb-zone action bar (§4.6 of the mobile overhaul): pins the primary CTA
 * of a detail screen just above the tab bar, behind a hairline on blurred
 * `--bg`. Mobile-only; desktop keeps its inline actions. Pages rendering it
 * should add bottom padding (e.g. `pb-24 lg:pb-0`) so content clears the bar.
 */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 z-30 hairline-t bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-sm lg:hidden"
      style={{ bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}
