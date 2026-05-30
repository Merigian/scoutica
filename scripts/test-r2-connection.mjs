// One-shot R2 connectivity test. Reads .env.local, uploads a tiny test file,
// reads it back, then deletes it. Prints clear OK/FAIL diagnostics.
import { readFileSync, existsSync } from "node:fs";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function loadEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnv(".env.local");

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;

console.log("─── R2 CONFIG ───");
console.log("Account ID    :", R2_ACCOUNT_ID ? `${R2_ACCOUNT_ID.slice(0, 6)}…${R2_ACCOUNT_ID.slice(-4)} (${R2_ACCOUNT_ID.length} chars)` : "MISSING");
console.log("Access Key    :", R2_ACCESS_KEY_ID ? `${R2_ACCESS_KEY_ID.slice(0, 4)}…${R2_ACCESS_KEY_ID.slice(-4)}` : "MISSING");
console.log("Secret Key    :", R2_SECRET_ACCESS_KEY ? `[hidden, ${R2_SECRET_ACCESS_KEY.length} chars]` : "MISSING");
console.log("Bucket        :", R2_BUCKET || "MISSING");
console.log("Public URL    :", R2_PUBLIC_URL || "MISSING");
console.log("");

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
  console.error("✗ Missing one or more R2_* env vars in .env.local");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const testKey = `test/connectivity-${Date.now()}.txt`;
const testBody = `R2 connectivity test at ${new Date().toISOString()}`;

try {
  console.log("→ PUT  ", testKey);
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: testKey, Body: testBody, ContentType: "text/plain" }));
  console.log("  ✓ upload OK");

  console.log("→ GET  ", testKey);
  const got = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: testKey }));
  const text = await got.Body.transformToString();
  console.log("  ✓ download OK — body matches:", text === testBody);

  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${testKey}`;
  console.log("→ HTTP ", publicUrl);
  const res = await fetch(publicUrl);
  if (res.ok) {
    const fetched = await res.text();
    console.log("  ✓ public URL accessible (status", res.status + ", body matches:", fetched === testBody, ")");
  } else {
    console.log("  ⚠ public URL returned", res.status, "— bucket may not be public or URL is wrong");
  }

  console.log("→ DEL  ", testKey);
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: testKey }));
  console.log("  ✓ cleanup OK");

  console.log("\n✅ R2 IS WORKING. You can now upload images via the app.");
  process.exit(0);
} catch (err) {
  console.error("\n✗ R2 ERROR:", err.name);
  console.error("  Message:", err.message);
  if (err.$metadata) console.error("  HTTP   :", err.$metadata.httpStatusCode);
  process.exit(1);
}
