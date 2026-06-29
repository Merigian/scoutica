import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VerificationForm } from "@/components/forms/verification-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SCOUT") redirect("/login");
  const t = await getTranslations("pages.scout.verification");

  const profile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });

  if (!profile) redirect("/login");

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="max-w-2xl">
        <VerificationForm
          profile={{
            fullName: profile.user?.name ?? "",
            businessName: profile.businessName ?? "",
            roleTitle: profile.roleTitle,
            city: profile.city ?? "",
            professionalEmail: profile.professionalEmail ?? "",
            websiteUrl: profile.websiteUrl,
            socialProfileUrl: profile.socialProfileUrl,
            vatNumber: profile.vatNumber,
          }}
          status={profile.verificationStatus}
          notes={profile.verificationNotes}
        />
      </div>
    </PageContainer>
  );
}
