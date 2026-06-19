// Script to add 6 studio profiles with photos
// Run: npx tsx prisma/seed-studios.ts

import { PrismaClient, StudioType, StudioStatus, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import https from "https";
import http from "http";

const prisma = new PrismaClient();

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location!).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

interface StudioSeed {
  user: { name: string; email: string };
  profile: { businessName: string; bio: string; city: string; region: string; phoneNumber?: string; websiteUrl?: string; vatNumber?: string };
  studios: {
    name: string;
    slug: string;
    description: string;
    studioType: StudioType;
    address: string;
    city: string;
    region: string;
    zipCode: string;
    sizeSqm?: number;
    maxCapacity?: number;
    amenities: string[];
    hourlyRate?: number;
    dailyRate?: number;
    weeklyRate?: number;
    minHours: number;
    contactEmail: string;
    contactPhone?: string;
    latitude: number;
    longitude: number;
    photos: string[];
  }[];
}

const studioData: StudioSeed[] = [
  {
    user: { name: "Marco Bellini", email: "marco.bellini.studio@example.com" },
    profile: {
      businessName: "Bellini Studio Milano",
      bio: "Studio fotografico professionale nel cuore di Milano. Specializzato in moda, beauty e still life dal 2010.",
      city: "Milano",
      region: "Lombardia",
      phoneNumber: "+39 02 1234567",
      websiteUrl: "https://bellinistudio.it",
      vatNumber: "IT12345678901",
    },
    studios: [
      {
        name: "Bellini Studio - Sala Principale",
        slug: "bellini-studio-sala-principale",
        description: "Ampio studio fotografico di 200mq con soffitti alti 5 metri, ideale per shooting moda e campagne pubblicitarie. Dotato di ciclorama bianco permanente, sistema di illuminazione professionale Broncolor e zona trucco dedicata. Posizione strategica a Porta Venezia, facilmente raggiungibile con i mezzi pubblici.",
        studioType: "PHOTO_STUDIO",
        address: "Via Lecco 18",
        city: "Milano",
        region: "Lombardia",
        zipCode: "20124",
        sizeSqm: 200,
        maxCapacity: 20,
        amenities: ["professional_lighting", "cyclorama", "makeup_area", "changing_room", "wifi", "air_conditioning", "equipment_included", "parking"],
        hourlyRate: 80,
        dailyRate: 500,
        weeklyRate: 2000,
        minHours: 3,
        contactEmail: "info@bellinistudio.it",
        contactPhone: "+39 02 1234567",
        latitude: 45.4773,
        longitude: 9.2050,
        photos: [
          "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800&q=80",
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
        ],
      },
      {
        name: "Bellini Studio - Sala Daylight",
        slug: "bellini-studio-sala-daylight",
        description: "Studio fotografico con luce naturale da ampie vetrate a nord. Perfetto per ritratti, beauty e contenuti editoriali. Pavimento in legno chiaro e pareti bianche per un ambiente luminoso e versatile.",
        studioType: "PHOTO_STUDIO",
        address: "Via Lecco 18, Piano 2",
        city: "Milano",
        region: "Lombardia",
        zipCode: "20124",
        sizeSqm: 100,
        maxCapacity: 10,
        amenities: ["natural_light", "makeup_area", "changing_room", "wifi", "air_conditioning", "steamer"],
        hourlyRate: 55,
        dailyRate: 350,
        minHours: 2,
        contactEmail: "info@bellinistudio.it",
        contactPhone: "+39 02 1234567",
        latitude: 45.4778,
        longitude: 9.2055,
        photos: [
          "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
        ],
      },
    ],
  },
  {
    user: { name: "Giulia Ferri", email: "giulia.ferri.studio@example.com" },
    profile: {
      businessName: "Spazio Ferri",
      bio: "Location per eventi e shooting moda nel quartiere Pigneto a Roma. Un ex laboratorio industriale trasformato in spazio creativo.",
      city: "Roma",
      region: "Lazio",
      phoneNumber: "+39 06 9876543",
    },
    studios: [
      {
        name: "Spazio Ferri - Loft Industriale",
        slug: "spazio-ferri-loft-industriale",
        description: "Ex laboratorio industriale di 300mq con mattoni a vista, travi in acciaio e soffitti a doppia altezza. Location unica per shooting moda, video musicali e eventi privati. Disponibile anche il cortile interno per shooting in esterno.",
        studioType: "EVENT_SPACE",
        address: "Via del Pigneto 45",
        city: "Roma",
        region: "Lazio",
        zipCode: "00176",
        sizeSqm: 300,
        maxCapacity: 50,
        amenities: ["natural_light", "wifi", "parking", "kitchen", "sound_system", "accessible"],
        hourlyRate: 100,
        dailyRate: 650,
        weeklyRate: 2800,
        minHours: 4,
        contactEmail: "giulia@spazioferri.it",
        contactPhone: "+39 06 9876543",
        latitude: 41.8898,
        longitude: 12.5257,
        photos: [
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
          "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&q=80",
        ],
      },
    ],
  },
  {
    user: { name: "Alessandro Conti", email: "alessandro.conti.studio@example.com" },
    profile: {
      businessName: "Showroom Conti",
      bio: "Showroom di moda a Firenze. Spazio elegante per presentazioni collezioni, fitting e trunk show.",
      city: "Firenze",
      region: "Toscana",
      phoneNumber: "+39 055 1122334",
      websiteUrl: "https://showroomconti.com",
    },
    studios: [
      {
        name: "Showroom Conti - Palazzo Tornabuoni",
        slug: "showroom-conti-palazzo-tornabuoni",
        description: "Showroom elegante nel centro storico di Firenze, a pochi passi da Via Tornabuoni. Spazio raffinato di 150mq con pavimenti in marmo, affreschi originali e illuminazione regolabile. Ideale per presentazioni di collezioni, trunk show e fitting. Disponibile appenderia professionale e zona private per clienti VIP.",
        studioType: "SHOWROOM",
        address: "Via della Vigna Nuova 12",
        city: "Firenze",
        region: "Toscana",
        zipCode: "50123",
        sizeSqm: 150,
        maxCapacity: 30,
        amenities: ["air_conditioning", "wifi", "changing_room", "accessible", "steamer"],
        dailyRate: 450,
        weeklyRate: 1800,
        minHours: 8,
        contactEmail: "info@showroomconti.com",
        contactPhone: "+39 055 1122334",
        latitude: 43.7710,
        longitude: 11.2486,
        photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        ],
      },
    ],
  },
  {
    user: { name: "Laura Moretti", email: "laura.moretti.studio@example.com" },
    profile: {
      businessName: "Studio Moretti",
      bio: "Studio fotografico boutique a Torino. Specializzato in ritratto, moda e contenuti per e-commerce.",
      city: "Torino",
      region: "Piemonte",
      phoneNumber: "+39 011 5566778",
    },
    studios: [
      {
        name: "Studio Moretti - White Box",
        slug: "studio-moretti-white-box",
        description: "Studio minimalista tutto bianco, perfetto per e-commerce e lookbook. 80mq con ciclorama, limbo e sistema di illuminazione Profoto incluso. Assistente tecnico disponibile su richiesta. Situato nel quartiere San Salvario, zona vivace e ben collegata.",
        studioType: "PHOTO_STUDIO",
        address: "Via Madama Cristina 78",
        city: "Torino",
        region: "Piemonte",
        zipCode: "10126",
        sizeSqm: 80,
        maxCapacity: 8,
        amenities: ["professional_lighting", "cyclorama", "backdrops", "wifi", "air_conditioning", "equipment_included"],
        hourlyRate: 45,
        dailyRate: 280,
        minHours: 2,
        contactEmail: "laura@studiomoretti.it",
        contactPhone: "+39 011 5566778",
        latitude: 45.0536,
        longitude: 7.6756,
        photos: [
          "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80",
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
          "https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=800&q=80",
        ],
      },
    ],
  },
  {
    user: { name: "Davide Russo", email: "davide.russo.studio@example.com" },
    profile: {
      businessName: "Russo Creative Hub",
      bio: "Spazio creativo e coworking per professionisti della moda a Napoli. Fotografia, design e produzione video.",
      city: "Napoli",
      region: "Campania",
    },
    studios: [
      {
        name: "Russo Creative Hub - Studio A",
        slug: "russo-creative-hub-studio-a",
        description: "Spazio polivalente di 120mq nel quartiere Chiaia. Utilizzabile come studio fotografico, sala prove per sfilate o spazio eventi. Altezza soffitto 4 metri, pavimento in resina grigia. Attrezzatura base inclusa, possibilità di noleggio kit avanzato. Vista sul Golfo di Napoli dalla terrazza accessoria.",
        studioType: "COWORKING",
        address: "Via Chiaia 200",
        city: "Napoli",
        region: "Campania",
        zipCode: "80121",
        sizeSqm: 120,
        maxCapacity: 15,
        amenities: ["professional_lighting", "wifi", "kitchen", "air_conditioning", "natural_light", "sound_system"],
        hourlyRate: 40,
        dailyRate: 250,
        weeklyRate: 1000,
        minHours: 2,
        contactEmail: "davide@russocreativehub.it",
        latitude: 40.8359,
        longitude: 14.2380,
        photos: [
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
        ],
      },
    ],
  },
  {
    user: { name: "Chiara Bianchi", email: "chiara.bianchi.studio@example.com" },
    profile: {
      businessName: "Bianchi Fashion Space",
      bio: "Sala prove e backstage per sfilate e fitting a Bologna. Esperienza decennale nel supporto a brand emergenti.",
      city: "Bologna",
      region: "Emilia-Romagna",
      phoneNumber: "+39 051 3344556",
    },
    studios: [
      {
        name: "Bianchi Fashion Space - Sala Prove",
        slug: "bianchi-fashion-space-sala-prove",
        description: "Sala prove professionale per sfilate e fitting di 180mq. Dotata di specchi a parete intera, appenderia su misura, zona trucco con 6 postazioni e area relax per i modelli. Pavimento in parquet e illuminazione regolabile. Perfetta per prove sfilata, casting e sessioni fitting prima degli eventi.",
        studioType: "REHEARSAL_SPACE",
        address: "Via Indipendenza 30",
        city: "Bologna",
        region: "Emilia-Romagna",
        zipCode: "40121",
        sizeSqm: 180,
        maxCapacity: 25,
        amenities: ["makeup_area", "changing_room", "wifi", "air_conditioning", "steamer", "accessible", "parking"],
        hourlyRate: 60,
        dailyRate: 380,
        minHours: 3,
        contactEmail: "info@bianchifashion.it",
        contactPhone: "+39 051 3344556",
        latitude: 44.4949,
        longitude: 11.3426,
        photos: [
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        ],
      },
    ],
  },
];

