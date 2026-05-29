"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface ClickableCoverProps {
  coverUrl: string;
  allImages: { url: string; alt?: string }[];
  coverIndex: number;
  alt: string;
  sizes?: string;
}

export function ClickableCover({
  coverUrl,
  allImages,
  coverIndex,
  alt,
  sizes = "(max-width: 640px) 100vw, 33vw",
}: ClickableCoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="w-full h-full cursor-pointer group"
        onClick={() => setOpen(true)}
      >
        <Image
          src={coverUrl}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={sizes}
          priority
        />
      </button>
      <ImageLightbox
        images={allImages}
        initialIndex={coverIndex}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
