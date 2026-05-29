"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Star, Trash2, Plus, Loader2 } from "lucide-react";
import { ImageCropper } from "@/components/ui/image-cropper";

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(t("formatError"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t("sizeError"));
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
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));

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
  }, [router]);

  const handleSetCover = async (imageId: string) => {
    setActionLoading(imageId);
    try {
      const res = await fetch("/api/portfolio/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!data.success) alert(data.error || t("error"));
      router.refresh();
    } catch {
      alert(t("error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setActionLoading(imageId);
    try {
      const res = await fetch("/api/portfolio/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!data.success) alert(data.error || t("error"));
      router.refresh();
    } catch {
      alert(t("error"));
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

        <div className="grid grid-cols-3 gap-3">
          {/* Existing photos */}
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)] border-2 border-transparent transition-colors hover:border-muted-foreground/20"
              style={photo.isCover ? { borderColor: "var(--color-gold)" } : undefined}
            >
              <img
                src={photo.url}
                alt={t("photoAlt")}
                className="h-full w-full object-cover"
              />

              {photo.isCover && (
                <div className="absolute top-1.5 left-1.5">
                  <Badge variant="gold" className="text-[10px] px-1.5 py-0.5">
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
              className="aspect-[3/4] border-2 border-dashed border-[var(--rule)] hover:border-muted-foreground/40 transition-colors flex flex-col items-center justify-center gap-2 text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          outputWidth={600}
        />
      </CardContent>
    </Card>
  );
}
