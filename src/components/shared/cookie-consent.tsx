"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 hairline-t bg-[var(--bg)] px-6 py-5 animate-fade-in">
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
