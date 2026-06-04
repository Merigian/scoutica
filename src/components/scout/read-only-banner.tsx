import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function ReadOnlyBanner() {
  const t = await getTranslations("components.readOnlyBanner");

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[var(--rule-strong)] bg-[var(--bg-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">{t("title")}</p>
          <p className="text-sm text-[var(--ink-3)]">{t("description")}</p>
        </div>
      </div>
      <Link
        href="/scout/verification"
        className="shrink-0 rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
