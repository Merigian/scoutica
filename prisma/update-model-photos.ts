// Replace placeholder landscape photos with real portrait/model photos from Unsplash
// Run: npx tsx prisma/update-model-photos.ts

import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import https from "https";

const prisma = new PrismaClient();

function downloadImage(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error("Too many redirects"));
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode!)) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error("Redirect without location"));
        return downloadImage(loc, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Curated Unsplash photo IDs — real portraits of people
// URL pattern: https://images.unsplash.com/{id}?w=600&h=800&fit=crop&crop=faces&q=80

const FEMALE_PHOTOS = [
  // Valentina Marchetti
  "photo-1534528741775-53994a69daeb", "photo-1524638431109-93d95c968f03", "photo-1502823403499-6ccfcf4fb453",
  // Chiara De Luca
  "photo-1517841905240-472988babdf9", "photo-1515886657613-9f3515b0c78f", "photo-1496440737103-cd596325d314",
  // Fatima El Amrani
  "photo-1531746020798-e6953c6e8e04", "photo-1488426862026-3ee34a7d66df", "photo-1519699047748-de8e457a634e",
  // Serena Vitale
  "photo-1529626455594-4ff0802cfb7e", "photo-1544005313-94ddf0286df2", "photo-1521146764736-af640c527652",
  // Francesca Moretti
  "photo-1494790108377-be9c29b29330", "photo-1464863979621-258859e62245", "photo-1487412720507-e7ab37603c6f",
  // Camilla Gallo
  "photo-1438761681033-6461ffad8d80", "photo-1504439468489-c8920d796a29", "photo-1519125323398-675f0ddb6308",
  // Lucia Ferrara
  "photo-1512310604669-443f26c35f52", "photo-1524504388940-b1c1722653e1", "photo-1485893086445-ed75865251e0",
  // Isabella Romano
  "photo-1509967419530-da38b4704bc6", "photo-1503104834685-7205e8607eb9", "photo-1513956589380-bad6acb9b9d4",
  // Carmen Silva
  "photo-1507152927-f9e30c10cc5e", "photo-1523264653568-d89969b4faf6", "photo-1504703395950-b89145a5425b",
  // Marta Esposito
  "photo-1539571696357-5a69c17a67c6", "photo-1508214751196-bcfd4ca60f91", "photo-1514315384763-ba401779410f",
];

const MALE_PHOTOS = [
  // Alessandro Ferro
  "photo-1506794778202-cad84cf45f1d", "photo-1519085360753-af0119f7cbe7", "photo-1504257432389-52343af06ae3",
  // Matteo Russo
  "photo-1507003211169-0a1dd7228f2d", "photo-1500648767791-00dcc994a43e", "photo-1472099645785-5658abf4ff4e",
  // Davide Colombo
  "photo-1492562080023-ab3db95bfbce", "photo-1480455624313-e29b44bbfde1", "photo-1564564321837-a57b7070ac4f",
  // Kevin Okafor
  "photo-1531891437562-4301cf35b7e4", "photo-1503023345310-bd7c1de61c7d", "photo-1504593811423-6dd665756598",
  // Yuki Tanaka
  "photo-1545167622-3a6ac756afa4", "photo-1519345182560-3f2917c472ef", "photo-1568602471122-7832951cc4c5",
  // Diego Santini
  "photo-1548372290-8d01b6c8e78c", "photo-1552374196-c4e7ffc6e126", "photo-1566492031773-4f4e44671857",
  // Samuel Abate
  "photo-1583195764036-6dc248ac07d9", "photo-1544723795-3fb6469f5b39", "photo-1557862921-37829c790f19",
  // Nicolò Benedetti
  "photo-1496345875659-11f7dd282d1d", "photo-1474176857210-7287d38d27c6", "photo-1541855492-581f618f69a0",
  // Andrea Pellegrini
  "photo-1528892952291-009c663ce843", "photo-1489980557514-251d61e3eeb6", "photo-1570295999919-56ceb5ecca61",
  // Tommaso Greco
  "photo-1578489758854-f134a358f08b", "photo-1585837575652-267c041d77d4", "photo-1529068755536-a5ade0dcb4e8",
];

const FEMALE_EMAILS = [
  "valentina.marchetti@example.com", "chiara.deluca@example.com", "fatima.elamrani@example.com",
  "serena.vitale@example.com", "francesca.moretti@example.com", "camilla.gallo@example.com",
  "lucia.ferrara@example.com", "isabella.romano@example.com", "carmen.silva@example.com",
  "marta.esposito@example.com",
];

const MALE_EMAILS = [
  "alessandro.ferro@example.com", "matteo.russo@example.com", "davide.colombo@example.com",
  "kevin.okafor@example.com", "yuki.tanaka@example.com", "diego.santini@example.com",
  "samuel.abate@example.com", "nicolo.benedetti@example.com", "andrea.pellegrini@example.com",
  "tommaso.greco@example.com",
];

function unsplashUrl(id: string) {
  return `https://images.unsplash.com/${id}?w=600&h=800&fit=crop&crop=faces&q=80`;
}

async function main() {
  console.log("Updating model photos with real portrait images...\n");
  const uploadDir = join(process.cwd(), "public", "uploads", "portfolio");
  await mkdir(uploadDir, { recursive: true });

  let updated = 0, failed = 0;

  const allModels = [
    ...FEMALE_EMAILS.map((email, i) => ({ email, photos: FEMALE_PHOTOS.slice(i * 3, i * 3 + 3) })),
    ...MALE_EMAILS.map((email, i) => ({ email, photos: MALE_PHOTOS.slice(i * 3, i * 3 + 3) })),
  ];

  for (const model of allModels) {
    const user = await prisma.user.findUnique({
      where: { email: model.email },
      include: { modelProfile: { include: { portfolioImages: { orderBy: { order: "asc" } } } } },
    });
    if (!user?.modelProfile) { console.log(`  Skip ${model.email}`); continue; }

    const profile = user.modelProfile;
    console.log(`  ${user.name} — replacing ${profile.portfolioImages.length} photos...`);

    // Delete old images from DB and disk
    for (const img of profile.portfolioImages) {
      if (img.url.startsWith("/uploads/")) {
        try { await unlink(join(process.cwd(), "public", img.url)); } catch {}
      }
      await prisma.portfolioImage.delete({ where: { id: img.id } });
    }

    // Download and save new portrait photos
    for (let i = 0; i < model.photos.length; i++) {
      const photoId = model.photos[i];
      const url = unsplashUrl(photoId);
      const filename = `${profile.id}-portrait-${i}.jpg`;
      const filepath = join(uploadDir, filename);

      try {
        process.stdout.write(`    Photo ${i + 1}/3...`);
        const buffer = await downloadImage(url);
        if (buffer.length < 5000) throw new Error(`Too small (${buffer.length}B)`);
        await writeFile(filepath, buffer);
        await prisma.portfolioImage.create({
          data: {
            modelProfileId: profile.id,
            url: `/uploads/portfolio/${filename}`,
            key: `portfolio/${filename}`,
            width: 600, height: 800,
            sizeBytes: buffer.length,
            order: i, isCover: i === 0,
          },
        });
        console.log(` OK (${Math.round(buffer.length / 1024)}KB)`);
      } catch (err: any) {
        console.log(` FAILED: ${err.message}`);
        failed++;
        // Fallback: use direct Unsplash URL
        await prisma.portfolioImage.create({
          data: {
            modelProfileId: profile.id,
            url: url, key: `unsplash/${photoId}`,
            width: 600, height: 800,
            order: i, isCover: i === 0,
          },
        });
      }
    }
    updated++;
  }

  console.log(`\nDone! Updated ${updated} profiles. ${failed} photos failed (using URL fallback).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
