/**
 * Central configuration for image uploads.
 *
 * All sizes are in bytes, all dimensions in pixels. Each preset is tuned for
 * a specific surface: hero/portfolio images get more pixels; avatars stay
 * small. Quality is JPEG compression quality (0..1).
 *
 * MAX_INPUT_BYTES protects the browser from loading absurdly large files
 * into a canvas (would OOM mobile devices). MAX_UPLOAD_BYTES is the hard
 * cap for what hits the server, set safely below Vercel's 4.5MB body limit.
 */

export const UPLOAD_PRESETS = {
  portfolio: { maxLongSide: 2000, quality: 0.85 },
  studio: { maxLongSide: 2400, quality: 0.85 },
  avatar: { maxLongSide: 800, quality: 0.9 },
} as const;

export type UploadPreset = keyof typeof UPLOAD_PRESETS;

export const UPLOAD_LIMITS = {
  /** Reject files larger than this before attempting client-side compression. */
  MAX_INPUT_BYTES: 30 * 1024 * 1024,
  /** Safety cap on compressed output. Vercel body limit is 4.5MB. */
  MAX_UPLOAD_BYTES: 4 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export type AllowedMime = (typeof UPLOAD_LIMITS.ALLOWED_MIME_TYPES)[number];

export function isAllowedImageType(mime: string): mime is AllowedMime {
  return (UPLOAD_LIMITS.ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}
