"use client";

import { useState } from "react";
import { createCheckoutSession, createPortalSession } from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface ModelBillingActionsProps {
  currentPlan: string;
  locale: string;
}

export function ModelBillingActions({ currentPlan, locale }: ModelBillingActionsProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.modelBilling");
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading("MODEL_PRO");
    const result = await createCheckoutSession("MODEL_PRO");
    if (result.success && result.data?.url) {
      window.location.href = result.data.url;
    }
    setLoading(null);
  };

  const handleManage = async () => {
    setLoading("portal");
    const result = await createPortalSession();
    if (result.success && result.data?.url) {
      window.location.href = result.data.url;
    }
    setLoading(null);
  };

  if (currentPlan === "FREE") {
    return (
      <div className="pt-2">
        <Button onClick={handleUpgrade} isLoading={loading === "MODEL_PRO"} variant="gold">
          <Zap className="h-4 w-4 mr-2" />
          {t("upgrade")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-2">
      <Button
        variant="outline"
        onClick={handleManage}
        isLoading={loading === "portal"}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {t("manage")}
        <ExternalLink className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
}
