"use server";

import { db } from "@/lib/db";

/**
 * Get a site setting value by key.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await db.siteSettings.findUnique({ where: { key } });
  return setting?.value ?? null;
}
