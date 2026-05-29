"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

interface CarouselImage {
  id: string;
  url: string;
  isCover: boolean;
}

interface ProfileImageCarouselProps {
  images: CarouselImage[];
  alt: string;
}

export function ProfileImageCarousel({ images, alt }: ProfileImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const sorted = [...images].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return 0;
  });

  const total = sorted.length;

  const goPrev = useCallback(() => {
    setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setCurrent((c) => (c === total - 1 ? 0 : c + 1));
  }, [total]);

  if (total === 0) {
    return (
      <div className="relative aspect-[3/4] w-full bg-neutral-900 flex items-center justify-center">
        <User className="h-20 w-20 text-neutral-700" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden group select-none">
      <Image
        src={sorted[current].url}
        alt={`${alt} - ${current + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 45vw"
        priority={current === 0}
      />

      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1">
        {current + 1} / {total}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {total > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={goPrev} />
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={goNext} />
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-3 bg-white" : "w-1.5 bg-white/50"}`}
              aria-label={"Go to image " + String(i + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
