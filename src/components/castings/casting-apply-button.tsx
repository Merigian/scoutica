"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyToCasting } from "@/server/actions/castings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";

interface CastingApplyButtonProps {
  castingId: string;
  locale: string;
}

export function CastingApplyButton({ castingId, locale }: CastingApplyButtonProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.castingApply");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [introMessage, setIntroMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleApply = async () => {
    setSubmitting(true);
    setResult(null);
    const response = await applyToCasting({ castingId, introMessage: introMessage || null });
    setSubmitting(false);
    setResult(response);
    if (response.success) {
      router.refresh();
    }
  };

  if (result?.success) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <p className="text-sm font-medium text-success">
            {t("success")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)}>
        <Send className="h-4 w-4 mr-2" />
        {t("apply")}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {result?.error && (
          <div className="flex items-start gap-2 rounded-md bg-[var(--accent)]/10 p-3 text-sm text-[var(--accent)]">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{result.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="introMessage">
            {t("messageLabel")}
          </Label>
          <Textarea
            id="introMessage"
            rows={3}
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            placeholder={t("messagePlaceholder")}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApply} isLoading={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {t("submit")}
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            {t("cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
