const { PrismaClient } = require("@prisma/client");
const https = require("https");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if ([301, 302, 307].includes(res.statusCode)) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error("HTTP " + res.statusCode));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  const img = await db.portfolioImage.findFirst({
    where: { modelProfile: { fullName: "Serena Vitale" }, url: { startsWith: "https://" } },
  });
  if (!img) { console.log("No broken image found"); return; }

  console.log("Fixing Serena Vitale photo...");
  const buf = await download("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=faces&q=80");
  const filename = img.modelProfileId + "-serena-fix.jpg";
  const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);
  fs.writeFileSync(filepath, buf);
  
  await db.portfolioImage.update({
    where: { id: img.id },
    data: { url: "/uploads/portfolio/" + filename, sizeBytes: buf.length },
  });
  console.log("Done! " + Math.round(buf.length / 1024) + "KB");
}

main().finally(() => db.$disconnect());
