"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteStudioImage, setStudioCoverImage } from "@/server/actions/studios";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface StudioPhotosProps {
  studioId: string;
  images: Array<{
    id: string;
    url: string;
    isCover: boolean;
    order: number;
  }>;
}

export function StudioPhotos({ studioId, images }: StudioPhotosProps) {
  const router = useRouter();
  const t = useTranslations("components.studioPhotos");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(t("formatError"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t("sizeError"));
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file, "studio");
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("studioId", studioId);

      const res = await fetch("/api/studio/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || t("uploadError"));
      }
      router.refresh();
    } catch {
      alert(t("uploadError"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (imageId: string) => {
    setActionLoading(imageId);
    await deleteStudioImage(imageId);
    setActionLoading(null);
    router.refresh();
  };

  const handleSetCover = async (imageId: string) => {
    setActionLoading(imageId);
    await setStudioCoverImage(imageId);
    setActionLoading(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {t("title")} ({images.length}/10)
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= 10}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
          {t("addPhoto")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-[var(--ink-3)]">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t("emptyMessage")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group aspect-video overflow-hidden bg-[var(--bg-soft)]">
                <Image
                  src={image.url}
                  alt={t("studioAlt")}
                  fill
                  className="object-cover"
                />
                {image.isCover && (
                  <Badge className="absolute top-1 left-1 text-[9px]" variant="gold">
                    Cover
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {!image.isCover && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleSetCover(image.id)}
                      disabled={actionLoading === image.id}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => handleDelete(image.id)}
                    disabled={actionLoading === image.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
