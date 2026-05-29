"use server";

import { db } from "@/lib/db";

/**
 * Check if the scout gate is open (allowing new talent buyers to proceed to verification).
 * Reads from SiteSettings table. Defaults to true if not configured.
 */
export async function isScoutGateOpen(): Promise<boolean> {
  const setting = await db.siteSettings.findUnique({
    where: { key: "scout_gate_open" },
  });
  // Default to open if not configured
  if (!setting) return true;
  return setting.value === "true";
}

/**
 * Get a site setting value by key.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await db.siteSettings.findUnique({ where: { key } });
  return setting?.value ?? null;
}
