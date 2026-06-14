// Fix model portfolio photos: gender-consistent, fashion-relevant.
// Replaces every published model's photos with curated Unsplash fashion
// portraits matched to the model's gender. Stores direct Unsplash URLs
// (allowed in next.config images.remotePatterns) — no local downloads.
//
// Run: npx tsx prisma/fix-model-photos.ts

import { PrismaClient } from "@prisma/client";
import { unlink } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

// Curated & visually verified (contact sheet) — fashion/editorial portraits.
const FEMALE = [
  "photo-1534528741775-53994a69daeb",
  "photo-1502823403499-6ccfcf4fb453",
  "photo-1496440737103-cd596325d314",
  "photo-1531746020798-e6953c6e8e04",
  "photo-1519699047748-de8e457a634e",
  "photo-1529626455594-4ff0802cfb7e",
  "photo-1544005313-94ddf0286df2",
  "photo-1494790108377-be9c29b29330",
  "photo-1464863979621-258859e62245",
  "photo-1487412720507-e7ab37603c6f",
  "photo-1438761681033-6461ffad8d80",
  "photo-1524504388940-b1c1722653e1",
  "photo-1485893086445-ed75865251e0",
  "photo-1509967419530-da38b4704bc6",
  "photo-1512310604669-443f26c35f52",
  "photo-1539571696357-5a69c17a67c6",
];

const MALE = [
  "photo-1506794778202-cad84cf45f1d",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1500648767791-00dcc994a43e",
  "photo-1492562080023-ab3db95bfbce",
  "photo-1564564321837-a57b7070ac4f",
  "photo-1531891437562-4301cf35b7e4",
  "photo-1488161628813-04466f872be2",
  "photo-1492288991661-058aa541ff43",
  "photo-1503443207922-dff7d543fd0e",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1463453091185-61582044d556",
  "photo-1507591064344-4c6ce005b128",
  "photo-1521119989659-a83eee488004",
  "photo-1517070208541-6ddc4d3efbcb",
  "photo-1519345182560-3f2917c472ef",
  "photo-1504593811423-6dd665756598",
];

const url = (id: string) =>
  `https://images.unsplash.com/${id}?w=900&h=1200&fit=crop&crop=faces&q=80`;

async function fixGender(gender: "MALE" | "FEMALE", pool: string[]) {
  const models = await prisma.modelProfile.findMany({
    where: { isPublished: true, gender },
    orderBy: { createdAt: "asc" },
    include: { portfolioImages: true },
  });
  const n = pool.length;

  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    // 3 distinct photos; unique cover per model (i % n) while we have headroom.
    const ids = [pool[i % n], pool[(i + 1) % n], pool[(i + 2) % n]];

    // Best-effort cleanup of old local files (remote URLs are left untouched).
    for (const img of m.portfolioImages) {
      if (img.url.startsWith("/uploads/")) {
        await unlink(join(process.cwd(), "public", img.url.replace(/^\//, ""))).catch(() => {});
      }
    }
    await prisma.portfolioImage.deleteMany({ where: { modelProfileId: m.id } });
    await prisma.portfolioImage.createMany({
      data: ids.map((id, idx) => ({
        modelProfileId: m.id,
        url: url(id),
        key: "",
        order: idx,
        isCover: idx === 0,
        width: 900,
        height: 1200,
      })),
    });
    console.log(`  ${gender[0]} ${m.fullName} → ${ids.map((x) => x.slice(6, 16)).join(", ")}`);
  }
  return models.length;
}

async function main() {
  console.log("Fixing model photos (gender-consistent fashion portraits)...\n");
  const f = await fixGender("FEMALE", FEMALE);
  const m = await fixGender("MALE", MALE);
  console.log(`\nDone. Updated ${f} female + ${m} male = ${f + m} models.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
