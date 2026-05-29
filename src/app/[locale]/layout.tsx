import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers/providers";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { auth } from "@/lib/auth";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, session] = await Promise.all([
    import(`@/messages/${locale}.json`).then((m) => m.default),
    auth(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers session={session}>
        {children}
        <CookieConsent />
      </Providers>
    </NextIntlClientProvider>
  );
}
