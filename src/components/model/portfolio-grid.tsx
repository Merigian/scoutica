"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { deletePortfolioImage, setCoverImage, addPortfolioImage } from "@/server/actions/portfolio";
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
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    // For MVP, we'll create a placeholder image (in production, this would use presigned URLs)
    setUploading(true);
    const placeholderUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=600&fit=crop`;
    await addPortfolioImage({
      url: placeholderUrl,
      key: `portfolio/${Date.now()}.jpg`,
      width: 400,
      height: 600,
    });
    setUploading(false);
    router.refresh();
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

  if (images.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title={t("noImages")}
        description={t("noImagesDesc")}
        action={
          <Button onClick={handleUpload} isLoading={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {t("upload")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleUpload} isLoading={uploading} disabled={images.length >= maxPhotos}>
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
