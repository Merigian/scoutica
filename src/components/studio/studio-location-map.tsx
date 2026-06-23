"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import "mapbox-gl/dist/mapbox-gl.css";

const LIGHT = "mapbox://styles/mapbox/light-v11";
const DARK = "mapbox://styles/mapbox/dark-v11";
const SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12";
const STREETS = "mapbox://styles/mapbox/streets-v12";

const STYLE_KEYS = ["map", "satellite", "streets"] as const;
type StyleKey = (typeof STYLE_KEYS)[number];

function styleUrl(key: StyleKey, dark: boolean): string {
  if (key === "satellite") return SATELLITE;
  if (key === "streets") return STREETS;
  return dark ? DARK : LIGHT;
}

interface StudioLocationMapProps {
  lat: number | null;
  lng: number | null;
  /** When provided, the pin is draggable and reports the corrected position. */
  onChange?: (lat: number, lng: number) => void;
}

export function StudioLocationMap({ lat, lng, onChange }: StudioLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const skipFly = useRef(false);
  const [styleKey, setStyleKey] = useState<StyleKey>("map");
  const { resolvedTheme } = useTheme();
  const t = useTranslations("components.studioLocationMap");

  const hasCoords = typeof lat === "number" && typeof lng === "number";

  // Init the map the first time coordinates become available.
  useEffect(() => {
    if (!hasCoords || !containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let cancelled = false;
    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      mapboxgl.default.accessToken = token;

      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: styleUrl(styleKey, resolvedTheme === "dark"),
        center: [lng as number, lat as number],
        zoom: 15,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });
      map.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const marker = new mapboxgl.default.Marker({ draggable: !!onChangeRef.current })
        .setLngLat([lng as number, lat as number])
        .addTo(map);
      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        skipFly.current = true;
        onChangeRef.current?.(ll.lat, ll.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords]);

  // Recenter + move the pin when the address changes (but not on a manual drag).
  useEffect(() => {
    if (!hasCoords) return;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([lng as number, lat as number]);
    if (skipFly.current) {
      skipFly.current = false;
      return;
    }
    map.flyTo({ center: [lng as number, lat as number], zoom: 15, duration: 600 });
  }, [lat, lng, hasCoords]);

  // Apply the chosen base style (and follow the app theme for the "map" style).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(styleUrl(styleKey, resolvedTheme === "dark"));
  }, [styleKey, resolvedTheme]);

  if (!hasCoords) {
    return (
      <div className="flex h-44 items-center justify-center border border-[var(--rule)] bg-[var(--bg-soft)] px-4 text-center text-sm text-[var(--ink-3)]">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <div
          ref={containerRef}
          className="h-44 w-full overflow-hidden border border-[var(--rule)]"
        />
        <div className="absolute left-2 top-2 z-10 flex overflow-hidden rounded-md border border-[var(--rule-strong)] text-xs shadow">
          {STYLE_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setStyleKey(k)}
              className={`px-2.5 py-1.5 transition-colors ${
                styleKey === k
                  ? "bg-[var(--ink)] text-[var(--bg-elevated)]"
                  : "bg-[var(--bg-elevated)] text-[var(--ink-2)] hover:bg-[var(--bg-soft)]"
              }`}
            >
              {t(`style.${k}`)}
            </button>
          ))}
        </div>
      </div>
      {onChange && <p className="text-xs text-[var(--ink-3)]">{t("hint")}</p>}
    </div>
  );
}
