/**
 * Object storage abstraction.
 *
 * Production: Cloudflare R2 (S3-compatible) via @aws-sdk/client-s3.
 * Development: local filesystem under public/uploads/.
 *
 * Required env vars for R2:
 *   R2_ACCOUNT_ID          — Cloudflare account ID
 *   R2_ACCESS_KEY_ID       — R2 API token access key
 *   R2_SECRET_ACCESS_KEY   — R2 API token secret
 *   R2_BUCKET_NAME         — bucket name
 *   R2_PUBLIC_URL          — public base URL (e.g. https://media.scoutica.it)
 *
 * When any are missing, falls back to local fs.writeFile and warns once.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const HAS_R2 = !!(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME &&
  R2_PUBLIC_URL
);

let warned = false;
function warnOnce() {
  if (!warned) {
    warned = true;
    console.warn(
      "[storage] R2 credentials missing — using local fs fallback. " +
        "Do NOT use this in production: files written to public/uploads will be lost on Vercel."
    );
  }
}

let r2Client: S3Client | null = null;
function getR2(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

export type UploadResult = {
  url: string; // public URL to use as image src
  key: string; // storage key (for later deletion)
};

/**
 * Upload a buffer to storage. `key` should include the folder prefix
 * (e.g. "portfolio/abc-123.jpg").
 */
export async function putObject(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  if (HAS_R2) {
    await getR2().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return {
      url: `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`,
      key,
    };
  }

  warnOnce();
  // Local fs fallback: key "portfolio/abc.jpg" → public/uploads/portfolio/abc.jpg
  const fsPath = join(process.cwd(), "public", "uploads", key);
  const dir = fsPath.substring(0, fsPath.lastIndexOf("/"));
  await mkdir(dir, { recursive: true });
  await writeFile(fsPath, buffer);
  return {
    url: `/uploads/${key}`,
    key,
  };
}

/**
 * Delete an object by key. Silent on not-found.
 */
export async function deleteObject(key: string): Promise<void> {
  if (HAS_R2) {
    try {
      await getR2().send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    } catch (err) {
      console.warn(`[storage] R2 delete failed for ${key}:`, err);
    }
    return;
  }
  const fsPath = join(process.cwd(), "public", "uploads", key);
  await unlink(fsPath).catch(() => {});
}

/**
 * Derive a clean file extension from a MIME type.
 */
export function extFromMime(mime: string): string {
  const sub = mime.split("/")[1] ?? "bin";
  return sub === "jpeg" ? "jpg" : sub;
}
