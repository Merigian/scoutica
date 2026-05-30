"use client";

import { useState } from "react";
import { createPortalSession } from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

interface ModelBillingActionsProps {
  currentPlan: string;
  locale: string;
}

export function ModelBillingActions({ currentPlan }: ModelBillingActionsProps) {
  const t = useTranslations("components.modelBilling");
  const [loading, setLoading] = useState<string | null>(null);

  const handleManage = async () => {
    setLoading("portal");
    const result = await createPortalSession();
    if (result.success && result.data?.url) {
      window.location.href = result.data.url;
    }
    setLoading(null);
  };

  // Model plan is free forever per marketing. No upgrade path.
  // Only show the billing portal link for legacy customers with an existing subscription.
  if (currentPlan === "FREE") {
    return null;
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
