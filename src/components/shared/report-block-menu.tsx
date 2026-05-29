"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Flag, Ban, CheckCircle } from "lucide-react";
import { reportUser, blockUser } from "@/server/actions/trust";

const REPORT_REASONS = [
  { value: "HARASSMENT", label: { it: "Molestie", en: "Harassment" } },
  { value: "INAPPROPRIATE_CONTENT", label: { it: "Contenuto inappropriato", en: "Inappropriate content" } },
  { value: "FAKE_PROFILE", label: { it: "Profilo falso", en: "Fake profile" } },
  { value: "SPAM", label: { it: "Spam", en: "Spam" } },
  { value: "OTHER", label: { it: "Altro", en: "Other" } },
];

interface ReportBlockMenuProps {
  targetUserId: string;
  locale: string;
}

export function ReportBlockMenu({ targetUserId, locale }: ReportBlockMenuProps) {
  const t = useTranslations("report");
  const lang = locale === "en" ? "en" : "it";
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "report" | "block-confirm" | "done">("menu");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReport = async () => {
    if (!reason) return;
    setLoading(true);
    const result = await reportUser(targetUserId, reason, details);
    if (result.success) {
      setMessage(t("success"));
      setMode("done");
    }
    setLoading(false);
  };

  const handleBlock = async () => {
    setLoading(true);
    const result = await blockUser(targetUserId);
    if (result.success) {
      setMessage(t("blocked"));
      setMode("done");
      router.refresh();
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setOpen(true); setMode("menu"); }}
        className="text-[var(--ink-3)]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  if (mode === "done") {
    return (
      <div className="flex items-center gap-2 p-3 rounded border bg-success/5 border-success/20">
        <CheckCircle className="h-4 w-4 text-success" />
        <span className="text-sm">{message}</span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>×</Button>
      </div>
    );
  }

  if (mode === "block-confirm") {
    return (
      <div className="p-4 space-y-3 rounded border">
        <p className="text-sm">{t("blockConfirm")}</p>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" isLoading={loading} onClick={handleBlock}>
            <Ban className="h-3 w-3 mr-1" />
            {t("blockButton")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode("menu")}>
            {t("cancel") || "Cancel"}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "report") {
    return (
      <div className="p-4 space-y-3 rounded border">
        <h4 className="font-medium text-sm">{t("title")}</h4>
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
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" isLoading={loading} onClick={handleReport} disabled={!reason}>
            {t("submit")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode("menu")}>
            {t("cancel") || "Cancel"}
          </Button>
        </div>
      </div>
    );
  }

  // Menu mode
  return (
    <div className="flex gap-2 items-center">
      <Button variant="ghost" size="sm" onClick={() => setMode("report")} className="text-[var(--ink-3)]">
        <Flag className="h-3 w-3 mr-1" />
        {t("button")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setMode("block-confirm")} className="text-[var(--ink-3)]">
        <Ban className="h-3 w-3 mr-1" />
        {t("blockButton")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-[var(--ink-3)]">
        ×
      </Button>
    </div>
  );
}
