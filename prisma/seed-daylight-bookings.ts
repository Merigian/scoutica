// Seed booked time slots for "Bellini Studio - Sala Daylight"
// Run: npx tsx prisma/seed-daylight-bookings.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the studio
  const studio = await prisma.studio.findUnique({
    where: { slug: "bellini-studio-sala-daylight" },
  });

  if (!studio) {
    console.error("Studio 'bellini-studio-sala-daylight' not found!");
    process.exit(1);
  }

  console.log(`Found studio: ${studio.name} (${studio.id})`);

  // Create bookings with time slots for today + upcoming days
  const today = new Date();
  const bookings = [
    {
      // Today: morning block 09:00–12:00
      name: "Luca Bianchi",
      email: "luca.bianchi@example.com",
      phone: "+39 333 1111111",
      message: "Shooting beauty per catalogo primavera",
      startDate: getDateAt(today, 0),
      endDate: getDateAt(today, 0),
      startTime: "09:00",
      endTime: "12:00",
      totalDays: 1,
      totalPrice: 165, // 3h × €55
      status: "CONFIRMED" as const,
    },
    {
      // Today: afternoon block 14:00–17:30
      name: "Sofia Marchetti",
      email: "sofia.marchetti@example.com",
      message: "Ritratti per portfolio attoriale",
      startDate: getDateAt(today, 0),
      endDate: getDateAt(today, 0),
      startTime: "14:00",
      endTime: "17:30",
      totalDays: 1,
      totalPrice: 193, // 3.5h × €55
      status: "CONFIRMED" as const,
    },
    {
      // Tomorrow: 10:00–13:00
      name: "Andrea Russo",
      email: "andrea.russo@example.com",
      phone: "+39 340 2222222",
      message: "Shooting e-commerce gioielli",
      startDate: getDateAt(today, 1),
      endDate: getDateAt(today, 1),
      startTime: "10:00",
      endTime: "13:00",
      totalDays: 1,
      totalPrice: 165,
      status: "PENDING" as const,
    },
    {
      // Tomorrow: 15:30–19:00
      name: "Giulia Ferri",
      email: "giulia.ferri@example.com",
      message: "Video content per social media",
      startDate: getDateAt(today, 1),
      endDate: getDateAt(today, 1),
      startTime: "15:30",
      endTime: "19:00",
      totalDays: 1,
      totalPrice: 193,
      status: "CONFIRMED" as const,
    },
    {
      // Day after tomorrow: full morning 08:00–12:30
      name: "Marco Verdi",
      email: "marco.verdi@example.com",
      phone: "+39 328 3333333",
      message: "Shooting moda streetwear collection",
      startDate: getDateAt(today, 2),
      endDate: getDateAt(today, 2),
      startTime: "08:00",
      endTime: "12:30",
      totalDays: 1,
      totalPrice: 248, // 4.5h × €55
      status: "CONFIRMED" as const,
    },
  ];

  // Remove any existing bookings for this studio to avoid duplicates
  const deleted = await prisma.studioBooking.deleteMany({
    where: {
      studioId: studio.id,
      email: { in: bookings.map((b) => b.email) },
    },
  });
  console.log(`Cleaned ${deleted.count} existing test bookings`);

  for (const b of bookings) {
    await prisma.studioBooking.create({
      data: {
        studioId: studio.id,
        name: b.name,
        email: b.email,
        phone: b.phone || null,
        message: b.message || null,
        startDate: b.startDate,
        endDate: b.endDate,
        startTime: b.startTime,
        endTime: b.endTime,
        totalDays: b.totalDays,
        totalPrice: b.totalPrice,
        status: b.status,
      },
    });
    console.log(
      `  ✓ ${b.name}: ${b.startTime}–${b.endTime} (${b.status}) — ${formatDate(b.startDate)}`
    );
  }

  console.log(`\nDone! Created ${bookings.length} bookings for "${studio.name}"`);
}

function getDateAt(base: Date, offsetDays: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
