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
  const profile = await db.modelProfile.findFirst({
    where: { fullName: "Carmen Silva" },
    include: { portfolioImages: { orderBy: { order: "asc" } } },
  });
  if (!profile) { console.log("Not found"); return; }

  const urls = [
    "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=600&h=800&fit=crop&crop=faces&q=80",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop&crop=faces&q=80",
  ];

  const dir = path.join(process.cwd(), "public", "uploads", "portfolio");

  for (let i = 0; i < 2; i++) {
    const img = profile.portfolioImages[i];
    if (!img || !img.url.startsWith("https://")) continue;

    console.log(`Downloading photo ${i + 1}...`);
    const buf = await download(urls[i]);
    const filename = `${profile.id}-carmen-fix-${i}.jpg`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buf);
    console.log(`  Saved: ${filename} (${Math.round(buf.length / 1024)}KB)`);

    await db.portfolioImage.update({
      where: { id: img.id },
      data: { url: `/uploads/portfolio/${filename}`, sizeBytes: buf.length },
    });
    console.log(`  DB updated`);
  }

  console.log("Done!");
}

main().finally(() => db.$disconnect());
