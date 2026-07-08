"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { deletePortfolioImage, setCoverImage, reorderImages } from "@/server/actions/portfolio";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useConfirmSheet } from "@/components/ui/confirm-sheet";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";
import { Star, Trash2, Upload, Images, GripVertical } from "lucide-react";

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
  const tCommon = useTranslations("common");
  const { confirmSheet, requestConfirm } = useConfirmSheet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PortfolioImage[]>(images);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Keep local order in sync when the server data changes (upload / delete / cover).
  useEffect(() => {
    setItems(images);
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistOrder = async (ordered: PortfolioImage[]) => {
    const result = await reorderImages(ordered.map((i) => i.id));
    if (!result.success) {
      setError(result.error || t("reorderError"));
      router.refresh();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = itemsRef.current;
    const cover = current.find((i) => i.isCover);
    const rest = cover ? current.filter((i) => i.id !== cover.id) : current;
    const oldIndex = rest.findIndex((i) => i.id === active.id);
    const newIndex = rest.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newRest = arrayMove(rest, oldIndex, newIndex);
    const next = cover ? [cover, ...newRest] : newRest;
    setItems(next);
    void persistOrder(next);
  };

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
    requestConfirm({
      title: t("deleteConfirm"),
      actionLabel: tCommon("delete"),
      cancelLabel: tCommon("cancel"),
      onConfirm: () => {
        void deletePortfolioImage(imageId).then(() => router.refresh());
      },
    });
  };

  const handleSetCover = async (imageId: string) => {
    // The cover is always pinned first, so promote the new cover to the front.
    const next = [
      ...itemsRef.current.filter((i) => i.id === imageId),
      ...itemsRef.current.filter((i) => i.id !== imageId),
    ].map((img) => ({ ...img, isCover: img.id === imageId }));
    setItems(next);
    await setCoverImage(imageId);
    await reorderImages(next.map((i) => i.id));
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

  const cover = items.find((i) => i.isCover);
  const rest = cover ? items.filter((i) => i.id !== cover.id) : items;

  return (
    <div className="space-y-6">
      {confirmSheet}
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
      {rest.length > 1 && (
        <p className="flex items-center gap-1.5 text-meta">
          <GripVertical className="h-3.5 w-3.5" />
          {t("reorderHint")}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cover && <PortfolioCoverTile image={cover} onDelete={handleDelete} />}
          <SortableContext items={rest.map((i) => i.id)} strategy={rectSortingStrategy}>
            {rest.map((image) => (
              <PortfolioTile
                key={image.id}
                image={image}
                onSetCover={handleSetCover}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

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

function PortfolioTile({
  image,
  onSetCover,
  onDelete,
}: {
  image: PortfolioImage;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("components.portfolio");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]"
    >
      <Image
        src={image.url}
        alt={t("portfolioAlt")}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={90}
        draggable={false}
        className="object-cover pointer-events-none select-none"
      />

      {image.isCover && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="default">
            <Star className="h-3 w-3 mr-1" />
            {t("cover")}
          </Badge>
        </div>
      )}

      {/* Drag handle — only this initiates a reorder, so the tile stays tappable */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t("reorder")}
        className="absolute top-2 right-2 z-20 flex h-8 w-8 touch-none items-center justify-center bg-[var(--bg)]/85 text-[var(--ink)] cursor-grab active:cursor-grabbing opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="absolute inset-0 z-10 bg-black/50 transition-opacity flex items-center justify-center gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
        {!image.isCover && (
          <Button size="sm" variant="secondary" onClick={() => onSetCover(image.id)}>
            <Star className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={() => onDelete(image.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PortfolioCoverTile({
  image,
  onDelete,
}: {
  image: PortfolioImage;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("components.portfolio");
  return (
    <div className="group relative aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]">
      <Image
        src={image.url}
        alt={t("portfolioAlt")}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={90}
        className="object-cover"
      />
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="default">
          <Star className="h-3 w-3 mr-1" />
          {t("cover")}
        </Badge>
      </div>
      <div className="absolute inset-0 z-10 bg-black/50 transition-opacity flex items-center justify-center gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
        <Button size="sm" variant="destructive" onClick={() => onDelete(image.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
