"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveReport, dismissReport } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReportActionsProps {
  reportId: string;
  locale: string;
}

export function ReportActions({ reportId, locale }: ReportActionsProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.reportActions");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"resolve" | "dismiss">("resolve");

  const handleSubmit = async () => {
    setLoading(true);
    if (action === "resolve") {
      await resolveReport(reportId, notes.trim());
    } else {
      await dismissReport(reportId, notes.trim());
    }
    setLoading(false);
    router.refresh();
  };

  if (showForm) {
    return (
      <div className="space-y-2 min-w-[200px]">
        <Textarea
          rows={2}
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {action === "resolve"
              ? t("resolve")
              : t("dismiss")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        onClick={() => { setAction("resolve"); setShowForm(true); }}
        disabled={loading}
      >
        <Check className="h-4 w-4 mr-1" />
        {t("resolve")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { setAction("dismiss"); setShowForm(true); }}
        disabled={loading}
      >
        <X className="h-4 w-4 mr-1" />
        {t("dismiss")}
      </Button>
    </div>
  );
}
