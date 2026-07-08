import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/landing/reveal";
import { SectionIndex } from "@/components/landing/section-index";
import { searchStudios, type StudioCard } from "@/server/queries/studios";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";

/**
 * Studi — showcase of bookable photo studios. Shows real published studios when
 * available (topped up with an "add yours" invite to keep the 3-up rhythm), and
 * falls back to a single editorial invite band when none are published yet.
 * No fabricated listings.
 */
export async function StudiosShowcase() {
  const t = await getTranslations("landing");
  const { studios } = await searchStudios({ pageSize: 3 }).catch(() => ({
    studios: [] as StudioCard[],
  }));

  const showInvite = studios.length > 0 && studios.length < 3;

  return (
    <section
      id="studi"
      className="scroll-mt-24 hairline-t bg-[var(--bg)] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14 lg:mb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <SectionIndex n="06" className="mb-6">
              {t("studios.eyebrow")}
            </SectionIndex>
            <h2 className="text-display max-w-[16ch]">{t("studios.title")}</h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-6">
            <p className="text-lead">{t("studios.subtitle")}</p>
            <Link
              href={"/studios" as never}
              className="group inline-flex items-center gap-2 text-eyebrow text-[var(--ink)] hover:opacity-70 transition-opacity"
            >
              {t("studios.viewAll")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Reveal>

        {studios.length === 0 ? (
          <Reveal className="hairline flex flex-col items-start gap-6 bg-[var(--bg-elevated)] p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
            <div className="max-w-[44ch]">
              <h3 className="text-h2 text-[var(--ink)]">
                {t("studios.emptyTitle")}
              </h3>
              <p className="mt-4 text-body text-[var(--ink-2)]">
                {t("studios.emptyBody")}
              </p>
            </div>
            <Link
              href={"/register/studio" as never}
              className="group inline-flex shrink-0 items-center gap-2 bg-[var(--ink)] px-6 py-4 text-[15px] font-medium text-[var(--bg-elevated)] transition-opacity hover:opacity-90"
            >
              {t("studios.addCta")}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto overscroll-x-contain select-none md:select-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
            {studios.map((s, i) => (
              <Reveal
                key={s.id}
                delay={i * 90}
                className="flex flex-col min-w-[82vw] sm:min-w-[68vw] md:min-w-0 snap-start"
              >
                <Link
                  href={`/studios/${s.slug}` as never}
                  className="group flex grow flex-col gap-4"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)] hairline">
                    {s.coverImage ? (
                      <Image
                        src={s.coverImage}
                        alt={s.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-safe:group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-h3 text-[var(--ink)]">{s.name}</h3>
                      {s.city ? (
                        <p className="mt-1 text-meta">{s.city}</p>
                      ) : null}
                    </div>
                    {s.hourlyRate ? (
                      <p className="shrink-0 font-display text-[15px] text-[var(--ink-2)] whitespace-nowrap">
                        {t("studios.fromPrice")} €{Math.round(s.hourlyRate)}
                        <span className="text-[var(--ink-3)]">
                          {t("studios.perHour")}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            ))}

            {showInvite ? (
              <Reveal
                delay={studios.length * 90}
                className="flex flex-col min-w-[82vw] sm:min-w-[68vw] md:min-w-0 snap-start"
              >
                <Link
                  href={"/register/studio" as never}
                  className="group flex grow flex-col items-start justify-between gap-8 bg-[var(--bg-elevated)] hairline p-8 lg:p-10 transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-[var(--bg)] motion-safe:hover:-translate-y-1"
                >
                  <Plus
                    className="h-7 w-7 text-[var(--ink)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3 className="inline-flex items-center gap-2 text-h3 text-[var(--ink)]">
                    {t("studios.addCta")}
                    <ArrowUpRight
                      className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </h3>
                </Link>
              </Reveal>
            ) : null}
          </div>
        )}

        {studios.length > 0 ? (
          <div className="mt-12 flex justify-end">
            <Link
              href={"/register/studio" as never}
              className="text-eyebrow italic text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              {t("studios.addPrompt")}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
