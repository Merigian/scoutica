"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FeaturedMarqueeProps {
  children: ReactNode;
}

const MIN_THUMB = 0.06; // minimum thumb width as a fraction of the track

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
      const ratio = Math.max(
        MIN_THUMB,
        Math.min(1, el.clientWidth / el.scrollWidth),
      );
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
    let grabOffset = 0; // px between the cursor and the thumb's left edge

    // Live geometry of the thumb inside the bar, in pixels.
    const geom = () => {
      const rect = bar.getBoundingClientRect();
      const max = el.scrollWidth - el.clientWidth;
      const ratio =
        el.scrollWidth > 0
          ? Math.max(MIN_THUMB, Math.min(1, el.clientWidth / el.scrollWidth))
          : 1;
      const thumbW = ratio * rect.width;
      const travel = rect.width - thumbW; // px the thumb-left can move
      const thumbLeft = max > 0 ? (el.scrollLeft / max) * travel : 0;
      return { rect, max, travel, thumbW, thumbLeft };
    };

    const scrollToThumbLeft = (thumbLeftPx: number) => {
      const { max, travel } = geom();
      if (max <= 0 || travel <= 0) return;
      const pos = Math.max(0, Math.min(1, thumbLeftPx / travel));
      el.scrollLeft = pos * max;
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only react to a real primary press (left mouse / finger / pen).
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const { rect, thumbW, thumbLeft } = geom();
      const x = e.clientX - rect.left;
      if (x >= thumbLeft && x <= thumbLeft + thumbW) {
        // Grabbed the thumb: keep the exact point under the cursor.
        grabOffset = x - thumbLeft;
      } else {
        // Clicked the empty track: center the thumb under the cursor.
        grabOffset = thumbW / 2;
        scrollToThumbLeft(x - grabOffset);
      }
      dragging = true;
      bar.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      // Button no longer held: stop — never scroll just from hovering.
      if (e.buttons === 0) {
        dragging = false;
        return;
      }
      const { rect } = geom();
      scrollToThumbLeft(e.clientX - rect.left - grabOffset);
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
    bar.addEventListener("lostpointercapture", onPointerUp);
    return () => {
      bar.removeEventListener("pointerdown", onPointerDown);
      bar.removeEventListener("pointermove", onPointerMove);
      bar.removeEventListener("pointerup", onPointerUp);
      bar.removeEventListener("pointercancel", onPointerUp);
      bar.removeEventListener("lostpointercapture", onPointerUp);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={trackRef}
        className="relative overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain select-none"
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
          aria-valuenow={
            thumb.width < 1
              ? Math.round((thumb.left / (1 - thumb.width)) * 100)
              : 0
          }
          tabIndex={0}
          className="relative h-4 -my-1 w-full cursor-pointer touch-none select-none"
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[var(--rule)]" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-[var(--ink)]"
            style={{
              left: `${thumb.left * 100}%`,
              width: `${thumb.width * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
