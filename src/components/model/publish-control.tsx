"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publishModelProfile, unpublishModelProfile } from "@/server/actions/model-profile";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateAge } from "@/lib/utils";
import type { ModelProfileStatus } from "@prisma/client";

interface PublishControlProps {
  isPublished: boolean;
  publishedAt: Date | null;
  dateOfBirth: Date | null;
  fullName: string | null;
  imageCount: number;
  hasCover: boolean;
  status: ModelProfileStatus;
}

export function PublishControl({
  isPublished,
  dateOfBirth,
  fullName,
  imageCount,
  hasCover,
  status,
}: PublishControlProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("components.publishControl");

  const isIncomplete = status === "INCOMPLETE";

  const requirements = [
    { key: "active", met: !isIncomplete, tKey: "reqActive" as const },
    { key: "age", met: dateOfBirth ? calculateAge(dateOfBirth) >= 18 : false, tKey: "reqAge" as const },
    { key: "name", met: !!fullName && fullName.trim().length >= 2, tKey: "reqName" as const },
    { key: "image", met: imageCount >= 3, tKey: "reqImage" as const },
    { key: "cover", met: hasCover, tKey: "reqCover" as const },
  ];

  const canPublish = requirements.every((r) => r.met);

  const handlePublish = async () => {
    setLoading(true);
    const result = await publishModelProfile();
    setLoading(false);
    if (result.success) {
      router.push("/model/discover" as never);
    } else {
      router.refresh();
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    await unpublishModelProfile();
    setLoading(false);
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isPublished ? (
              <>
                <Eye className="h-5 w-5 text-success" />
                <span className="font-medium">{t("published")}</span>
                <Badge variant="success">{t("online")}</Badge>
              </>
            ) : (
              <>
                <EyeOff className="h-5 w-5 text-[var(--ink-3)]" />
                <span className="font-medium">{t("notPublished")}</span>
                <Badge variant="secondary">{t("offline")}</Badge>
              </>
            )}
          </div>
          {isPublished ? (
            <Button variant="outline" size="sm" onClick={handleUnpublish} isLoading={loading}>
              {t("hideProfile")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handlePublish}
              isLoading={loading}
              disabled={!canPublish}
            >
              {t("publishProfile")}
            </Button>
          )}
        </div>

        {!isPublished && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--ink-3)] flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {t("requirementsMessage")}
            </p>
            <ul className="space-y-1.5 ml-1">
              {requirements.map((req) => (
                <li key={req.key} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-[var(--accent)]" />
                  )}
                  <span className={req.met ? "text-[var(--ink-3)]" : "text-[var(--ink)]"}>{t(req.tKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
