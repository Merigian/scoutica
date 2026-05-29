"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, MapIcon } from "lucide-react";
import type { StudioCard as StudioCardType } from "@/server/queries/studios";
import { StudioCard } from "@/components/studios/studio-card";
import { StudioMapView } from "@/components/studios/studio-map-view";
import { useTranslations } from "next-intl";

interface StudiosViewProps {
  studios: StudioCardType[];
  locale: string;
  totalLabel: string;
}

export function StudiosView({ studios, locale, totalLabel }: StudiosViewProps) {
  const [view, setView] = useState<"grid" | "map">("grid");
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.studiosView");

  return (
    <div>
      {/* View toggle + result count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--ink-3)]">{totalLabel}</p>

        <div className="flex items-center gap-1 bg-[var(--bg-soft)] p-0.5 rounded-sm">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors rounded-sm ${
              view === "grid"
                ? "bg-[var(--bg-soft)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("grid")}</span>
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors rounded-sm ${
              view === "map"
                ? "bg-[var(--bg-soft)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("map")}</span>
          </button>
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} locale={locale} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <StudioMapView studios={studios} locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
