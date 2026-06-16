"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Star, Trash2, Plus, Loader2 } from "lucide-react";
import { ImageCropper } from "@/components/ui/image-cropper";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";

interface ProfilePhoto {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

interface ProfilePhotosProps {
  photos: ProfilePhoto[];
  maxPhotos?: number;
}

export function ProfilePhotos({ photos, maxPhotos = 3 }: ProfilePhotosProps) {
  const router = useRouter();
  const t = useTranslations("components.profilePhotos");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("formatError"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("sizeError"));
      return;
    }

    // Open the cropper modal instead of uploading directly
    setCropFile(file);
  };

  const handleCropCancel = useCallback(() => {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleCropConfirm = useCallback(async (blob: Blob) => {
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
  }, [router, t]);

  const handleSetCover = async (imageId: string) => {
    setActionLoading(imageId);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error || t("error"));
      router.refresh();
    } catch {
      setError(t("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setActionLoading(imageId);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error || t("error"));
      router.refresh();
    } catch {
      setError(t("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const emptySlots = Math.max(0, maxPhotos - photos.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-[var(--ink-3)]">
          {t("description", { maxPhotos })}
        </p>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {error && (
          <p className="mb-3 hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--ink)]">
            {error}
          </p>
        )}

        {uploading && (
          <div className="mb-3 space-y-1.5">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Existing photos */}
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)] border-2 border-transparent transition-colors hover:border-[var(--ink-3)]/20"
              style={photo.isCover ? { borderColor: "var(--ink)" } : undefined}
            >
              <Image
                src={photo.url}
                alt={t("photoAlt")}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                quality={90}
                className="object-cover"
              />

              {photo.isCover && (
                <div className="absolute top-1.5 left-1.5">
                  <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
                    <Star className="h-2.5 w-2.5 mr-0.5" />
                    {t("cover")}
                  </Badge>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                {actionLoading === photo.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    {!photo.isCover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs h-7 px-2"
                        onClick={() => handleSetCover(photo.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {t("setCover")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-7 px-2"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {t("delete")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Empty upload slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-[3/4] border-2 border-dashed border-[var(--rule)] hover:border-[var(--ink-3)]/40 transition-colors flex flex-col items-center justify-center gap-2 text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading && i === 0 ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">{t("addPhoto")}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Image Cropper Modal */}
        <ImageCropper
          file={cropFile}
          onCrop={handleCropConfirm}
          onCancel={handleCropCancel}
          aspectRatio={3 / 4}
          outputWidth={1600}
        />
      </CardContent>
    </Card>
  );
}
