import { getLocale, getTranslations } from "next-intl/server";
import { getPopularProfiles } from "@/server/queries/model-profiles";
import { ModelCard } from "@/components/discover/model-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";

const ROLE_DISCOVER: Record<string, string> = {
  MODEL: "/model/discover",
  SCOUT: "/scout/discover",
  STUDIO: "/scout/discover",
  ADMIN: "/scout/discover",
};

export async function PopularProfiles() {
  const [profiles, locale, t, session] = await Promise.all([
    getPopularProfiles(10),
    getLocale(),
    getTranslations("landing.popular"),
    auth(),
  ]);

  if (profiles.length === 0) return null;

  const ctaHref = session?.user?.role
    ? ROLE_DISCOVER[session.user.role] ?? "/dashboard"
    : "/register";

  return (
    <section className="border-t py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-eyebrow mb-3">{t("label")}</p>
            <h2 className="text-h2">
              {t("title")}
            </h2>
            <p className="mt-3 text-body text-[var(--ink-2)] max-w-xl">
              {t("subtitle")}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-1" asChild>
            <Link href={ctaHref as never}>
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="w-[240px] sm:w-[280px] lg:w-[300px] flex-shrink-0 snap-start"
            >
              <ModelCard profile={profile} locale={locale} />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <Link href={ctaHref as never}>
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
