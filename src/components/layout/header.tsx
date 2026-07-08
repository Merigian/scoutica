"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Bell } from "lucide-react";
import { List } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoMark } from "@/components/ui/logo-mark";
import { MobileMenu } from "@/components/layout/mobile-menu";

export function Header({ hideVerification = false }: { hideVerification?: boolean }) {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const router = useRouter();
  const navPathname = usePathname();
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = session?.user?.role?.toLowerCase() as "model" | "scout" | "studio" | "admin" | undefined;

  const toggleLocale = () => {
    const next = locale === "it" ? "en" : "it";
    router.replace(navPathname as never, { locale: next } as never);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 hairline-b bg-[var(--bg)]/95 backdrop-blur-sm px-4 lg:px-6">
        {session?.user && (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("menu")}
            className="lg:hidden -ml-2 flex h-11 w-11 items-center justify-center text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors"
          >
            <List className="h-6 w-6" />
          </button>
        )}

        <Link href={"/dashboard" as never} className="lg:hidden flex h-11 items-center gap-2 text-[var(--ink)]" aria-label="Scoutica">
          <LogoMark size="sm" />
          <ScouticaWordmark size="sm" />
        </Link>

        <div className="flex-1" />

        {session?.user && (
          <div className="flex items-center gap-1">
            <div className="hidden lg:flex items-center gap-1">
              <ThemeToggle className="p-2 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors" />
              <button
                onClick={toggleLocale}
                className="px-3 py-2 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors"
                title={t("switchToOtherLang")}
              >
                {t("otherLangCode")}
              </button>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${role}/notifications` as never} aria-label={t("notifications")}>
                <Bell className="h-[18px] w-[18px]" />
              </Link>
            </Button>
          </div>
        )}
      </header>

      {session?.user && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} hideVerification={hideVerification} />}
    </>
  );
}
