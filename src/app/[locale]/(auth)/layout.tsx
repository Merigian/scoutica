import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ArrowLeft } from "lucide-react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.layout");
  const tl = await getTranslations("landing");
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Form column */}
      <div className="flex flex-1 flex-col px-6 py-8 lg:flex-none lg:px-16 xl:px-24 lg:w-[44rem]">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Scoutica" className="flex items-center gap-2.5 text-[var(--ink)]">
            <LogoMark size="sm" />
            <ScouticaWordmark size="sm" />
          </Link>
          <Link
            href="/"
            className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("home")}
          </Link>
        </header>

        <main id="main" className="flex-1 flex flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>

        <footer>
          <p className="text-eyebrow text-[var(--ink-3)]">
            {t("copyright", { year })}
          </p>
        </footer>
      </div>

      {/* Editorial column — full-bleed cinematic cover */}
      <aside className="relative hidden flex-1 overflow-hidden bg-[#0A0A0B] hairline-l lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/auth-cover.webp')",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/45"
        />
        <div className="relative z-10 flex w-full flex-col justify-between p-14 xl:p-16">
          <p className="font-label text-[11px] uppercase tracking-[0.28em] text-white/70">
            {tl("cover.masthead")}
          </p>
          <h2 className="max-w-[15ch] font-display text-[clamp(2.25rem,3.4vw,3.75rem)] font-light leading-[1.0] tracking-[-0.02em] text-white">
            {tl("verification.title")}
          </h2>
          <p className="font-label text-[11px] uppercase tracking-[0.22em] text-white/60">
            Milano · Roma · Firenze
          </p>
        </div>
      </aside>
    </div>
  );
}
