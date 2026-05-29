"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { LogoMark } from "@/components/ui/logo-mark";
import { useState } from "react";
import { NAV_ITEMS } from "@/config/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const router = useRouter();
  const navPathname = usePathname();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = session?.user?.role?.toLowerCase() as "model" | "scout" | "studio" | "admin" | undefined;
  const navItems = role ? NAV_ITEMS[role] || [] : [];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login" as never);
  };

  const toggleLocale = () => {
    const next = locale === "it" ? "en" : "it";
    router.replace(navPathname as never, { locale: next } as never);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 hairline-b bg-[var(--bg)]/95 backdrop-blur-sm px-4 lg:px-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-[var(--bg-soft)] transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href={"/dashboard" as never} className="lg:hidden flex items-center gap-2 text-[var(--ink)]" aria-label="Scoutica">
          <LogoMark size="sm" />
          <ScouticaWordmark size="sm" />
        </Link>

        <div className="flex-1" />

        {session?.user && (
          <div className="flex items-center gap-1">
            <ThemeToggle className="p-2 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors" />
            <button
              onClick={toggleLocale}
              className="px-3 py-2 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] transition-colors"
              title={t("switchToOtherLang")}
            >
              {t("otherLangCode")}
            </button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${role}/notifications` as never}>
                <Bell className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            <button
              onClick={handleSignOut}
              className="lg:hidden flex items-center gap-2 p-2 text-sm text-[var(--ink-3)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-[var(--bg)] lg:hidden animate-fade-in">
          <nav className="p-6">
            <ul className="space-y-0 hairline-t">
              {navItems.map((item) => {
                const isActive = navPathname.includes(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href as never}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 text-base font-medium transition-colors hairline-b",
                        isActive
                          ? "text-[var(--ink)] border-l-2 border-[var(--ink)] bg-[var(--bg-soft)]"
                          : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(item.key as never)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
