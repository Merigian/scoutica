"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { deletePortfolioImage, setCoverImage } from "@/server/actions/portfolio";
import { ImageCropper } from "@/components/ui/image-cropper";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";
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
  const [progress, setProgress] = useState(0);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => {
    if (uploading || images.length >= maxPhotos) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    setError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("formatError"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("sizeError"));
      return;
    }

    // Open the cropper so the user can frame the photo before uploading
    setCropFile(file);
  };

  const handleCropCancel = () => {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const photo = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const data = await uploadFileWithProgress("/api/portfolio/upload", photo, setProgress);
      if (!data.success) {
        setError(data.error || t("uploadError"));
      }
      router.refresh();
    } catch {
      setError(t("uploadError"));
    } finally {
      setUploading(false);
      setProgress(0);
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
        {error && (
          <p className="mt-4 hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--ink)]">
            {error}
          </p>
        )}
        {uploading && (
          <div className="mx-auto mt-4 max-w-xs space-y-1.5">
            <div className="flex items-center justify-between text-meta text-[var(--ink-3)]">
              <span>{t("uploading")}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden bg-[var(--bg-soft)]">
              <div
                className="h-full bg-[var(--ink)] transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <ImageCropper
          file={cropFile}
          onCrop={handleCropConfirm}
          onCancel={handleCropCancel}
          aspectRatio={3 / 4}
          outputWidth={1600}
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

      {error && (
        <p className="hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--ink)]">
          {error}
        </p>
      )}

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-meta text-[var(--ink-3)]">
            <span>{t("uploading")}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-[var(--bg-soft)]">
            <div
              className="h-full bg-[var(--ink)] transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]"
          >
            <Image
              src={image.url}
              alt={t("portfolioAlt")}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={90}
              className="object-cover"
            />

            {image.isCover && (
              <div className="absolute top-2 left-2">
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  {t("cover")}
                </Badge>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
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

      <ImageCropper
        file={cropFile}
        onCrop={handleCropConfirm}
        onCancel={handleCropCancel}
        aspectRatio={3 / 4}
        outputWidth={1600}
      />
    </div>
  );
}
