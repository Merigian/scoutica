import { getTranslations } from "next-intl/server";
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { StudioVerificationSubmit } from "./studio-verification-submit";

/**
 * Shown across the studio dashboard while the owner's account is not yet
 * APPROVED. Studio spaces can be created and published, but stay hidden from
 * the public listing until an admin approves the profile.
 */
export async function StudioVerificationBanner({
  status,
  notes,
}: {
  status: string;
  notes: string | null;
}) {
  const t = await getTranslations("components.studioVerificationBanner");

  const submitted = status === "VERIFICATION_SUBMITTED";
  const rejected = status === "REJECTED";

  const Icon = rejected ? ShieldAlert : submitted ? Clock : ShieldCheck;
  const title = rejected
    ? t("rejectedTitle")
    : submitted
      ? t("submittedTitle")
      : t("pendingTitle");
  const description = rejected
    ? notes || t("rejectedDescription")
    : submitted
      ? t("submittedDescription")
      : t("pendingDescription");

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[var(--rule-strong)] bg-[var(--bg-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
          <p className="text-sm text-[var(--ink-3)]">{description}</p>
        </div>
      </div>
      {!submitted && <StudioVerificationSubmit label={t("cta")} />}
    </div>
  );
}
