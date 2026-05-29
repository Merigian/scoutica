import { getTranslations } from "next-intl/server";

type PrincipleItem = { n: string; k: string; d: string };

export default async function AboutPage() {
  const t = await getTranslations("about");

  const values = [
    { key: "safety", title: t("safety"), desc: t("safetyDesc") },
    { key: "professionalism", title: t("professionalism"), desc: t("professionalismDesc") },
    { key: "quality", title: t("quality"), desc: t("qualityDesc") },
    { key: "italyFirst", title: t("italyFirst"), desc: t("italyFirstDesc") },
  ];

  const principles = (t.raw("principles.items") as PrincipleItem[]) ?? [];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* ─── Masthead ─── */}
      <header className="py-20 lg:py-32 hairline-b">
        <p className="text-eyebrow mb-6">{t("eyebrow")}</p>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <h1 className="lg:col-span-8 text-display max-w-[14ch]">{t("title")}</h1>
          <p className="lg:col-span-4 text-lead">{t("lead")}</p>
        </div>
      </header>

      {/* ─── 01 — Manifesto ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <p className="lg:col-span-4 text-eyebrow lg:sticky lg:top-28 self-start">
            01 — Manifesto
          </p>
          <div className="lg:col-span-8">
            <p
              className="text-h2 max-w-3xl text-[var(--ink)]"
              dangerouslySetInnerHTML={{ __html: t.raw("intro1") as string }}
            />
            <p className="mt-8 text-body text-[var(--ink-2)] max-w-3xl text-[1.0625rem] leading-[1.7]">
              {t("intro2")}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 02 — Perché adesso ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <p className="lg:col-span-4 text-eyebrow lg:sticky lg:top-28 self-start">
            {t("whyNow.eyebrow")}
          </p>
          <div className="lg:col-span-8">
            <h2 className="text-h1 max-w-3xl">{t("whyNow.title")}</h2>
            <p className="mt-8 text-body text-[var(--ink-2)] max-w-3xl text-[1.0625rem] leading-[1.7]">
              {t("whyNow.body")}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 03 — Valori ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="mb-14 grid lg:grid-cols-12 gap-10">
          <p className="lg:col-span-4 text-eyebrow">03 — {t("valuesTitle")}</p>
          <h2 className="lg:col-span-8 text-h1 max-w-2xl">{t("valuesTitle")}</h2>
        </div>
        <div className="grid md:grid-cols-2 hairline-t">
          {values.map((v, i) => (
            <article
              key={v.key}
              className={`p-10 lg:p-12 hairline-b ${i % 2 === 0 ? "md:hairline-r" : ""}`}
            >
              <p className="text-eyebrow text-[var(--ink-3)] mb-6">
                {String(i + 1).padStart(2, "0")} / {String(values.length).padStart(2, "0")}
              </p>
              <h3 className="font-[var(--font-display)] text-2xl lg:text-[28px] leading-tight tracking-tight mb-5 text-[var(--ink)]">
                {v.title}
              </h3>
              <p className="text-body text-[var(--ink-2)] max-w-md">{v.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── 04 — Principi ─── */}
      <section className="py-20 lg:py-28 hairline-b">
        <div className="mb-14 grid lg:grid-cols-12 gap-10">
          <p className="lg:col-span-4 text-eyebrow">{t("principles.eyebrow")}</p>
          <h2 className="lg:col-span-8 text-h1 max-w-2xl">{t("principles.title")}</h2>
        </div>
        <ol className="hairline-t">
          {principles.map((p) => (
            <li
              key={p.n}
              className="grid grid-cols-12 gap-6 lg:gap-10 py-8 lg:py-10 hairline-b items-start"
            >
              <span className="col-span-2 lg:col-span-1 text-eyebrow text-[var(--ink-3)] pt-1 tabular-nums">
                {p.n}
              </span>
              <h3 className="col-span-10 lg:col-span-4 font-[var(--font-display)] text-xl lg:text-2xl leading-tight tracking-tight text-[var(--ink)]">
                {p.k}
              </h3>
              <p className="col-span-12 lg:col-span-7 text-body text-[var(--ink-2)] max-w-xl">
                {p.d}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Made in Milano ─── */}
      <footer className="py-16 lg:py-20 text-center">
        <p className="font-[var(--font-display)] text-2xl lg:text-[28px] leading-tight tracking-tight text-[var(--ink)]">
          {t("madeIn.line1")}
        </p>
        <p className="mt-3 text-eyebrow text-[var(--ink-3)]">{t("madeIn.line2")}</p>
      </footer>
    </div>
  );
}
