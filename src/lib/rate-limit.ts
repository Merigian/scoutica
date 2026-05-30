/**
 * Rate limiting abstraction.
 *
 * Uses Upstash Redis REST API (sliding window) when UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN are set. Falls back to an in-memory map for local
 * development (NOT safe across serverless instances — only use Upstash in prod).
 *
 * Zero npm deps: talks to Upstash via fetch.
 */

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // unix ms when the window resets
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback: Map<key, { count, expiresAt }>
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

async function upstashCall(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
  const data = (await res.json()) as { result: unknown }[];
  return data.map((d) => d.result);
}

/**
 * Limit `key` to `limit` operations per `windowMs` milliseconds.
 * Uses a fixed-window counter (cheap, accurate enough for abuse prevention).
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const namespacedKey = `scoutica:rl:${key}`;
  const windowSec = Math.ceil(windowMs / 1000);

  if (HAS_UPSTASH) {
    try {
      const [count, ttl] = (await upstashCall([
        ["INCR", namespacedKey],
        ["TTL", namespacedKey],
      ])) as [number, number];

      // First hit in the window — set expiry
      if (ttl === -1) {
        await upstashCall([["EXPIRE", namespacedKey, windowSec]]);
      }

      const effectiveTtl = ttl === -1 ? windowSec : ttl;
      return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        reset: Date.now() + effectiveTtl * 1000,
      };
    } catch (err) {
      console.error("[rate-limit] Upstash failed, falling back to memory:", err);
      // fall through to memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryStore.get(namespacedKey);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(namespacedKey, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }
  entry.count++;
  return {
    success: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.expiresAt,
  };
}

/**
 * Convenience helper: pick the strongest client identifier available
 * from request headers. Use this from server actions / route handlers.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// Preset rate limits used across the app
export const RATE_LIMITS = {
  register: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hour per IP
  login: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10/15min per IP
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3/hour per IP
  emailVerifyResend: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3/hour per email
  contactRequest: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20/hour per user
  application: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30/hour per user
  studioBookingRequest: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hour per IP+studio
} as const;
