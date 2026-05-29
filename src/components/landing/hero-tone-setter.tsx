"use client";

import { useEffect } from "react";

export function HeroToneSetter({ tone }: { tone: "dark" | "light" }) {
  useEffect(() => {
    document.body.dataset.heroTone = tone;
    return () => {
      delete document.body.dataset.heroTone;
    };
  }, [tone]);
  return null;
}
