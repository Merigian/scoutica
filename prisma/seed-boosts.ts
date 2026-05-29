/**
 * Seed script: activate a 7-day boost on 10 random published model profiles.
 * Run with:  npx tsx prisma/seed-boosts.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Grab all published model profile IDs
  const profiles = await db.modelProfile.findMany({
    where: { isPublished: true },
    select: { id: true, fullName: true },
  });

  if (profiles.length === 0) {
    console.log("No published profiles found — run the seed-models script first.");
    return;
  }

  // Shuffle and pick up to 10
  const shuffled = profiles.sort(() => Math.random() - 0.5).slice(0, 10);

  const now = new Date();
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

  let created = 0;
  for (const p of shuffled) {
    // Skip if already boosted
    const existing = await db.boost.findFirst({
      where: {
        modelProfileId: p.id,
        endsAt: { gte: now },
      },
    });
    if (existing) {
      console.log(`⏭  ${p.fullName} — already boosted, skipping`);
      continue;
    }

    await db.boost.create({
      data: {
        modelProfileId: p.id,
        startsAt: now,
        endsAt,
      },
    });
    created++;
    console.log(`✅ Boosted: ${p.fullName}`);
  }

  console.log(`\nDone — ${created} boosts created (expires ${endsAt.toISOString()})`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
