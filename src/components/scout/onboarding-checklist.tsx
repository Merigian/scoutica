"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ShieldCheck, Search, Kanban, Megaphone, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoutOnboardingChecklistProps {
  isVerified: boolean;
  hasSaved: boolean;
  hasBoard: boolean;
  hasCasting: boolean;
}

const STEPS = [
  { key: "verify", icon: ShieldCheck, href: "/scout/verification", doneCheck: "isVerified" },
  { key: "search", icon: Search, href: "/scout/discover", doneCheck: "hasSaved" },
  { key: "board", icon: Kanban, href: "/scout/boards", doneCheck: "hasBoard" },
  { key: "casting", icon: Megaphone, href: "/scout/castings/new", doneCheck: "hasCasting" },
] as const;

export function ScoutOnboardingChecklist(props: ScoutOnboardingChecklistProps) {
  const t = useTranslations("pages.scout.onboarding");

  const completed = STEPS.filter((s) => props[s.doneCheck]).length;
  if (completed === STEPS.length) return null;

  return (
    <section className="hairline bg-[var(--bg-elevated)] p-6 lg:p-8 mb-14 lg:mb-20">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-h3 text-[var(--ink)]">{t("welcome")}</h2>
          <p className="mt-1 text-body text-[var(--ink-3)]">{t("subtitle")}</p>
        </div>
        <span className="text-meta tabular-nums shrink-0">
          {completed}/{STEPS.length}
        </span>
      </div>

      <div className="mt-4 h-1 bg-[var(--bg-soft)] overflow-hidden">
        <div
          className="h-full bg-[var(--ink)] transition-all duration-500"
          style={{ width: `${(completed / STEPS.length) * 100}%` }}
        />
      </div>

      <ul className="mt-6 grid sm:grid-cols-2 gap-px bg-[var(--rule)] hairline">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = props[step.doneCheck];
          return (
            <li key={step.key}>
              <Link
                href={step.href as never}
                className="flex items-center gap-3 bg-[var(--bg-elevated)] p-4 transition-colors hover:bg-[var(--bg-soft)]/60"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center shrink-0",
                    done
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--bg-soft)] text-[var(--ink)]",
                  )}
                >
                  {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-body text-[var(--ink)]",
                      done && "line-through text-[var(--ink-3)]",
                    )}
                  >
                    {t(`steps.${step.key}`)}
                  </span>
                  <span className="block text-meta">{t(`steps.${step.key}Desc`)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
