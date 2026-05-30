import { NextResponse } from "next/server";

/**
 * Verify a cron request is authorized.
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically.
 * Manual / local runners can use `?secret=<CRON_SECRET>` query string.
 */
export function verifyCronAuth(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${expected}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === expected) return true;

  return false;
}

export function unauthorizedCron() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
