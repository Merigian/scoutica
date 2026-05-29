import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/server/actions/messages";
import { MessagingShell } from "@/components/messages/messaging-shell";

export default async function ScoutMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const { chat } = await searchParams;

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const conversations = await getConversations();

  return (
    <MessagingShell
      viewerRole="SCOUT"
      currentUserId={session.user.id}
      conversations={conversations}
      initialConversationId={chat ?? null}
    />
  );
}

