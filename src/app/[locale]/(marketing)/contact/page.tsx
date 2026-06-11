import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default async function ContactPage() {
  const t = await getTranslations("pages.marketing.contact");

  const items: Array<{ eyebrow: string; value: string; href: string | null }> = [
    { eyebrow: t("items.generalEyebrow"), value: "info@scoutica.it", href: "mailto:info@scoutica.it" },
    { eyebrow: t("items.pressEyebrow"), value: "press@scoutica.it", href: "mailto:press@scoutica.it" },
    { eyebrow: t("items.addressEyebrow"), value: t("items.addressValue"), href: null },
    { eyebrow: t("items.socialEyebrow"), value: t("items.socialValue"), href: null },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      <header className="py-20 lg:py-32 hairline-b">
        <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <h1 className="lg:col-span-8 text-display max-w-[12ch]">{t("title")}</h1>
          <p className="lg:col-span-4 text-lead">{t("lead")}</p>
        </div>
      </header>

      <section className="grid lg:grid-cols-12 gap-0 hairline-b">
        <div className="lg:col-span-7 hairline-b lg:border-b-0 lg:border-r lg:border-[var(--rule)]">
          <ul>
            {items.map((it, i) => (
              <li key={i} className="p-8 lg:p-12 hairline-b last:border-b-0 flex gap-8">
                <div>
                  <p className="text-eyebrow mb-3">{it.eyebrow}</p>
                  {it.href ? (
                    <a
                      href={it.href}
                      className="text-h3 link-underline group inline-flex items-baseline gap-2"
                    >
                      {it.value}
                      <ArrowUpRight className="h-4 w-4 group-arrow" />
                    </a>
                  ) : (
                    <p className="text-h3">{it.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 p-10 lg:p-14 bg-[var(--bg-soft)] flex flex-col">
          <p className="text-eyebrow mb-5">{t("cta.eyebrow")}</p>
          <h2 className="text-h2">{t("cta.title")}</h2>
          <p className="mt-6 text-body text-[var(--ink-2)] max-w-md">{t("cta.body")}</p>
          <div className="mt-auto pt-10 flex flex-col gap-3">
            <Button variant="accent" size="lg" asChild>
              <Link href="/register/model">{t("cta.registerModel")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register/scout">{t("cta.registerScout")}</Link>
            </Button>
            <Button variant="ghost" size="lg" className="justify-start group" asChild>
              <Link href="/register/studio">
                {t("cta.registerStudio")}
                <ArrowUpRight className="h-4 w-4 ml-2 group-arrow" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center">
        <p className="text-eyebrow text-[var(--ink-3)]">{t("footnote")}</p>
      </footer>
    </div>
  );
}
