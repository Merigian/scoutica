"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [currentIndex, setCurrentIndex] = useState(coverIndex);

  const hasMultiple = allImages.length > 1;
  const currentUrl = allImages[currentIndex]?.url ?? coverUrl;

  const go = (e: React.MouseEvent, dir: "prev" | "next") => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      dir === "next"
        ? (prev + 1) % allImages.length
        : (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <>
      <div className="group absolute inset-0">
        <button
          type="button"
          aria-label="Open photo"
          className="absolute inset-0 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Image
            src={currentUrl}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={sizes}
            priority
          />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => go(e, "prev")}
              className="nav-zone absolute inset-y-0 left-0 z-10 flex w-1/3 items-center justify-start pl-4 focus:outline-none"
            >
              <ChevronLeft className="nav-arrow h-9 w-9 text-white" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => go(e, "next")}
              className="nav-zone absolute inset-y-0 right-0 z-10 flex w-1/3 items-center justify-end pr-4 focus:outline-none"
            >
              <ChevronRight className="nav-arrow h-9 w-9 text-white" strokeWidth={1.5} />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
              {allImages.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/55"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ImageLightbox
        images={allImages}
        initialIndex={currentIndex}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
