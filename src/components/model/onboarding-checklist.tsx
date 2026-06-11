"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Camera, Ruler, User, Globe, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  hasPhotos: boolean;
  hasMeasurements: boolean;
  hasBasicInfo: boolean;
  isPublished: boolean;
}

const STEPS = [
  { key: "photo", icon: Camera, href: "/model/portfolio", doneCheck: "hasPhotos" },
  { key: "measurements", icon: Ruler, href: "/model/profile", doneCheck: "hasMeasurements" },
  { key: "info", icon: User, href: "/model/profile", doneCheck: "hasBasicInfo" },
  { key: "publish", icon: Globe, href: "/model/profile", doneCheck: "isPublished" },
] as const;

export function OnboardingChecklist(props: OnboardingChecklistProps) {
  const t = useTranslations("onboarding");

  const completedCount = STEPS.filter((s) => props[s.doneCheck]).length;
  const allDone = completedCount === STEPS.length;

  if (allDone) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-6 text-center space-y-2">
          <CheckCircle className="h-10 w-10 text-success mx-auto" />
          <h3 className="font-display font-semibold">{t("done")}</h3>
          <p className="text-sm text-[var(--ink-3)]">{t("doneDesc")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-display font-semibold">{t("welcome")}</h3>
          <p className="text-sm text-[var(--ink-3)] mt-1">{t("subtitle")}</p>
          <div className="mt-3 h-1.5 bg-[var(--bg-soft)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ink)] transition-all duration-500"
              style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[var(--ink-3)] mt-1">
            {completedCount}/{STEPS.length}
          </p>
        </div>

        <div className="space-y-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const done = props[step.doneCheck];
            return (
              <Link
                key={step.key}
                href={step.href as never}
                className={cn(
                  "flex items-center gap-3 p-3 rounded transition-colors",
                  done
                    ? "bg-success/5 text-[var(--ink-3)]"
                    : "bg-[var(--bg-soft)]/50 hover:bg-[var(--bg-soft)]"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                  done ? "bg-success/10 text-success" : "bg-[var(--ink)]/10 text-[var(--ink)]"
                )}>
                  {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", done && "line-through")}>
                    {t(`steps.${step.key}`)}
                  </p>
                  <p className="text-xs text-[var(--ink-3)]">
                    {t(`steps.${step.key}Desc`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/model/profile"
          className="block text-center text-xs text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
        >
          {t("skip")} →
        </Link>
      </CardContent>
    </Card>
  );
}
