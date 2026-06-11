"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getCompletenessLevel } from "@/types";
import { cn } from "@/lib/utils";
import { Star, TrendingUp, CheckCircle } from "lucide-react";

const levelConfig = {
  basic: { icon: Star, color: "text-[var(--ink-3)]", key: "basic" as const },
  almost_complete: { icon: TrendingUp, color: "text-[var(--ink)]", key: "almostComplete" as const },
  ready: { icon: CheckCircle, color: "text-success", key: "ready" as const },
};

export function CompletenessScore({ score }: { score: number }) {
  const t = useTranslations("components.completenessScore");
  const level = getCompletenessLevel(score);
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={cn("h-5 w-5", config.color)} />
          <div>
            <p className="font-medium">{t(config.key)}</p>
          </div>
          <span className="ml-auto text-2xl font-display font-bold">{score}%</span>
        </div>
        <Progress value={score} showLabel={false} />
        {score < 71 && (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            {t("completeProfile")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
