import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VerificationPanel } from "@/components/verification/verification-panel";
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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <p className="text-sm text-[var(--ink-3)] mt-1">{t("description")}</p>
      </div>

      {status === "APPROVED" ? (
        <div className="border border-[var(--rule)] p-6 text-center space-y-3 bg-[var(--bg-soft)]/40">
          <ShieldCheck className="mx-auto h-7 w-7 text-[var(--accent)]" />
          <p className="text-h3 text-[var(--ink)]">{t("approvedTitle")}</p>
          <p className="text-meta text-[var(--ink-3)]">{t("approvedDesc")}</p>
        </div>
      ) : status === "VERIFICATION_SUBMITTED" ? (
        <div className="border border-[var(--rule)] p-6 text-center space-y-3">
          <Clock className="mx-auto h-7 w-7 text-[var(--ink-2)]" />
          <p className="text-h3 text-[var(--ink)]">{t("submittedTitle")}</p>
          <p className="text-meta text-[var(--ink-3)]">{t("submittedDesc")}</p>
        </div>
      ) : (
        <>
          {status === "REJECTED" && (
            <div className="border border-red-200 bg-red-50/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                <span className="text-body font-medium">{t("rejectedTitle")}</span>
              </div>
              {profile.verificationNotes && (
                <p className="text-meta text-red-700/90">{profile.verificationNotes}</p>
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
  );
}
