"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { publishStudio, pauseStudio, deleteStudio } from "@/server/actions/studios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirmSheet } from "@/components/ui/confirm-sheet";
import { STUDIO_STATUS_LABELS } from "@/config/enums";
import type { StudioStatus } from "@prisma/client";
import { Globe, Pause, Trash2, ExternalLink } from "lucide-react";

interface StudioPublishBarProps {
  studio: {
    id: string;
    name: string;
    slug: string;
    status: StudioStatus;
    isPublished: boolean;
  };
}

export function StudioPublishBar({ studio }: StudioPublishBarProps) {
  const router = useRouter();
  const t = useTranslations("components.studioPublish");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const lang = (locale === "en" ? "en" : "it") as "it" | "en";
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirmSheet, requestConfirm } = useConfirmSheet();

  const handlePublish = async () => {
    setLoading("publish");
    setError(null);
    const res = await publishStudio(studio.id);
    setLoading(null);
    if (!res.success) {
      setError(res.error ?? null);
      return;
    }
    router.refresh();
  };

  const handlePause = async () => {
    setLoading("pause");
    await pauseStudio(studio.id);
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async () => {
    requestConfirm({
      title: t("deleteConfirm"),
      actionLabel: tCommon("delete"),
      cancelLabel: tCommon("cancel"),
      onConfirm: async () => {
        setLoading("delete");
        await deleteStudio(studio.id);
        router.push("/studio/studios");
      },
    });
  };

  return (
    <div className="space-y-3 border-b pb-4">
      {confirmSheet}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
        <h1 className="text-h2">{studio.name}</h1>
        <Badge variant={studio.status === "PUBLISHED" ? "default" : "secondary"}>
          {STUDIO_STATUS_LABELS[studio.status][lang]}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {studio.isPublished && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/${locale}/studios/${studio.slug}`} target="_blank" rel="noopener">
              <ExternalLink className="h-4 w-4 mr-1" />
              {t("view")}
            </a>
          </Button>
        )}
        {studio.status !== "PUBLISHED" ? (
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!!loading}
            isLoading={loading === "publish"}
          >
            <Globe className="h-4 w-4 mr-1" />
            {t("publish")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            disabled={!!loading}
            isLoading={loading === "pause"}
          >
            <Pause className="h-4 w-4 mr-1" />
            {t("pause")}
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={!!loading}
          isLoading={loading === "delete"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </div>
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
