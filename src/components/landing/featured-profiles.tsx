import { getLocale, getTranslations } from "next-intl/server";
import { getFeaturedProfiles } from "@/server/queries/model-profiles";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { FeaturedMarquee } from "@/components/landing/featured-marquee";
import { ModelCard } from "@/components/discover/model-card";
import { SectionIndex } from "@/components/landing/section-index";

export async function FeaturedProfiles() {
  const [profiles, locale, t] = await Promise.all([
    getFeaturedProfiles().catch(() => []),
    getLocale(),
    getTranslations("landing.featured"),
  ]);

  if (profiles.length === 0) return null;

  const cast = profiles.slice(0, 12);

  return (
    <section className="hairline-t bg-[var(--bg-soft)] py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-14 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <SectionIndex n="02" className="mb-6">{t("eyebrow")}</SectionIndex>
            <h2 className="text-h1">{t("title")}</h2>
            <p className="mt-6 text-lead max-w-xl">{t("subtitle")}</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:justify-self-end">
            <Button variant="outline" size="lg" asChild>
              <Link href="/register" className="group">
                {t("cta")}
                <ArrowUpRight className="h-4 w-4 group-arrow" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] overflow-hidden">
        <FeaturedMarquee>
          {cast.map((p) => (
            <div
              key={p.id}
              className="w-[260px] sm:w-[300px] lg:w-[340px] shrink-0"
            >
              <ModelCard
                profile={p}
                locale={locale}
                aspectVariant="portrait"
              />
            </div>
          ))}
        </FeaturedMarquee>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mt-14 hairline-t pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-eyebrow">
          <span>{cast.length} {t("selectedLabel")}</span>
          <Link href="/register" className="link-underline">
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
