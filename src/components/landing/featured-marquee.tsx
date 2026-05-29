"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FeaturedMarqueeProps {
  children: ReactNode;
}

export function FeaturedMarquee({ children }: FeaturedMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 1 });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateThumb = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) {
        setThumb({ left: 0, width: 1 });
        return;
      }
      const ratio = Math.min(1, el.clientWidth / el.scrollWidth);
      const pos = el.scrollLeft / max;
      setThumb({ left: pos * (1 - ratio), width: ratio });
    };

    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    const el = trackRef.current;
    if (!bar || !el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      bar.setPointerCapture(e.pointerId);
      const rect = bar.getBoundingClientRect();
      const max = el.scrollWidth - el.clientWidth;
      const target = ((e.clientX - rect.left) / rect.width) * max;
      el.scrollLeft = Math.max(0, Math.min(max, target - el.clientWidth / 2));
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const rect = bar.getBoundingClientRect();
      const max = el.scrollWidth - el.clientWidth;
      const dx = ((e.clientX - startX) / rect.width) * max;
      el.scrollLeft = Math.max(0, Math.min(max, startScroll + dx));
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      try {
        bar.releasePointerCapture(e.pointerId);
      } catch {}
    };

    bar.addEventListener("pointerdown", onPointerDown);
    bar.addEventListener("pointermove", onPointerMove);
    bar.addEventListener("pointerup", onPointerUp);
    bar.addEventListener("pointercancel", onPointerUp);
    return () => {
      bar.removeEventListener("pointerdown", onPointerDown);
      bar.removeEventListener("pointermove", onPointerMove);
      bar.removeEventListener("pointerup", onPointerUp);
      bar.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={trackRef}
        className="relative overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain"
      >
        <div className="flex w-max gap-6">{children}</div>
      </div>

      <div className="mx-auto max-w-[1440px] w-full px-6 lg:px-12">
        <div
          ref={barRef}
          role="scrollbar"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(thumb.left * 100)}
          tabIndex={0}
          className="relative h-2 w-full cursor-pointer touch-none select-none"
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[var(--rule)]" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-[var(--ink)]"
            style={{
              left: `${thumb.left * 100}%`,
              width: `${Math.max(thumb.width, 0.05) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
