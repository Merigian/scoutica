"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.generic");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-3xl">
          <p className="text-eyebrow text-[var(--ink-3)] mb-10">
            Error · 500 · Server
          </p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(7rem,18vw,16rem)] leading-[0.85] tracking-[-0.04em] tabular-nums text-[var(--ink)]">
            500
          </h1>
          <p className="mt-10 text-h2 max-w-xl">{t("title")}</p>
          <p className="mt-6 max-w-md text-body text-[var(--ink-2)]">
            {t("description")}
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button variant="default" size="lg" onClick={reset}>
              {t("retry")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              {t("backHome")}
            </Button>
          </div>
        </div>
      </div>
      <footer className="hairline-t px-6 py-6 text-center">
        <span className="text-eyebrow text-[var(--ink-3)]">Scoutica · Milano</span>
      </footer>
    </div>
  );
}
