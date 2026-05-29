import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ArrowLeft } from "lucide-react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.layout");
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen">
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

      {/* Editorial column — full-bleed monochrome */}
      <aside className="relative hidden lg:flex flex-1 hairline-l overflow-hidden bg-[var(--ink)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(26,24,20,0.20) 0%, rgba(26,24,20,0.55) 100%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85')",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-[var(--bg)]">
          <p className="text-meta text-white/80">
            {t("cover.masthead")}
          </p>

          <div className="max-w-md">
            <h2 className="font-[var(--font-display)] font-light text-5xl leading-[1.0] tracking-[-0.015em] text-white">
              {t("cover.headline")}
            </h2>
            <p className="mt-6 text-eyebrow text-white/75">
              {t("cover.attribution")}
            </p>
          </div>

          <p className="text-meta text-white/75">
            {t("cover.cities")}
          </p>
        </div>
      </aside>
    </div>
  );
}
