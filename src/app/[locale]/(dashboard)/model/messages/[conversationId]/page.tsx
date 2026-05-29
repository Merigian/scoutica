import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ModelMessageThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const locale = await getLocale();
  const { conversationId } = await params;

  redirect(`/${locale}/model/messages?chat=${conversationId}`);
}

