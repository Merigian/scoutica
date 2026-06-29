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

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dashboardHref = session?.user?.role ? ROLE_DASHBOARD[session.user.role] ?? "/dashboard" : null;

  const toggleLocale = () => {
    const next = locale === "it" ? "en" : "it";
    router.replace(pathname as never, { locale: next } as never);
  };

  return (
    <header
      className="nav-shell fixed top-0 z-50 w-full"
      data-scrolled={scrolled || open ? "true" : "false"}
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
          className={cn("flex items-center gap-2.5 sm:gap-3 md:justify-self-center", isHome && "brand-intro")}
        >
          <LogoMark
            size="lg"
            className="brand-intro-mark"
            style={{ width: "clamp(32px,8.5vw,48px)", height: "clamp(32px,8.5vw,48px)" }}
          />
          <ScouticaWordmark
            size="lg"
            className="brand-intro-word"
            style={{ fontSize: "clamp(21px,5.4vw,32px)" }}
          />
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
            <Button variant="ghost" size="sm" asChild className="group !text-current hidden sm:inline-flex">
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
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2.5 text-current hover:opacity-70 transition-opacity"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40 flex flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)] animate-fade-in">
          <nav className="flex flex-col px-6 pt-4">
            {[
              { href: "/pricing", label: t("pricing") },
              { href: "/about", label: t("about") },
              { href: "/contact", label: t("contact") },
              { href: "/studios", label: t("browseStudios") },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href as never}
                onClick={() => setOpen(false)}
                className="group flex items-baseline justify-between border-b border-[var(--rule)] py-5"
              >
                <span className="font-display font-light text-[clamp(2rem,9vw,2.75rem)] leading-[1.04] tracking-[-0.02em] text-[var(--ink)]">
                  {item.label}
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 self-center text-[var(--ink-3)] transition-colors group-hover:text-[var(--ink)]" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-8">
            {dashboardHref ? (
              <Button className="w-full" size="lg" asChild>
                <Link href={dashboardHref as never} onClick={() => setOpen(false)} className="justify-center">
                  <LayoutDashboard className="h-4 w-4" />
                  {t("dashboard")}
                </Link>
              </Button>
            ) : (
              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/register" onClick={() => setOpen(false)} className="justify-center">
                    {t("register")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link href="/login" onClick={() => setOpen(false)} className="justify-center">
                    {t("login")}
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[var(--rule)] pt-6">
              <button
                onClick={toggleLocale}
                className="-ml-1 inline-flex min-h-[44px] items-center px-1 font-label text-[12px] uppercase tracking-[0.12em] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
                aria-label={t("switchToOtherLang")}
              >
                {t("otherLangCode")}
              </button>
              <ThemeToggle className="inline-flex items-center justify-center h-11 w-11 -mr-2.5 hover:opacity-70 transition-opacity" />
            </div>
          </div>
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
