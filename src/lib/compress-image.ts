import { UPLOAD_LIMITS, UPLOAD_PRESETS, type UploadPreset, isAllowedImageType } from "./upload-config";

export class UploadValidationError extends Error {
  constructor(public code: "too_large" | "bad_type" | "decode_failed" | "encode_failed", message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img> fallback (e.g. older Safari)
    }
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = dataUrl;
  });
}

function getNaturalSize(bitmap: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  if ("naturalWidth" in bitmap) return { w: bitmap.naturalWidth, h: bitmap.naturalHeight };
  return { w: bitmap.width, h: bitmap.height };
}

/**
 * Compress an image file in the browser before upload. Handles EXIF
 * orientation, resizes to fit `maxLongSide`, re-encodes as JPEG and strips
 * metadata in the process.
 *
 * Throws `UploadValidationError` for fail-fast cases the caller can surface
 * with a tailored message.
 */
export async function compressImage(
  file: File,
  preset: UploadPreset | { maxLongSide: number; quality: number } = "portfolio"
): Promise<File> {
  if (!isAllowedImageType(file.type)) {
    throw new UploadValidationError("bad_type", file.type || "unknown");
  }
  if (file.size > UPLOAD_LIMITS.MAX_INPUT_BYTES) {
    throw new UploadValidationError("too_large", String(file.size));
  }

  const { maxLongSide, quality } =
    typeof preset === "string" ? UPLOAD_PRESETS[preset] : preset;

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await loadBitmap(file);
  } catch {
    throw new UploadValidationError("decode_failed", "image decode failed");
  }

  const { w: srcW, h: srcH } = getNaturalSize(bitmap);
  const longest = Math.max(srcW, srcH);
  const scale = longest > maxLongSide ? maxLongSide / longest : 1;
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadValidationError("encode_failed", "canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new UploadValidationError("encode_failed", "toBlob returned null");

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

