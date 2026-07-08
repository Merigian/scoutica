"use client";

import { useEffect } from "react";

/**
 * Locks background scrolling while an overlay (menu, drawer, bottom-sheet,
 * modal) is open — reliably, including on iOS Safari where `body { overflow:
 * hidden }` is silently ignored.
 *
 * Technique: pin the body with `position: fixed` at a negative `top` equal to
 * the current scroll offset, so the page visually stays put and no touch scroll
 * can chain through to it. On release we restore the styles and jump back to
 * the saved offset. A module-level counter coordinates nested locks (e.g. a
 * sheet opened on top of the menu) so the body is only unlocked once every
 * consumer has released.
 */

let lockCount = 0;
let savedScrollY = 0;
let saved: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
} | null = null;

function lock() {
  const body = document.body;
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    saved = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    // Compensate for the scrollbar disappearing (desktop) to avoid layout shift.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && saved) {
    const body = document.body;
    body.style.position = saved.position;
    body.style.top = saved.top;
    body.style.left = saved.left;
    body.style.right = saved.right;
    body.style.width = saved.width;
    body.style.overflow = saved.overflow;
    body.style.paddingRight = saved.paddingRight;
    saved = null;
    window.scrollTo(0, savedScrollY);
  }
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
