"use client";

import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/model/home",
  SCOUT: "/scout/home",
  STUDIO: "/studio/studios",
  ADMIN: "/admin",
};

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href as never}
      onClick={onClick}
      className="link-underline font-label text-[12px] uppercase tracking-[0.12em] text-current/85 hover:text-current transition-colors"
    >
      {label}
    </Link>
  );
}

export function MarketingNav() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref = session?.user?.role ? ROLE_DASHBOARD[session.user.role] ?? "/dashboard" : null;

  const toggleLocale = () => {
    const next = locale === "it" ? "en" : "it";
    router.replace(pathname as never, { locale: next } as never);
  };

  return (
    <header
      className="nav-shell fixed top-0 z-50 w-full"
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-12 md:grid md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden md:flex items-center gap-8 md:justify-self-start">
          <NavLink href="/pricing" label={t("pricing")} />
          <NavLink href="/about" label={t("about")} />
          <NavLink href="/contact" label={t("contact")} />
          <NavLink href="/studios" label={t("browseStudios")} />
        </nav>

        <Link
          href="/"
          aria-label="Scoutica"
          className={cn("flex items-center gap-3 md:justify-self-center", isHome && "brand-intro")}
        >
          <LogoMark size="lg" className="brand-intro-mark" />
          <ScouticaWordmark size="lg" className="brand-intro-word" />
        </Link>

        <div className="flex items-center gap-1 md:justify-self-end">
          <button
            onClick={toggleLocale}
            className="hidden sm:inline-flex items-center text-[13px] text-current/85 hover:text-current px-3 py-2 transition-colors"
            title={t("switchToOtherLang")}
            aria-label={t("switchToOtherLang")}
          >
            {t("otherLangCode")}
          </button>

          <ThemeToggle className="hidden sm:inline-flex items-center justify-center w-9 h-9 hover:opacity-70 transition-opacity" />

          {dashboardHref ? (
            <Button variant="ghost" size="sm" asChild className="group !text-current">
              <Link href={dashboardHref as never}>
                <LayoutDashboard className="h-4 w-4" />
                {t("dashboard")}
                <ArrowUpRight className="h-3.5 w-3.5 group-arrow" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex !text-current">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/register">{t("register")}</Link>
              </Button>
            </>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 ml-1"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden hairline-top bg-[var(--bg)] text-[var(--ink)] animate-fade-in">
          <nav className="mx-auto max-w-[1440px] px-6 py-8 flex flex-col gap-6">
            <NavLink href="/pricing" label={t("pricing")} onClick={() => setOpen(false)} />
            <NavLink href="/about" label={t("about")} onClick={() => setOpen(false)} />
            <NavLink href="/contact" label={t("contact")} onClick={() => setOpen(false)} />
            <NavLink href="/studios" label={t("browseStudios")} onClick={() => setOpen(false)} />
            {!dashboardHref && (
              <div className="pt-6 hairline-top mt-2 space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>{t("login")}</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>{t("register")}</Link>
                </Button>
              </div>
            )}

            <div className="pt-6 hairline-top mt-2 flex items-center justify-between">
              <button
                onClick={toggleLocale}
                className="inline-flex items-center text-[13px] text-current/85 hover:text-current py-2 transition-colors"
                aria-label={t("switchToOtherLang")}
              >
                {t("otherLangCode")}
              </button>
              <ThemeToggle className="inline-flex items-center justify-center w-9 h-9 hover:opacity-70 transition-opacity" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="hairline-top mt-32 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="py-20 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 sm:gap-4 -ml-1">
              <LogoMark
                className="text-[var(--ink)] shrink-0"
                style={{
                  width: "clamp(44px, 11vw, 110px)",
                  height: "clamp(44px, 11vw, 110px)",
                }}
              />
              <ScouticaWordmark
                className="text-[var(--ink)] max-w-full"
                style={{ fontSize: "clamp(56px, 14vw, 140px)" }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-8 max-w-md text-base text-[var(--ink-3)] leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-10">
            <div>
              <p className="text-eyebrow mb-5">{t("sections.product")}</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/pricing" className="link-underline">{t("pricing")}</Link></li>
                <li><Link href="/studios" className="link-underline">{t("links.studios")}</Link></li>
                <li><Link href="/register" className="link-underline">{t("links.register")}</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-eyebrow mb-5">{t("sections.company")}</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="link-underline">{t("about")}</Link></li>
                <li><Link href="/safety" className="link-underline">{t("faq")}</Link></li>
                <li><Link href="/contact" className="link-underline">{t("contact")}</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-eyebrow mb-5">{t("sections.legal")}</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="link-underline">{t("privacy")}</Link></li>
                <li><Link href="/terms" className="link-underline">{t("terms")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="hairline-top py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[var(--ink-3)]">
          <span>© {year} Scoutica, Milano</span>
          <span>{t("rights")}</span>
        </div>
      </div>
    </footer>
  );
}
