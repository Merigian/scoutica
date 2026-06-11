"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle } from "lucide-react";
import { createBoostCheckout } from "@/server/actions/stripe";
import { formatDate } from "@/lib/utils";

interface BoostCardProps {
  activeBoosts: { endsAt: Date }[];
  locale: string;
}

export function BoostCard({ activeBoosts, locale }: BoostCardProps) {
  const t = useTranslations("boostPurchase");
  const [loading, setLoading] = useState(false);

  const canBuyMore = activeBoosts.length < 4;
  const latestEnd = activeBoosts.length > 0
    ? new Date(Math.max(...activeBoosts.map((b) => new Date(b.endsAt).getTime())))
    : null;

  const handleBuyBoost = async () => {
    setLoading(true);
    try {
      const result = await createBoostCheckout();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[var(--accent)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--ink)]" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[var(--ink-3)]">{t("description")}</p>

        {activeBoosts.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {t("active")}
            </Badge>
            {latestEnd && (
              <span className="text-sm text-[var(--ink-3)]">
                {t("activeUntil")} {formatDate(latestEnd, locale)}
              </span>
            )}
          </div>
        )}

        {canBuyMore ? (
          <Button variant="default" isLoading={loading} onClick={handleBuyBoost}>
            <Zap className="h-4 w-4 mr-1" />
            {t("button")} — {t("price")}
          </Button>
        ) : (
          <p className="text-sm text-[var(--ink-3)]">{t("maxReached")}</p>
        )}
      </CardContent>
    </Card>
  );
}
