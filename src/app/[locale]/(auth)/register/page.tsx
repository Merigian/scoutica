import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Camera, Briefcase, Building2 } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  return (
    <>
      <div className="mb-10">
        <p className="text-eyebrow mb-5">{t("eyebrow")}</p>
        <h1 className="text-h1">{t("title")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">{t("subtitle")}</p>
      </div>

      <div className="space-y-0 hairline-t">
        <p className="text-eyebrow py-5">{t("chooseRole")}</p>

        <Link
          href="/register/model"
          className="block group hairline-t py-6 hover:bg-[var(--bg-soft)] transition-colors px-2 -mx-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-h3">{t("asModel")}</p>
              <p className="mt-2 text-body text-[var(--ink-2)]">{t("asModelDesc")}</p>
            </div>
            <Camera className="h-5 w-5 text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
          </div>
        </Link>

        <Link
          href="/register/scout"
          className="block group hairline-t py-6 hover:bg-[var(--bg-soft)] transition-colors px-2 -mx-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-h3">{t("asScout")}</p>
              <p className="mt-2 text-body text-[var(--ink-2)]">{t("asScoutDesc")}</p>
            </div>
            <Briefcase className="h-5 w-5 text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
          </div>
        </Link>

        <Link
          href="/register/studio"
          className="block group hairline-t hairline-b py-6 hover:bg-[var(--bg-soft)] transition-colors px-2 -mx-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-h3">{t("asStudio")}</p>
              <p className="mt-2 text-body text-[var(--ink-2)]">{t("asStudioDesc")}</p>
            </div>
            <Building2 className="h-5 w-5 text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
          </div>
        </Link>
      </div>

      <p className="mt-10 text-center text-sm text-[var(--ink-3)]">
        {t("hasAccount")}{" "}
        <Link href="/login" className="link-underline text-[var(--ink)]">
          {t("login")}
        </Link>
      </p>
    </>
  );
}
