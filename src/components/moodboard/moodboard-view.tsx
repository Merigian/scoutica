import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FileText, ExternalLink, Download } from "lucide-react";
import type { MoodboardItem } from "@/lib/validations/moodboard";

/**
 * Read-only moodboard shown to models on a job/casting detail. Any model can
 * view/download these — no selection or contact required. Images open full-size
 * in a new tab; files (PDF) and links open/download in a new tab.
 */
export async function MoodboardView({ items }: { items: MoodboardItem[] }) {
  if (!items || items.length === 0) return null;
  const t = await getTranslations("components.moodboard");

  return (
    <section className="space-y-3">
      <h2 className="text-eyebrow text-[var(--ink-3)]">{t("viewTitle")}</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => {
          if (item.kind === "IMAGE") {
            return (
              <li
                key={i}
                className="relative aspect-[3/4] overflow-hidden hairline bg-[var(--bg-soft)]"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full w-full"
                >
                  <Image
                    src={item.url}
                    alt={item.name ?? "Moodboard"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </a>
              </li>
            );
          }
          const isFile = item.kind === "FILE";
          return (
            <li key={i} className="hairline bg-[var(--bg-soft)]">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                {...(isFile ? { download: item.name ?? "" } : {})}
                className="flex h-full min-h-[7rem] flex-col items-start justify-between gap-3 p-4 transition-colors hover:bg-[var(--bg)]"
              >
                <div className="flex items-center gap-2">
                  {isFile ? (
                    <FileText className="h-5 w-5 shrink-0 text-[var(--ink-2)]" />
                  ) : (
                    <ExternalLink className="h-5 w-5 shrink-0 text-[var(--ink-2)]" />
                  )}
                  <span className="line-clamp-2 break-all text-sm text-[var(--ink)]">
                    {item.name ?? item.url}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-eyebrow text-[var(--ink-3)]">
                  {isFile ? (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      {t("download")}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("openLink")}
                    </>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
