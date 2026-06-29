"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StudioCard as StudioCardType } from "@/server/queries/studios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STUDIO_TYPE_LABELS, STUDIO_AMENITIES } from "@/config/enums";
import { MapPin, Camera, Clock, Calendar, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StudioCardProps {
  studio: StudioCardType;
  locale: string;
}

export function StudioCard({ studio, locale }: StudioCardProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.studioCard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = studio.images.length > 0 ? studio.images : studio.coverImage ? [studio.coverImage] : [];
  const hasMultiple = images.length > 1;

  const goTo = (e: React.MouseEvent, dir: "prev" | "next") => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      dir === "next" ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length
    );
  };

  // Find cheapest rate to show
  const rates = [
    studio.hourlyRate ? { value: studio.hourlyRate, label: t("perHour") } : null,
    studio.dailyRate ? { value: studio.dailyRate, label: t("perDay") } : null,
  ].filter(Boolean);
  const cheapest = rates[0];

  // Map amenity keys to labels (top 3)
  const amenityLabels = studio.amenities
    .map((key) => STUDIO_AMENITIES.find((a) => a.key === key)?.label[lang])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link href={`/${locale}/studios/${studio.slug}`}>
      <Card className="group overflow-hidden hover:ring-1 hover:ring-[var(--ink)]/30 transition-all duration-300  h-full">
        {/* Image Carousel */}
        <div className="relative aspect-video bg-[var(--bg-soft)] overflow-hidden">
          {images.length > 0 ? (
            <Image
              src={images[currentIndex]}
              alt={studio.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Building2 className="h-10 w-10 text-[var(--ink-3)]/30" />
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => goTo(e, "prev")}
                className="nav-zone absolute inset-y-0 left-0 z-10 flex w-1/3 items-center justify-start pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-inset"
              >
                <ChevronLeft className="nav-arrow h-6 w-6 text-white" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => goTo(e, "next")}
                className="nav-zone absolute inset-y-0 right-0 z-10 flex w-1/3 items-center justify-end pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-inset"
              >
                <ChevronRight className="nav-arrow h-6 w-6 text-white" strokeWidth={1.5} />
              </button>

              <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      "h-1.5 transition-all",
                      i === currentIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
              {STUDIO_TYPE_LABELS[studio.studioType as keyof typeof STUDIO_TYPE_LABELS]?.[lang] ?? studio.studioType}
            </Badge>
          </div>

          {/* Image count */}
          {studio.imageCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 text-[10px] flex items-center gap-1 rounded">
              <Camera className="h-3 w-3" />
              {studio.imageCount}
            </div>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-4 space-y-2">
          <h3 className="font-display font-semibold text-sm truncate group-hover:text-[var(--ink)] transition-colors">
            {studio.name}
          </h3>

          {studio.city && (
            <div className="flex items-center gap-1 text-xs text-[var(--ink-3)]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{studio.city}{studio.region ? `, ${studio.region}` : ""}</span>
            </div>
          )}

          {/* Price */}
          {cheapest && (
            <p className="text-sm font-semibold text-[var(--ink)]">
              €{cheapest.value}{cheapest.label}
            </p>
          )}

          {/* Amenities pills */}
          {amenityLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {amenityLabels.map((label) => (
                <Badge key={label} variant="outline" className="text-[9px] px-1.5 py-0">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
