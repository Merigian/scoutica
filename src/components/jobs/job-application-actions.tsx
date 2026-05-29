"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewJobApplication } from "@/server/actions/jobs";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface JobApplicationActionsProps {
  applicationId: string;
  locale: string;
}

export function JobApplicationActions({ applicationId, locale }: JobApplicationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.jobApplicationActions");

  const handleAction = async (action: "accept" | "reject") => {
    setLoading(true);
    await reviewJobApplication(applicationId, action);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button size="sm" className="text-xs" onClick={() => handleAction("accept")} disabled={loading}>
        <Check className="h-3.5 w-3.5 mr-1" />
        {t("accept")}
      </Button>
      <Button size="sm" variant="outline" className="text-xs" onClick={() => handleAction("reject")} disabled={loading}>
        <X className="h-3.5 w-3.5 mr-1" />
        {t("reject")}
      </Button>
    </div>
  );
}
