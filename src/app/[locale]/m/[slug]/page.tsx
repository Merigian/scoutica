import { redirect } from "next/navigation";

export default async function ModelShortUrlPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect(`/${locale}/profile/${slug}`);
}
