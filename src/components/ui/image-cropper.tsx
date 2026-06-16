"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";

interface ImageCropperProps {
  /** The File selected by the user */
  file: File | null;
  /** Called when user confirms the crop — receives the cropped blob */
  onCrop: (blob: Blob) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Aspect ratio width/height — default 3/4 */
  aspectRatio?: number;
  /** Output width in px — default 1600 (high-res; the server re-encodes to webp) */
  outputWidth?: number;
}

export function ImageCropper({
  file,
  onCrop,
  onCancel,
  aspectRatio = 3 / 4,
  outputWidth = 1600,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image element
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  // Transform state: offset (pan) and scale (zoom)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // The minimum scale that covers the viewport
  const [minScale, setMinScale] = useState(1);

  // Dragging
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Pinch (touch)
  const lastPinchDist = useRef<number | null>(null);

  // Viewport dimensions (the visible crop area)
  const viewportWidth = 300;
  const viewportHeight = viewportWidth / aspectRatio;

  // Load image from file
  useEffect(() => {
    if (!file) {
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);

      // Calculate min scale so the image covers the viewport entirely
      const scaleX = viewportWidth / image.width;
      const scaleY = viewportHeight / image.height;
      const fitScale = Math.max(scaleX, scaleY);

      setMinScale(fitScale);
      setScale(fitScale);
      // Center the image
      setOffset({
        x: (viewportWidth - image.width * fitScale) / 2,
        y: (viewportHeight - image.height * fitScale) / 2,
      });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, viewportWidth, viewportHeight]);

  // Clamp offset so the image fully covers the viewport
  const clampOffset = useCallback(
    (ox: number, oy: number, s: number): { x: number; y: number } => {
      if (!img) return { x: ox, y: oy };
      const imgW = img.width * s;
      const imgH = img.height * s;

      // Image left edge must be ≤ 0, right edge must be ≥ viewportWidth
      let x = ox;
      let y = oy;

      if (imgW <= viewportWidth) {
        x = (viewportWidth - imgW) / 2;
      } else {
        x = Math.min(0, Math.max(viewportWidth - imgW, x));
      }

      if (imgH <= viewportHeight) {
        y = (viewportHeight - imgH) / 2;
      } else {
        y = Math.min(0, Math.max(viewportHeight - imgH, y));
      }

      return { x, y };
    },
    [img, viewportWidth, viewportHeight]
  );

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    ctx.drawImage(
      img,
      offset.x,
      offset.y,
      img.width * scale,
      img.height * scale
    );
  }, [img, offset, scale, viewportWidth, viewportHeight]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ---- Mouse events ----
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, scale));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  // ---- Touch events ----
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      dragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastPinchDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, scale));
    }
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - lastPinchDist.current;
      lastPinchDist.current = dist;
      zoom(delta * 0.005);
    }
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    lastPinchDist.current = null;
  };

  // ---- Wheel zoom ----
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    zoom(delta);
  };

  // Zoom helper
  const zoom = useCallback(
    (delta: number) => {
      setScale((prev) => {
        const next = Math.min(Math.max(prev + delta, minScale), minScale * 5);
        // Re-center after zoom: keep the center of the viewport stable
        setOffset((prevOff) => {
          const cx = viewportWidth / 2;
          const cy = viewportHeight / 2;

          // Position of the center in image coords under old scale
          const imgCx = (cx - prevOff.x) / prev;
          const imgCy = (cy - prevOff.y) / prev;

          // New offset so the same image point stays at center
          const newX = cx - imgCx * next;
          const newY = cy - imgCy * next;

          return clampOffset(newX, newY, next);
        });
        return next;
      });
    },
    [minScale, clampOffset, viewportWidth, viewportHeight]
  );

  // Zoom buttons
  const handleZoomIn = () => zoom(minScale * 0.25);
  const handleZoomOut = () => zoom(-minScale * 0.25);
  const handleReset = () => {
    if (!img) return;
    const scaleX = viewportWidth / img.width;
    const scaleY = viewportHeight / img.height;
    const fitScale = Math.max(scaleX, scaleY);
    setScale(fitScale);
    setOffset({
      x: (viewportWidth - img.width * fitScale) / 2,
      y: (viewportHeight - img.height * fitScale) / 2,
    });
  };

  // Crop and produce a blob
  const handleConfirm = useCallback(() => {
    if (!img) return;

    const outputHeight = outputWidth / aspectRatio;
    const outCanvas = document.createElement("canvas");
    outCanvas.width = outputWidth;
    outCanvas.height = outputHeight;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return;

    // High-quality downscale for crisp output.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Map viewport → output
    const ratio = outputWidth / viewportWidth;
    ctx.drawImage(
      img,
      offset.x * ratio,
      offset.y * ratio,
      img.width * scale * ratio,
      img.height * scale * ratio
    );

    outCanvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [img, offset, scale, onCrop, aspectRatio, outputWidth, viewportWidth]);

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="max-w-sm sm:max-w-md"
        onClose={onCancel}
      >
        <DialogHeader>
          <DialogTitle>Ritaglia immagine</DialogTitle>
          <DialogDescription>
            Trascina per spostare, usa la rotellina o i pulsanti per zoomare.
          </DialogDescription>
        </DialogHeader>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden bg-black"
          style={{ width: viewportWidth, height: viewportHeight, cursor: "grab", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            width={viewportWidth}
            height={viewportHeight}
            className="block"
          />
          {/* Crop frame overlay */}
          <div className="pointer-events-none absolute inset-0 border-2 border-white/60" />
          {/* Rule of thirds guides */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Riduci"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div className="w-24 text-center text-xs text-muted-foreground">
            {minScale > 0 ? `${Math.round((scale / minScale) * 100)}%` : "100%"}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Ingrandisci"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            title="Ripristina"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Confirm / Cancel */}
        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1.5" />
            Annulla
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
          >
            <Check className="h-4 w-4 mr-1.5" />
            Ritaglia e carica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
