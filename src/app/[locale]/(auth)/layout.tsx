import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ScouticaWordmark } from "@/components/ui/wordmark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ArrowLeft } from "lucide-react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.layout");
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

      {/* Editorial column — full-bleed monochrome */}
      <aside className="relative hidden lg:flex flex-1 hairline-l overflow-hidden bg-[var(--bg-soft)]">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url('/images/auth-cover.webp')",
          }}
        />
        <div className="relative z-10 flex w-full items-end justify-center px-12 pt-12 pb-0">
          <LogoMark
            width={240}
            className="text-white"
            style={{ filter: "drop-shadow(0 2px 14px rgba(10,10,11,0.6))" }}
          />
        </div>
      </aside>
    </div>
  );
}
