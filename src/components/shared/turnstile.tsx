"use client";

import { Turnstile as MarsidevTurnstile } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileProps {
  onToken: (token: string) => void;
  theme?: "light" | "dark" | "auto";
}

/**
 * Cloudflare Turnstile widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (dev passthrough).
 *
 * The parent form must:
 *   - keep a token state, set via onToken
 *   - include the token in the submitted payload as `turnstileToken`
 *   - block submit until token is set when turnstile is enabled
 */
export function Turnstile({ onToken, theme = "auto" }: TurnstileProps) {
  if (!SITE_KEY) return null;
  return (
    <div className="my-3">
      <MarsidevTurnstile
        siteKey={SITE_KEY}
        onSuccess={onToken}
        onExpire={() => onToken("")}
        onError={() => onToken("")}
        options={{ theme }}
      />
    </div>
  );
}

export const turnstileSiteKey = SITE_KEY;
