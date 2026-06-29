"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import "mapbox-gl/dist/mapbox-gl.css";
import type { StudioCard } from "@/server/queries/studios";
import { STUDIO_TYPE_LABELS } from "@/config/enums";
import { useTranslations } from "next-intl";

const MAPBOX_LIGHT = "mapbox://styles/mapbox/light-v11";
const MAPBOX_DARK = "mapbox://styles/mapbox/dark-v11";

interface StudioMapViewProps {
  studios: StudioCard[];
  locale: string;
}

export function StudioMapView({ studios, locale }: StudioMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { resolvedTheme } = useTheme();
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.studioMap");

  const mappable = studios.filter((s) => s.latitude && s.longitude);

  const createMarkerEl = useCallback(() => {
    const el = document.createElement("div");
    el.className = "scoutica-marker";
    el.innerHTML = `
      <span class="scoutica-marker-dot"></span>
    `;
    return el;
  }, []);

  const buildPopupHTML = useCallback(
    (s: StudioCard) => {
      const typeLabel =
        STUDIO_TYPE_LABELS[s.studioType as keyof typeof STUDIO_TYPE_LABELS]?.[lang] ??
        s.studioType;
      const rate = s.hourlyRate
        ? `€${s.hourlyRate}${t("perHour")}`
        : s.dailyRate
          ? `€${s.dailyRate}${t("perDay")}`
          : "";

      return `
        <a href="/${locale}/studios/${s.slug}" class="scoutica-popup">
          ${
            s.coverImage
              ? `<img src="${s.coverImage}" alt="${s.name}" class="scoutica-popup-img" />`
              : `<div class="scoutica-popup-img scoutica-popup-img--empty"></div>`
          }
          <div class="scoutica-popup-body">
            <span class="scoutica-popup-type">${typeLabel}</span>
            <p class="scoutica-popup-name">${s.name}</p>
            ${s.city ? `<p class="scoutica-popup-city">${s.city}${s.region ? `, ${s.region}` : ""}</p>` : ""}
            ${rate ? `<p class="scoutica-popup-rate">${rate}</p>` : ""}
          </div>
        </a>
      `;
    },
    [lang, locale],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mappable.length === 0) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapContainer.current) return;

      mapboxgl.default.accessToken = token;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: resolvedTheme === "dark" ? MAPBOX_DARK : MAPBOX_LIGHT,
        center: [12.4964, 41.9028], // Rome as default center
        zoom: 5,
        attributionControl: false,
        pitchWithRotate: false,
      });

      map.addControl(
        new mapboxgl.default.AttributionControl({ compact: true }),
        "bottom-left",
      );
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        // Add markers
        const bounds = new mapboxgl.default.LngLatBounds();

        markersRef.current = mappable.map((studio) => {
          const lngLat: [number, number] = [studio.longitude!, studio.latitude!];
          bounds.extend(lngLat);

          const popup = new mapboxgl.default.Popup({
            offset: 12,
            closeButton: false,
            maxWidth: "260px",
            className: "scoutica-mapbox-popup",
          }).setHTML(buildPopupHTML(studio));

          const marker = new mapboxgl.default.Marker({ element: createMarkerEl() })
            .setLngLat(lngLat)
            .setPopup(popup)
            .addTo(map);

          return marker;
        });

        map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme switch — change map style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = resolvedTheme === "dark" ? MAPBOX_DARK : MAPBOX_LIGHT;
    map.setStyle(style);
  }, [resolvedTheme]);

  if (mappable.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-surface border border-[var(--rule)] text-[var(--ink-3)] text-sm">
        {t("noStudios")}
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-[540px] lg:h-[620px] border border-[var(--rule)] overflow-hidden"
    />
  );
}