async function main() {
  console.log("🏢 Seeding studio data...\n");

  // Clean existing studio seed data
  const emails = studioData.map((d) => d.user.email);
  const existingUsers = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  if (existingUsers.length > 0) {
    console.log("  🧹 Cleaning existing studio seed data...");
    await prisma.user.deleteMany({ where: { id: { in: existingUsers.map((u) => u.id) } } });
  }

  const hashedPassword = await bcrypt.hash("password123", 12);
  const uploadDir = join(process.cwd(), "public", "uploads", "studios");
  await mkdir(uploadDir, { recursive: true });

  for (const data of studioData) {
    console.log(`  Creating user: ${data.user.name}...`);

    // Create studio user
    const user = await prisma.user.create({
      data: {
        name: data.user.name,
        email: data.user.email,
        hashedPassword,
        role: "STUDIO",
        locale: "it",
        emailVerified: new Date(),
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        studioProfile: {
          create: {
            businessName: data.profile.businessName,
            bio: data.profile.bio,
            city: data.profile.city,
            region: data.profile.region,
            phoneNumber: data.profile.phoneNumber,
            websiteUrl: data.profile.websiteUrl,
            vatNumber: data.profile.vatNumber,
            verificationStatus: "APPROVED" as VerificationStatus,
            verifiedAt: new Date(),
          },
        },
      },
      include: { studioProfile: true },
    });

    const studioProfileId = user.studioProfile!.id;

    for (const studio of data.studios) {
      console.log(`    Creating studio: ${studio.name}...`);

      const createdStudio = await prisma.studio.create({
        data: {
          studioProfileId,
          name: studio.name,
          slug: studio.slug,
          description: studio.description,
          studioType: studio.studioType,
          address: studio.address,
          city: studio.city,
          region: studio.region,
          zipCode: studio.zipCode,
          sizeSqm: studio.sizeSqm,
          maxCapacity: studio.maxCapacity,
          amenities: studio.amenities,
          hourlyRate: studio.hourlyRate,
          dailyRate: studio.dailyRate,
          weeklyRate: studio.weeklyRate,
          minHours: studio.minHours,
          contactEmail: studio.contactEmail,
          contactPhone: studio.contactPhone,
          latitude: studio.latitude,
          longitude: studio.longitude,
          status: "PUBLISHED",
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // Download and save photos
      for (let i = 0; i < studio.photos.length; i++) {
        const photoUrl = studio.photos[i];
        const filename = `${studio.slug}-${i + 1}-${Date.now()}.jpg`;
        const filepath = join(uploadDir, filename);

        try {
          console.log(`      📷 Downloading photo ${i + 1}/${studio.photos.length}...`);
          const buffer = await downloadImage(photoUrl);
          await writeFile(filepath, buffer);

          await prisma.studioImage.create({
            data: {
              studioId: createdStudio.id,
              url: `/uploads/studios/${filename}`,
              key: filename,
              order: i,
              isCover: i === 0,
            },
          });
        } catch (err) {
          console.warn(`      ⚠️  Failed to download photo: ${photoUrl}`, err);
        }
      }

      console.log(`    ✅ ${studio.name} created with ${studio.photos.length} photos`);
    }

    console.log(`  ✅ ${data.user.name} done\n`);
  }

  console.log("🏢 Studio seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
