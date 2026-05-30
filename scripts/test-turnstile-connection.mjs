// Turnstile credential test.
// Validates that TURNSTILE_SECRET_KEY is accepted by Cloudflare's siteverify
// endpoint (we send a dummy token; if the secret is valid, the error code
// will be about the token, not the secret). Site Key is format-checked only.
import { readFileSync, existsSync } from "node:fs";

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnv(".env.local");

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const secret = process.env.TURNSTILE_SECRET_KEY;

console.log("─── TURNSTILE CONFIG ───");
console.log("Site Key  :", siteKey ? `${siteKey.slice(0, 8)}…${siteKey.slice(-4)} (${siteKey.length} chars)` : "MISSING");
console.log("Secret    :", secret ? `[hidden, ${secret.length} chars, prefix=${secret.slice(0, 6)}]` : "MISSING");
console.log("");

if (!siteKey || !secret) {
  console.error("✗ Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY or TURNSTILE_SECRET_KEY in .env.local");
  process.exit(1);
}

// Format check
const isProdFormat = (s) => /^0x4[A-Za-z0-9_-]{30,}$/.test(s);
console.log("→ Site Key format check:", isProdFormat(siteKey) ? "✓ ok" : "⚠ unusual format");
console.log("→ Secret  format check:", isProdFormat(secret) ? "✓ ok" : "⚠ unusual format");

if (siteKey === secret) {
  console.error("✗ Site Key and Secret Key are IDENTICAL — you copied the same value twice!");
  process.exit(1);
}
console.log("→ Keys are different     ✓");

// Send dummy token to siteverify — error code reveals if SECRET is recognized
try {
  console.log("\n→ Calling Cloudflare siteverify with dummy token…");
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: "dummy-invalid-token-for-test" }),
  });
  const body = await res.json();
  console.log("  Response:", JSON.stringify(body));

  const codes = body["error-codes"] || [];
  if (codes.includes("invalid-input-secret")) {
    console.error("\n✗ SECRET KEY REJECTED by Cloudflare — the key is wrong or for a different widget");
    process.exit(1);
  }
  // Expected: "invalid-input-response" or similar token-related error → secret is valid
  console.log("\n✅ TURNSTILE SECRET IS VALID (Cloudflare accepted the secret; rejected only the dummy token, as expected)");
  console.log("   Site Key will be tested in the browser when users hit registration/login forms.");
  process.exit(0);
} catch (err) {
  console.error("\n✗ NETWORK ERROR:", err.message);
  process.exit(1);
}
