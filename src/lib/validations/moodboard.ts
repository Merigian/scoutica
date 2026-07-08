import { z } from "zod";

/**
 * A moodboard item attached to a casting or job. Three kinds:
 *  - IMAGE : an uploaded photo (R2 URL)
 *  - FILE  : an uploaded document, typically a PDF (R2 URL)
 *  - LINK  : an external reference URL
 * `url` is restricted to http(s) or same-origin ("/uploads/…") to avoid
 * stored-XSS via javascript:/data: hrefs when the item is rendered.
 */
const safeUrl = z
  .string()
  .min(1)
  .max(2000)
  .refine((u) => /^https?:\/\//i.test(u) || u.startsWith("/"), {
    message: "URL non valido",
  });

export const moodboardItemSchema = z.object({
  kind: z.enum(["IMAGE", "FILE", "LINK"]),
  url: safeUrl,
  name: z.string().max(200).optional(),
  mimeType: z.string().max(150).optional(),
  key: z.string().max(300).optional(),
});

export const moodboardSchema = z
  .array(moodboardItemSchema)
  .max(30)
  .optional()
  .default([]);

export type MoodboardItem = z.infer<typeof moodboardItemSchema>;
