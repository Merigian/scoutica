import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MessagesRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale, conversationId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = session.user.role.toLowerCase();
  redirect(`/${locale}/${role}/messages/${conversationId}`);
}
