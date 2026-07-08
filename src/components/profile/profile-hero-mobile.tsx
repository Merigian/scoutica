"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface ProfileHeroMobileProps {
  images: string[];
  name: string;
  /** Pre-joined meta line, e.g. "23 anni · Milano, Lombardia". */
  meta?: string;
  verified: boolean;
  verifiedLabel: string;
  boosted: boolean;
  featuredLabel: string;
}

/**
 * Mobile profile showcase: full-bleed scroll-snap photo gallery with the
 * identity overlaid on the bottom scrim (`.text-agency`), page dots, and
 * tap-to-lightbox. Mobile-only (`lg:hidden`) — the desktop hero is untouched.
 */
export function ProfileHeroMobile({
  images,
  name,
  meta,
  verified,
  verifiedLabel,
  boosted,
  featuredLabel,
}: ProfileHeroMobileProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasMultiple = images.length > 1;

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== currentIndex && i >= 0 && i < images.length) setCurrentIndex(i);
  };

  return (
    <section className="relative -mx-4 lg:hidden" aria-label={name}>
      {images.length === 0 ? (
        <div className="flex aspect-[3/4] items-center justify-center bg-[var(--bg-soft)]">
          <User className="h-16 w-16 text-[var(--ink-3)]/30" />
        </div>
      ) : (
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex aspect-[3/4] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative h-full w-full shrink-0 snap-start focus-visible:outline-none"
              aria-label={`${name} — ${i + 1}/${images.length}`}
            >
              {Math.abs(i - currentIndex) <= 1 && (
                <Image
                  src={src}
                  alt={i === 0 ? name : ""}
                  fill
                  sizes="100vw"
                  quality={90}
                  priority={i === 0}
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Bottom scrim + identity */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pt-16 pb-3">
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-agency text-xl text-white">{name}</h1>
            {verified && (
              <VerifiedBadge size={18} className="shrink-0 text-white" aria-label={verifiedLabel} />
            )}
          </div>
          {meta && <p className="text-meta mt-1 text-white/80">{meta}</p>}
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {boosted && (
        <span className="absolute left-4 top-3 inline-flex items-center border border-white/25 bg-black/35 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {featuredLabel}
        </span>
      )}

      <ImageLightbox
        images={images.map((url) => ({ url, alt: name }))}
        initialIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  );
}
