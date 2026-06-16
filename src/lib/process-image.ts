import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
  width: number;
  height: number;
  sizeBytes: number;
}

interface ProcessOptions {
  /** Longest side cap in px. Larger images are downscaled; smaller ones are left as-is. */
  maxLongSide?: number;
  /** WebP quality 1..100. */
  quality?: number;
}

/**
 * Normalize an uploaded image server-side with sharp:
 * - auto-rotate from EXIF orientation, then strip metadata
 * - downscale so the longest side <= maxLongSide (never upscales)
 * - re-encode to WebP at the given quality
 * Returns the processed buffer plus its final intrinsic dimensions.
 */
export async function processImage(
  input: Buffer,
  { maxLongSide = 2000, quality = 85 }: ProcessOptions = {},
): Promise<ProcessedImage> {
  const pipeline = sharp(input, { failOn: "none" }).rotate();

  const meta = await pipeline.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

  if (longest > maxLongSide) {
    pipeline.resize({
      width: meta.width && meta.width >= (meta.height ?? 0) ? maxLongSide : undefined,
      height: meta.height && meta.height > (meta.width ?? 0) ? maxLongSide : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const { data, info } = await pipeline
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    ext: "webp",
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}
