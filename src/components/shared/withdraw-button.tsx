"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useConfirmSheet } from "@/components/ui/confirm-sheet";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { withdrawCastingApplication } from "@/server/actions/castings";
import { withdrawJobApplication } from "@/server/actions/jobs";
import { X } from "lucide-react";

interface WithdrawButtonProps {
  applicationId: string;
  type: "casting" | "job";
}

export function WithdrawButton({ applicationId, type }: WithdrawButtonProps) {
  const t = useTranslations("withdraw");
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { confirmSheet, requestConfirm } = useConfirmSheet();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const withdraw = async () => {
    setLoading(true);
    const result =
      type === "casting"
        ? await withdrawCastingApplication(applicationId)
        : await withdrawJobApplication(applicationId);
    if (result.success) {
      router.refresh();
    }
    setLoading(false);
    setConfirming(false);
  };

  if (confirming) {
    // Desktop-only inline confirm (mobile goes through the action sheet).
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-xs text-[var(--ink-3)]">{t("confirm")}</span>
        <Button
          size="sm"
          variant="destructive"
          isLoading={loading}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await withdraw();
          }}
        >
          {t("button")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(false);
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    );
  }

  return (
    <>
      {confirmSheet}
      <Button
        size="sm"
        variant="ghost"
        className="text-[var(--ink-3)] hover:text-[var(--accent)]"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isDesktop) {
            setConfirming(true);
          } else {
            requestConfirm({
              title: t("confirm"),
              actionLabel: t("button"),
              cancelLabel: t("cancel"),
              onConfirm: () => void withdraw(),
            });
          }
        }}
      >
        <X className="h-3 w-3 mr-1" />
        {t("button")}
      </Button>
    </>
  );
}
