import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VerificationPanel } from "@/components/verification/verification-panel";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ShieldCheck, Clock, XCircle } from "lucide-react";

export default async function ModelVerificationPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.model.verification");

  if (!session?.user?.id || session.user.role !== "MODEL") redirect(`/${locale}/login`);

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { verificationStatus: true, verificationNotes: true },
  });

  if (!profile) redirect(`/${locale}/model/home`);

  const status = profile.verificationStatus;

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="max-w-2xl space-y-8">
        {status === "APPROVED" ? (
          <div className="border border-[var(--rule)] p-6 text-center space-y-3 bg-[var(--bg-soft)]/40">
            <ShieldCheck className="mx-auto h-7 w-7 text-[var(--accent)]" />
            <p className="text-h3 text-[var(--ink)]">{t("approvedTitle")}</p>
            <p className="text-meta text-[var(--ink-3)]">{t("approvedDesc")}</p>
          </div>
        ) : status === "VERIFICATION_SUBMITTED" ? (
          <div className="border border-warning/30 bg-warning/5 p-6 text-center space-y-3">
            <Clock className="mx-auto h-7 w-7 text-warning" />
            <p className="text-h3 text-[var(--ink)]">{t("submittedTitle")}</p>
            <p className="text-meta text-[var(--ink-3)]">{t("submittedDesc")}</p>
          </div>
        ) : (
          <>
            {status === "REJECTED" && (
              <div className="border border-[var(--danger)]/40 bg-[var(--danger)]/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[var(--danger)]">
                  <XCircle className="h-4 w-4" />
                  <span className="text-body font-medium">{t("rejectedTitle")}</span>
                </div>
                {profile.verificationNotes && (
                  <p className="text-meta text-[var(--danger)]/90">{profile.verificationNotes}</p>
                )}
              </div>
            )}

            <div className="border border-[var(--rule)] p-3">
              <ol className="text-meta text-[var(--ink-3)] space-y-1 list-decimal list-inside">
                <li>{t("step1")}</li>
                <li>{t("step2")}</li>
                <li>{t("step3")}</li>
              </ol>
            </div>

            <VerificationPanel />

            <p className="text-meta text-[var(--ink-3)]">{t("privacyNote")}</p>
          </>
        )}
      </div>
    </PageContainer>
  );
}
