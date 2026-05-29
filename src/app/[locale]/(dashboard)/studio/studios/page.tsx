import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getMyStudios } from "@/server/queries/studios";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Building2 } from "lucide-react";
import { STUDIO_TYPE_LABELS, STUDIO_STATUS_LABELS } from "@/config/enums";
import Image from "next/image";

export default async function StudioListPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.studio.studios");

  if (!session?.user || session.user.role !== "STUDIO") {
    redirect(`/${locale}/login`);
  }

  const studios = await getMyStudios(session.user.id);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      {/* Header */}
      <header className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-eyebrow">Studi</p>
          <h1 className="font-[var(--font-display)] font-light text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ink)]">
            {t("title")}
          </h1>
          <p className="text-lead max-w-[58ch]">{t("description")}</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/studio/studios/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("addStudio")}
          </Link>
        </Button>
      </header>

      {studios.length === 0 ? (
        <div className="hairline-t hairline-b py-20 text-center">
          <Building2 className="mx-auto h-8 w-8 text-[var(--ink-3)]/40" />
          <h3 className="mt-6 font-[var(--font-display)] font-light text-[clamp(1.5rem,2.4vw,2rem)] tracking-[-0.01em] text-[var(--ink)]">
            {t("noStudios")}
          </h3>
          <p className="mt-3 text-lead max-w-[48ch] mx-auto">
            {t("noStudiosDesc")}
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/studio/studios/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("addStudio")}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/studio/studios/${studio.id}` as never}
              className="group block space-y-4"
            >
              <div className="relative aspect-[4/5] bg-[var(--bg-soft)] overflow-hidden">
                {studio.images[0]?.url ? (
                  <Image
                    src={studio.images[0].url}
                    alt={studio.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-10 w-10 text-[var(--ink-3)]/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-eyebrow italic !text-[var(--bg)] bg-[var(--ink)]/70 backdrop-blur-sm px-2 py-1 ${
                      studio.status !== "PUBLISHED" ? "" : ""
                    }`}
                  >
                    {STUDIO_STATUS_LABELS[studio.status][lang]}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-h3 text-[var(--ink)] truncate">
                    {studio.name}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
                <p className="text-eyebrow italic !normal-case">
                  {STUDIO_TYPE_LABELS[studio.studioType][lang]}
                </p>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-meta tabular-nums">
                  {studio.city && <span>{studio.city}</span>}
                  <span>
                    {studio._count.images} {t("photos")}
                  </span>
                  <span>
                    {studio._count.inquiries} {t("inquiriesShort")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
