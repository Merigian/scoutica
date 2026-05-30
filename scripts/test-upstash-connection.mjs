// One-shot Upstash REST connectivity test.
// SET → GET → DEL on a test key, prints clear OK/FAIL.
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

const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;

console.log("─── UPSTASH CONFIG ───");
console.log("URL  :", url || "MISSING");
console.log("TOKEN:", token ? `[hidden, ${token.length} chars]` : "MISSING");
console.log("");

if (!url || !token) {
  console.error("✗ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env.local");
  process.exit(1);
}

async function cmd(args) {
  const res = await fetch(`${url}/${args.join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${await res.text()}`);
  return res.json();
}

const key = `test:connectivity:${Date.now()}`;
const value = `scoutica-test-${Date.now()}`;

try {
  console.log(`→ SET  ${key} = ${value}`);
  const setRes = await cmd(["set", key, value, "EX", "60"]);
  console.log("  ✓ result:", JSON.stringify(setRes));

  console.log(`→ GET  ${key}`);
  const getRes = await cmd(["get", key]);
  console.log("  ✓ result:", JSON.stringify(getRes), "— match:", getRes.result === value);

  console.log(`→ INCR test:counter`);
  const incrRes = await cmd(["incr", "test:counter"]);
  console.log("  ✓ counter now:", incrRes.result);

  console.log(`→ DEL  ${key}`);
  const delRes = await cmd(["del", key]);
  console.log("  ✓ result:", JSON.stringify(delRes));

  console.log("\n✅ UPSTASH IS WORKING. Rate-limiting will use real Redis now.");
  process.exit(0);
} catch (err) {
  console.error("\n✗ UPSTASH ERROR:", err.message);
  process.exit(1);
}
