"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveVerification, rejectVerification } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface VerificationActionsProps {
  profileId: string;
  locale: string;
}

export function VerificationActions({ profileId, locale }: VerificationActionsProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.verificationActions");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    await approveVerification(profileId);
    setLoading(false);
    router.refresh();
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) return;
    setLoading(true);
    await rejectVerification(profileId, rejectNotes.trim());
    setLoading(false);
    router.refresh();
  };

  if (showRejectForm) {
    return (
      <div className="space-y-2 min-w-[200px]">
        <Textarea
          rows={2}
          placeholder={t("rejectReason")}
          value={rejectNotes}
          onChange={(e) => setRejectNotes(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={loading || !rejectNotes.trim()}>
            {t("confirmReject")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRejectForm(false)}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" onClick={handleApprove} disabled={loading}>
        <Check className="h-4 w-4 mr-1" />
        {t("approve")}
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowRejectForm(true)} disabled={loading}>
        <X className="h-4 w-4 mr-1" />
        {t("reject")}
      </Button>
    </div>
  );
}
