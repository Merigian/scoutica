import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VerificationForm } from "@/components/forms/verification-form";
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
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="mt-1 text-[var(--ink-3)]">
          {t("description")}
        </p>
      </div>

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
  );
}
