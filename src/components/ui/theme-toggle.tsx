"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  /** Show label text next to icon */
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className={className} aria-label="Toggle theme">
        <Sun className="h-[18px] w-[18px] shrink-0" />
        {showLabel && <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">Theme</span>}
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px] shrink-0" />
      ) : (
        <Moon className="h-[18px] w-[18px] shrink-0" />
      )}
      {showLabel && (
        <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
