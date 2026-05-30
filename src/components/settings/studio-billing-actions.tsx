"use client";

import { useState } from "react";
import { createCheckoutSession, createPortalSession } from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SubscriptionPlanKey } from "@/lib/stripe";

interface StudioBillingActionsProps {
  currentPlan: string;
}

export function StudioBillingActions({ currentPlan }: StudioBillingActionsProps) {
  const t = useTranslations("components.billing");
  const [loading, setLoading] = useState<string | null>(null);
  const [interval, setInterval] = useState<"month" | "year">("month");

  const handleUpgrade = async (plan: SubscriptionPlanKey) => {
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

  const studioKey: SubscriptionPlanKey = interval === "year" ? "STUDIO_ANNUAL" : "STUDIO_MONTHLY";

  if (currentPlan === "FREE") {
    return (
      <div className="space-y-3 pt-2">
        <div className="inline-flex rounded-md border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={`px-3 py-1.5 rounded-sm ${interval === "month" ? "bg-[var(--ink)] text-[var(--bg-elevated)]" : "text-[var(--ink-2)]"}`}
          >
            {t("monthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={`px-3 py-1.5 rounded-sm ${interval === "year" ? "bg-[var(--ink)] text-[var(--bg-elevated)]" : "text-[var(--ink-2)]"}`}
          >
            {t("annual")} <span className="text-[10px] opacity-70 ml-1">-17%</span>
          </button>
        </div>
        <Button onClick={() => handleUpgrade(studioKey)} isLoading={loading === studioKey}>
          <Zap className="h-4 w-4 mr-2" />
          {interval === "year" ? t("upgradeStudioAnnual") : t("upgradeStudio")}
        </Button>
        <p className="text-xs text-[var(--ink-3)]">{t("trialNote")}</p>
      </div>
    );
  }

  return (
    <div className="pt-2">
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
