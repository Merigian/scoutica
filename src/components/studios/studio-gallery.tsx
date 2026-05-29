"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface StudioImage {
  id: string;
  url: string;
}

interface StudioGalleryProps {
  name: string;
  coverImage: StudioImage | null;
  otherImages: StudioImage[];
  noPhotoText: string;
}

export function StudioGallery({
  name,
  coverImage,
  otherImages,
  noPhotoText,
}: StudioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = coverImage ? [coverImage, ...otherImages] : otherImages;
  const lightboxImages = allImages.map((img) => ({ url: img.url, alt: name }));

  const openAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!coverImage) {
    return (
      <div className="aspect-video bg-[var(--bg-soft)] flex items-center justify-center">
        <p className="text-[var(--ink-3)]">{noPhotoText}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 max-h-[500px] overflow-hidden">
        <button
          type="button"
          className="relative lg:col-span-2 lg:row-span-2 aspect-video lg:aspect-auto cursor-pointer group overflow-hidden"
          onClick={() => openAt(0)}
        >
          <Image
            src={coverImage.url}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </button>
        {otherImages.slice(0, 2).map((img, i) => (
          <button
            key={img.id}
            type="button"
            className="relative hidden lg:block aspect-video cursor-pointer group overflow-hidden"
            onClick={() => openAt(i + 1)}
          >
            <Image
              src={img.url}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
