import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReportForm } from "@/components/shared/report-form";

export default async function NewReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    const { locale } = await params;
    redirect(`/${locale}/login`);
  }

  const { user } = await searchParams;
  const { locale } = await params;

  if (!user || typeof user !== "string") {
    redirect(`/${locale}/messages`);
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <ReportForm targetUserId={user} locale={locale} />
    </div>
  );
}
