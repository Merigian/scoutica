/**
 * Cloudflare Turnstile — server-side token verification.
 *
 * Set TURNSTILE_SECRET_KEY in env to enable. When unset, verification is
 * skipped (returns true) so local development and preview environments
 * keep working without secrets.
 */

const SECRET = process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string
): Promise<boolean> {
  if (!SECRET) return true; // disabled
  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.set("secret", SECRET);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verify failed:", err);
    return false;
  }
}

export function turnstileEnabled(): boolean {
  return !!SECRET;
}
