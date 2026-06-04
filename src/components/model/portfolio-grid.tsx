"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { deletePortfolioImage, setCoverImage } from "@/server/actions/portfolio";
import { compressImage } from "@/lib/compress-image";
import { Star, Trash2, Upload, Images } from "lucide-react";

interface PortfolioImage {
  id: string;
  url: string;
  key: string;
  order: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}

export function PortfolioGrid({ images, maxPhotos = 3 }: { images: PortfolioImage[]; maxPhotos?: number }) {
  const router = useRouter();
  const t = useTranslations("components.portfolio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    if (uploading || images.length >= maxPhotos) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      const compressed = await compressImage(file, "portfolio");
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || t("uploadError"));
      }
      router.refresh();
    } catch {
      alert(t("uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await deletePortfolioImage(imageId);
    router.refresh();
  };

  const handleSetCover = async (imageId: string) => {
    await setCoverImage(imageId);
    router.refresh();
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="hidden"
      onChange={handleFileSelect}
    />
  );

  if (images.length === 0) {
    return (
      <>
        {fileInput}
        <EmptyState
          icon={Images}
          title={t("noImages")}
          description={t("noImagesDesc")}
          action={
            <Button onClick={openPicker} isLoading={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {t("upload")}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {fileInput}
      <div className="flex justify-end">
        <Button onClick={openPicker} isLoading={uploading} disabled={images.length >= maxPhotos}>
          <Upload className="h-4 w-4 mr-2" />
          {t("upload")}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]"
          >
            <img
              src={image.url}
              alt={t("portfolioAlt")}
              className="h-full w-full object-cover"
            />

            {image.isCover && (
              <div className="absolute top-2 left-2">
                <Badge variant="gold">
                  <Star className="h-3 w-3 mr-1" />
                  {t("cover")}
                </Badge>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.isCover && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetCover(image.id)}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
