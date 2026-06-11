import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type FaqItem = { q: string; a: string };
type FaqGroup = { title: string; items: FaqItem[] };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return {
    title: t("title"),
    description: t("lead"),
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faq");

  const groups = (t.raw("groups") as FaqGroup[]) ?? [];
  const safety = (t.raw("safety.items") as string[]) ?? [];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* ─── Masthead ─── */}
      <header className="py-20 lg:py-32 hairline-b">
        <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <h1 className="lg:col-span-8 text-display max-w-[16ch]">
            {t("title")}
          </h1>
          <p className="lg:col-span-4 text-lead">{t("lead")}</p>
        </div>
      </header>

      {/* ─── Safety commitments ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p className="text-eyebrow mb-4">{t("safety.eyebrow")}</p>
            <h2 className="text-h1 max-w-[12ch]">{t("safety.title")}</h2>
          </div>
          <ul className="lg:col-span-8 hairline-t">
            {safety.map((item, i) => (
              <li
                key={i}
                className="py-6 hairline-b flex gap-6 items-start"
              >
                <p className="text-body text-[var(--ink-2)] text-[1.0625rem] leading-[1.7] max-w-2xl">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── FAQ groups ─── */}
      {groups.map((group, gi) => (
        <section key={gi} className="py-20 lg:py-28 hairline-b">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
              <p className="text-eyebrow mb-4">{group.title}</p>
            </div>
            <div className="lg:col-span-8 hairline-t">
              {group.items.map((item, ii) => (
                <details
                  key={ii}
                  className="group py-6 hairline-b"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                    <h3 className="text-h3 text-[var(--ink)] max-w-2xl">
                      {item.q}
                    </h3>
                    <span className="text-[var(--ink-3)] text-2xl leading-none pt-0.5 transition-transform group-open:rotate-45 shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-body text-[var(--ink-2)] text-[1.0625rem] leading-[1.7] max-w-2xl">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ─── Contact CTA ─── */}
      <section className="py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <h2 className="lg:col-span-8 text-h1 max-w-[18ch]">
            {t("contactCta.title")}
          </h2>
          <div className="lg:col-span-4">
            <a
              href="/contact"
              className="link-underline text-lead text-[var(--ink)]"
            >
              {t("contactCta.link")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
