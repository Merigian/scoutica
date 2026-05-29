import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-3xl">
          <p className="text-eyebrow mb-10">Error · 404 · Not Found</p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(7rem,18vw,16rem)] leading-[0.85] tracking-[-0.04em] tabular-nums text-[var(--ink)]">
            404
          </h1>
          <p className="mt-10 text-h2 max-w-xl">{t("title")}</p>
          <p className="mt-6 max-w-md text-body text-[var(--ink-2)]">
            {t("description")}
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button variant="default" size="lg" asChild>
              <Link href="/">{t("backHome")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/studios">Browse Studios</Link>
            </Button>
          </div>
        </div>
      </div>
      <footer className="hairline-t px-6 py-6 flex items-center justify-center gap-3">
        <LogoMark size="xs" className="text-[var(--ink-3)]" />
        <span className="text-eyebrow text-[var(--ink-3)]">Scoutica · Milano</span>
      </footer>
    </div>
  );
}
