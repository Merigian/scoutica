"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toggleScoutGate } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";

interface ScoutGateToggleProps {
  isOpen: boolean;
  waitlistedCount: number;
}

export function ScoutGateToggle({ isOpen, waitlistedCount }: ScoutGateToggleProps) {
  const t = useTranslations("pages.admin.settings.scoutGate");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newState = !isOpen;
    if (newState && waitlistedCount > 0) {
      if (!confirm(t("openConfirm", { count: waitlistedCount }))) return;
    }
    if (!newState) {
      if (!confirm(t("closeConfirm"))) return;
    }
    setLoading(true);
    await toggleScoutGate(newState);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isOpen ? (
          <Shield className="h-5 w-5 text-success" />
        ) : (
          <ShieldOff className="h-5 w-5 text-warning" />
        )}
        <div>
          <p className="font-medium">
            {isOpen ? t("statusOpen") : t("statusClosed")}
          </p>
          <p className="text-sm text-[var(--ink-3)]">
            {isOpen ? t("statusOpenDesc") : t("statusClosedDesc")}
          </p>
        </div>
      </div>
      <Button
        variant={isOpen ? "outline" : "gold"}
        size="sm"
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? "..." : isOpen ? t("close") : t("open")}
      </Button>
    </div>
  );
}
