"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const measure = () => {
      const nav = document.querySelector<HTMLElement>("[data-bottom-nav]");
      // Lift the banner above the mobile bottom nav when present (0 on desktop / pages without it).
      setBottomOffset(nav ? nav.getBoundingClientRect().height : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 hairline-t bg-[var(--bg)] px-6 py-5 animate-fade-in"
      style={{ bottom: bottomOffset }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-body text-[var(--ink-2)] text-center sm:text-left">
          {t("message")}{" "}
          <Link href="/privacy" className="link-underline text-[var(--ink)]">
            {t("learnMore")}
          </Link>
        </p>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            localStorage.setItem("cookie-consent", "true");
            setVisible(false);
          }}
        >
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}
