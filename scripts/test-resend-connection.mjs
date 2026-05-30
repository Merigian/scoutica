// Send a real Resend email to verify API key + EMAIL_FROM work.
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

const { RESEND_API_KEY: apiKey, EMAIL_FROM: from } = process.env;
const to = process.argv[2];

console.log("─── RESEND CONFIG ───");
console.log("API Key :", apiKey ? `[hidden, ${apiKey.length} chars, prefix=${apiKey.slice(0, 3)}]` : "MISSING");
console.log("From    :", from || "MISSING");
console.log("To      :", to || "MISSING (pass as arg)");
console.log("");

if (!apiKey || !from || !to) {
  console.error("✗ Usage: node scripts/test-resend-connection.mjs you@example.com");
  process.exit(1);
}

try {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "Scoutica — Test connessione Resend ✓",
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:24px auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="margin:0 0 12px">Scoutica</h2>
        <p>Se vedi questa email significa che <strong>Resend funziona correttamente</strong>.</p>
        <p style="color:#666;font-size:14px">Inviata da <code>${from}</code> alle ${new Date().toLocaleString("it-IT")}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="color:#888;font-size:12px">Test di configurazione — puoi ignorare/eliminare questa email.</p>
      </div>`,
    }),
  });

  const body = await res.json();
  if (res.ok) {
    console.log("✅ Email inviata con successo");
    console.log("   id   :", body.id);
    console.log("   to   :", to);
    console.log("\n→ Controlla la inbox (e la cartella spam) di", to);
    process.exit(0);
  } else {
    console.error("✗ RESEND ERROR — HTTP", res.status);
    console.error("  Response:", JSON.stringify(body, null, 2));
    process.exit(1);
  }
} catch (err) {
  console.error("\n✗ NETWORK ERROR:", err.message);
  process.exit(1);
}
