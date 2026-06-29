"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

/**
 * Mobile-only sticky CTA bar. Slides up once the hero is scrolled past, so the
 * primary action is always one tap away on phones (most of our traffic).
 * Hidden on md+ ; uses the ink button so it reads in both light and dark.
 */
export function StickyCta() {
  const t = useTranslations("landing");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="bg-[var(--bg)]/95 p-3 backdrop-blur-md hairline-t">
        <Link
          href="/register"
          className="group flex items-center justify-center gap-2 bg-[var(--ink)] px-6 py-4 font-label text-[12px] uppercase tracking-[0.16em] text-[var(--bg)]"
        >
          {t("cta.button")}
          <ArrowUpRight className="h-4 w-4 group-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
