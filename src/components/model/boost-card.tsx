"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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

  const isActive = activeBoosts.length > 0;

  return (
    <div className="hairline bg-[var(--bg-elevated)] p-6 lg:p-7">
      <div className="flex items-center gap-2.5">
        <Zap className="h-5 w-5 text-[var(--ink)]" />
        <h3 className="text-h3">{t("title")}</h3>
      </div>
      <p className="mt-3 text-body text-[var(--ink-2)] max-w-[44ch]">{t("description")}</p>

      {isActive && (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1.5 hairline border-[var(--ink)] px-2.5 py-1 font-label text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]">
            <CheckCircle className="h-3 w-3" />
            {t("active")}
          </span>
          {latestEnd && (
            <span className="text-meta">
              {t("activeUntil")} {formatDate(latestEnd, locale)}
            </span>
          )}
        </div>
      )}

      <div className="mt-6">
        {canBuyMore ? (
          <Button variant="default" isLoading={loading} onClick={handleBuyBoost} className="group">
            <Zap className="h-4 w-4 mr-1.5" />
            {t("button")} — {t("price")}
          </Button>
        ) : (
          <p className="text-meta">{t("maxReached")}</p>
        )}
      </div>
    </div>
  );
}
