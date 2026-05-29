"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckoutSession, createPortalSession } from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface BillingActionsProps {
  currentPlan: string;
  locale: string;
}

export function BillingActions({ currentPlan, locale }: BillingActionsProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.billing");
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: "STARTER" | "PRO") => {
    setLoading(plan);
    const result = await createCheckoutSession(plan);
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
      <div className="flex gap-2 pt-2">
        <Button onClick={() => handleUpgrade("STARTER")} isLoading={loading === "STARTER"}>
          <Zap className="h-4 w-4 mr-2" />
          {t("upgradeStarter")}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleUpgrade("PRO")}
          isLoading={loading === "PRO"}
        >
          {t("upgradePro")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-2">
      {currentPlan === "STARTER" && (
        <Button onClick={() => handleUpgrade("PRO")} isLoading={loading === "PRO"}>
          <Zap className="h-4 w-4 mr-2" />
          {t("upgradePro")}
        </Button>
      )}
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
