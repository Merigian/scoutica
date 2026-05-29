"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
}

interface ClickableGalleryProps {
  images: GalleryImage[];
  columns?: string;
  aspectRatio?: string;
  sizes?: string;
}

export function ClickableGallery({
  images,
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  aspectRatio = "aspect-[3/4]",
  sizes = "(max-width: 640px) 50vw, 25vw",
}: ClickableGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages = images.map((img) => ({ url: img.url, alt: img.alt }));

  return (
    <>
      <div className={`grid ${columns} gap-3`}>
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className={`${aspectRatio} overflow-hidden bg-muted relative cursor-pointer group`}
            onClick={() => {
              setLightboxIndex(i);
              setLightboxOpen(true);
            }}
          >
            <Image
              src={img.url}
              alt={img.alt || "Photo"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={sizes}
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
