"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Flag, ArrowLeft } from "lucide-react";
import { reportUser } from "@/server/actions/trust";

const REPORT_REASONS = [
  { value: "HARASSMENT", label: { it: "Molestie", en: "Harassment" } },
  { value: "INAPPROPRIATE_CONTENT", label: { it: "Contenuto inappropriato", en: "Inappropriate content" } },
  { value: "FAKE_PROFILE", label: { it: "Profilo falso", en: "Fake profile" } },
  { value: "SPAM", label: { it: "Spam", en: "Spam" } },
  { value: "OTHER", label: { it: "Altro", en: "Other" } },
];

interface ReportFormProps {
  targetUserId: string;
  locale: string;
}

export function ReportForm({ targetUserId, locale }: ReportFormProps) {
  const t = useTranslations("report");
  const lang = locale === "en" ? "en" : "it";
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    const result = await reportUser(targetUserId, reason, details);
    setLoading(false);
    if (result.success) setDone(true);
  };

  if (done) {
    return (
      <div className="text-center space-y-6 p-8 border rounded">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-7 w-7 text-success" />
        </div>
        <h2 className="text-h2">{t("success")}</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {lang === "it" ? "Torna indietro" : "Go back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border rounded">
      <div className="flex items-center gap-3">
        <Flag className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-h2">{t("title")}</h1>
      </div>

      <div className="space-y-2">
        <Label>{t("reason")}</Label>
        <Select
          options={REPORT_REASONS.map((r) => ({ value: r.value, label: r.label[lang] }))}
          value={reason}
          onValueChange={setReason}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("details")}</Label>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          maxLength={2000}
        />
      </div>

      <div className="flex gap-2">
        <Button isLoading={loading} onClick={handleSubmit} disabled={!reason}>
          {t("submit")}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
