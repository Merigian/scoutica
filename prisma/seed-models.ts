// Script to add 20 new model profiles with photos
// Run: npx tsx prisma/seed-models.ts

import { PrismaClient, Gender, EyeColor, HairColor, Ethnicity, ModelCategory, ProfessionalStatus, ProfileVisibility } from "@prisma/client";
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

const newModels = [
  {
    name: "Valentina Marchetti",
    email: "valentina.marchetti@example.com",
    profile: {
      slug: "valentina-marchetti",
      fullName: "Valentina Marchetti",
      bio: "Modella editoriale con base a Milano. Ho lavorato con Vogue Italia, Elle e Grazia. Appassionata di arte contemporanea.",
      dateOfBirth: new Date("2000-02-14"),
      gender: "FEMALE" as Gender,
      city: "Milano", region: "Lombardia",
      height: 176, bust: 83, waist: 61, hips: 89, shoeSize: 39, dressSize: "38",
      eyeColor: "GREEN" as EyeColor, hairColor: "BROWN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["EDITORIAL", "BEAUTY"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "fr"],
      instagramUrl: "https://instagram.com/valentinamarchetti", followerCount: 52000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 88,
    },
  },
  {
    name: "Alessandro Ferro",
    email: "alessandro.ferro@example.com",
    profile: {
      slug: "alessandro-ferro",
      fullName: "Alessandro Ferro",
      bio: "Modello e personal trainer. Specializzato in campagne fitness e sportswear. Collaboro con Nike e Adidas Italia.",
      dateOfBirth: new Date("1997-06-20"),
      gender: "MALE" as Gender,
      city: "Roma", region: "Lazio",
      height: 190, bust: 102, waist: 82, hips: 96, shoeSize: 44,
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["FITNESS", "COMMERCIAL", "SWIMWEAR"] as ModelCategory[],
      professionalStatus: "FREELANCE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/alessandroferro", followerCount: 38000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 82,
    },
  },
  {
    name: "Chiara De Luca",
    email: "chiara.deluca@example.com",
    profile: {
      slug: "chiara-de-luca",
      fullName: "Chiara De Luca",
      bio: "New face dalla Puglia. Altezza e portamento perfetti per la passerella. Sogno di sfilare alla Milano Fashion Week.",
      dateOfBirth: new Date("2003-09-10"),
      gender: "FEMALE" as Gender,
      city: "Bari", region: "Puglia",
      height: 180, bust: 81, waist: 59, hips: 87, shoeSize: 40, dressSize: "36",
      eyeColor: "BLUE" as EyeColor, hairColor: "BLONDE" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["RUNWAY", "EDITORIAL"] as ModelCategory[],
      professionalStatus: "NEW_FACE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      followerCount: 8500,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 70,
    },
  },
  {
    name: "Matteo Russo",
    email: "matteo.russo@example.com",
    profile: {
      slug: "matteo-russo",
      fullName: "Matteo Russo",
      bio: "Modello commerciale romano. Volto di diverse campagne televisive italiane. Esperienza anche come attore.",
      dateOfBirth: new Date("1996-12-03"),
      gender: "MALE" as Gender,
      city: "Roma", region: "Lazio",
      height: 186, bust: 99, waist: 79, hips: 94, shoeSize: 43,
      eyeColor: "HAZEL" as EyeColor, hairColor: "BROWN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["COMMERCIAL", "SHOWROOM"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "es"],
      instagramUrl: "https://instagram.com/matteorusso", followerCount: 29000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 85,
    },
  },
  {
    name: "Fatima El Amrani",
    email: "fatima.elamrani@example.com",
    profile: {
      slug: "fatima-el-amrani",
      fullName: "Fatima El Amrani",
      bio: "Italo-marocchina, modella beauty e hijabi fashion. Rappresento la diversit\u00e0 nella moda italiana.",
      dateOfBirth: new Date("2001-04-18"),
      gender: "FEMALE" as Gender,
      city: "Torino", region: "Piemonte",
      height: 173, bust: 85, waist: 64, hips: 91, shoeSize: 38, dressSize: "40",
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "MIDDLE_EASTERN" as Ethnicity,
      categories: ["BEAUTY", "COMMERCIAL", "EDITORIAL"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "ar", "fr", "en"],
      instagramUrl: "https://instagram.com/fatimaelamrani", followerCount: 75000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 91,
    },
  },
  {
    name: "Davide Colombo",
    email: "davide.colombo@example.com",
    profile: {
      slug: "davide-colombo",
      fullName: "Davide Colombo",
      bio: "Modello runway con 3 anni di esperienza. Ho sfilato per Prada, Armani e Dolce & Gabbana.",
      dateOfBirth: new Date("1999-08-27"),
      gender: "MALE" as Gender,
      city: "Milano", region: "Lombardia",
      height: 192, bust: 97, waist: 76, hips: 92, shoeSize: 44,
      eyeColor: "BLUE" as EyeColor, hairColor: "BLONDE" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["RUNWAY", "EDITORIAL", "FITTING"] as ModelCategory[],
      professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "de"],
      instagramUrl: "https://instagram.com/davidecolombo", followerCount: 95000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 94,
    },
  },
  {
    name: "Serena Vitale",
    email: "serena.vitale@example.com",
    profile: {
      slug: "serena-vitale",
      fullName: "Serena Vitale",
      bio: "Modella lingerie e swimwear. Collaboro con i principali brand di intimo italiani. Body positive advocate.",
      dateOfBirth: new Date("1998-11-22"),
      gender: "FEMALE" as Gender,
      city: "Napoli", region: "Campania",
      height: 174, bust: 90, waist: 65, hips: 95, shoeSize: 38, dressSize: "40",
      eyeColor: "BROWN" as EyeColor, hairColor: "AUBURN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["LINGERIE", "SWIMWEAR", "BEAUTY"] as ModelCategory[],
      professionalStatus: "FREELANCE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/serenavitale", followerCount: 43000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 80,
    },
  },
  {
    name: "Kevin Okafor",
    email: "kevin.okafor@example.com",
    profile: {
      slug: "kevin-okafor",
      fullName: "Kevin Okafor",
      bio: "Nato a Lagos, vivo a Milano da 10 anni. Modello editoriale e runway per brand di lusso.",
      dateOfBirth: new Date("2000-03-15"),
      gender: "MALE" as Gender,
      city: "Milano", region: "Lombardia",
      height: 191, bust: 100, waist: 78, hips: 93, shoeSize: 45,
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "AFRICAN" as Ethnicity,
      categories: ["RUNWAY", "EDITORIAL", "COMMERCIAL"] as ModelCategory[],
      professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/kevinokafor", followerCount: 110000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 93,
    },
  },
  {
    name: "Francesca Moretti",
    email: "francesca.moretti@example.com",
    profile: {
      slug: "francesca-moretti",
      fullName: "Francesca Moretti",
      bio: "Modella petite con grande personalit\u00e0. Specializzata in campagne commercial e social media content.",
      dateOfBirth: new Date("2002-07-08"),
      gender: "FEMALE" as Gender,
      city: "Bologna", region: "Emilia-Romagna",
      height: 165, bust: 82, waist: 60, hips: 88, shoeSize: 37, dressSize: "38",
      eyeColor: "AMBER" as EyeColor, hairColor: "RED" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["PETITE", "COMMERCIAL"] as ModelCategory[],
      professionalStatus: "NEW_FACE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/francescamoretti", followerCount: 22000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 75,
    },
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    profile: {
      slug: "yuki-tanaka",
      fullName: "Yuki Tanaka",
      bio: "Italo-giapponese. Modello androgino con un look unico. Lavoro tra Tokyo e Milano.",
      dateOfBirth: new Date("2001-01-30"),
      gender: "MALE" as Gender,
      city: "Milano", region: "Lombardia",
      height: 183, bust: 92, waist: 72, hips: 88, shoeSize: 42,
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "ASIAN" as Ethnicity,
      categories: ["EDITORIAL", "RUNWAY", "BEAUTY"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "ja", "en"],
      instagramUrl: "https://instagram.com/yukitanaka", followerCount: 67000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 87,
    },
  },
  {
    name: "Camilla Gallo",
    email: "camilla.gallo@example.com",
    profile: {
      slug: "camilla-gallo",
      fullName: "Camilla Gallo",
      bio: "Modella curvy e influencer. Collaboro con Fenty, H&M e Zara per le loro linee inclusive.",
      dateOfBirth: new Date("1997-05-12"),
      gender: "FEMALE" as Gender,
      city: "Firenze", region: "Toscana",
      height: 175, bust: 102, waist: 82, hips: 112, shoeSize: 39, dressSize: "46",
      eyeColor: "GREEN" as EyeColor, hairColor: "BLONDE" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["PLUS_SIZE", "COMMERCIAL", "LINGERIE"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/camillagallo", followerCount: 180000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 90,
    },
  },
  {
    name: "Diego Santini",
    email: "diego.santini@example.com",
    profile: {
      slug: "diego-santini",
      fullName: "Diego Santini",
      bio: "Ex nuotatore professionista. Ora modello swimwear e fitness. Testimonial di brand sportivi.",
      dateOfBirth: new Date("1995-10-05"),
      gender: "MALE" as Gender,
      city: "Genova", region: "Liguria",
      height: 187, bust: 104, waist: 80, hips: 95, shoeSize: 43,
      eyeColor: "GRAY" as EyeColor, hairColor: "BROWN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["SWIMWEAR", "FITNESS", "COMMERCIAL"] as ModelCategory[],
      professionalStatus: "FREELANCE" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "pt"],
      instagramUrl: "https://instagram.com/diegosantini", followerCount: 56000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 83,
    },
  },
  {
    name: "Lucia Ferrara",
    email: "lucia.ferrara@example.com",
    profile: {
      slug: "lucia-ferrara",
      fullName: "Lucia Ferrara",
      bio: "Modella e studentessa di architettura. Look mediterraneo classico. Campagne per brand di gioielleria.",
      dateOfBirth: new Date("2001-12-20"),
      gender: "FEMALE" as Gender,
      city: "Palermo", region: "Sicilia",
      height: 171, bust: 84, waist: 62, hips: 90, shoeSize: 38, dressSize: "38",
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["BEAUTY", "COMMERCIAL"] as ModelCategory[],
      professionalStatus: "NEW_FACE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      followerCount: 5200,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 65,
    },
  },
  {
    name: "Samuel Abate",
    email: "samuel.abate@example.com",
    profile: {
      slug: "samuel-abate",
      fullName: "Samuel Abate",
      bio: "Italo-eritreo. Modello editoriale con look versatile. Pubblicato su GQ Italia e L'Uomo Vogue.",
      dateOfBirth: new Date("1999-02-25"),
      gender: "MALE" as Gender,
      city: "Roma", region: "Lazio",
      height: 188, bust: 96, waist: 75, hips: 91, shoeSize: 43,
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "MIXED" as Ethnicity,
      categories: ["EDITORIAL", "RUNWAY"] as ModelCategory[],
      professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/samuelabate", followerCount: 88000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 89,
    },
  },
  {
    name: "Isabella Romano",
    email: "isabella.romano@example.com",
    profile: {
      slug: "isabella-romano",
      fullName: "Isabella Romano",
      bio: "Modella showroom con esperienza ventennale nel settore. Lavoro stabilmente con le maison di Milano.",
      dateOfBirth: new Date("1993-08-16"),
      gender: "FEMALE" as Gender,
      city: "Milano", region: "Lombardia",
      height: 177, bust: 86, waist: 63, hips: 91, shoeSize: 39, dressSize: "40",
      eyeColor: "HAZEL" as EyeColor, hairColor: "BROWN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["SHOWROOM", "FITTING", "RUNWAY"] as ModelCategory[],
      professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "fr", "de"],
      instagramUrl: "https://instagram.com/isabellaromano", followerCount: 34000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 92,
    },
  },
  {
    name: "Nicol\u00f2 Benedetti",
    email: "nicolo.benedetti@example.com",
    profile: {
      slug: "nicolo-benedetti",
      fullName: "Nicol\u00f2 Benedetti",
      bio: "Nuovo volto scoperto a Pitti Uomo. Look classico italiano. Disponibile per shooting e sfilate.",
      dateOfBirth: new Date("2003-04-11"),
      gender: "MALE" as Gender,
      city: "Firenze", region: "Toscana",
      height: 184, bust: 95, waist: 74, hips: 90, shoeSize: 42,
      eyeColor: "GREEN" as EyeColor, hairColor: "BROWN" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["COMMERCIAL", "SHOWROOM"] as ModelCategory[],
      professionalStatus: "NEW_FACE" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      followerCount: 3800,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 68,
    },
  },
  {
    name: "Carmen Silva",
    email: "carmen.silva@example.com",
    profile: {
      slug: "carmen-silva",
      fullName: "Carmen Silva",
      bio: "Brasiliana di origini, italiana di adozione. Modella fitness e wellness con un forte seguito sui social.",
      dateOfBirth: new Date("1998-06-28"),
      gender: "FEMALE" as Gender,
      city: "Verona", region: "Veneto",
      height: 170, bust: 88, waist: 64, hips: 94, shoeSize: 38, dressSize: "40",
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "LATINO" as Ethnicity,
      categories: ["FITNESS", "SWIMWEAR", "COMMERCIAL"] as ModelCategory[],
      professionalStatus: "FREELANCE" as ProfessionalStatus,
      spokenLanguages: ["it", "pt", "en", "es"],
      instagramUrl: "https://instagram.com/carmensilva", followerCount: 145000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 86,
    },
  },
  {
    name: "Andrea Pellegrini",
    email: "andrea.pellegrini@example.com",
    profile: {
      slug: "andrea-pellegrini",
      fullName: "Andrea Pellegrini",
      bio: "Modello e influencer lifestyle. Collaboro con brand di moda maschile premium. Content creator.",
      dateOfBirth: new Date("2000-11-02"),
      gender: "MALE" as Gender,
      city: "Bologna", region: "Emilia-Romagna",
      height: 185, bust: 97, waist: 77, hips: 93, shoeSize: 43,
      eyeColor: "BLUE" as EyeColor, hairColor: "BLONDE" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["COMMERCIAL", "EDITORIAL"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/andreapellegrini", followerCount: 62000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 84,
    },
  },
  {
    name: "Marta Esposito",
    email: "marta.esposito@example.com",
    profile: {
      slug: "marta-esposito",
      fullName: "Marta Esposito",
      bio: "Modella alta moda con base a Napoli. Look mediterraneo sofisticato. Lavoro con brand di lusso italiani.",
      dateOfBirth: new Date("1999-03-07"),
      gender: "FEMALE" as Gender,
      city: "Napoli", region: "Campania",
      height: 179, bust: 83, waist: 60, hips: 88, shoeSize: 40, dressSize: "38",
      eyeColor: "BROWN" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["RUNWAY", "EDITORIAL", "BEAUTY"] as ModelCategory[],
      professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
      spokenLanguages: ["it", "en", "fr"],
      instagramUrl: "https://instagram.com/martaesposito", followerCount: 71000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 91,
    },
  },
  {
    name: "Tommaso Greco",
    email: "tommaso.greco@example.com",
    profile: {
      slug: "tommaso-greco",
      fullName: "Tommaso Greco",
      bio: "Modello commercial e attore. Volto noto in campagne pubblicitarie nazionali. Sguardo intenso e versatile.",
      dateOfBirth: new Date("1996-09-19"),
      gender: "MALE" as Gender,
      city: "Catania", region: "Sicilia",
      height: 183, bust: 98, waist: 78, hips: 94, shoeSize: 42,
      eyeColor: "AMBER" as EyeColor, hairColor: "BLACK" as HairColor,
      ethnicity: "CAUCASIAN" as Ethnicity,
      categories: ["COMMERCIAL", "FITNESS"] as ModelCategory[],
      professionalStatus: "EXPERIENCED" as ProfessionalStatus,
      spokenLanguages: ["it", "en"],
      instagramUrl: "https://instagram.com/tommasogreco", followerCount: 41000,
      visibility: "PUBLIC" as ProfileVisibility,
      isPublished: true, publishedAt: new Date(), completenessScore: 79,
    },
  },
];

async function main() {
  console.log("Adding 20 new model profiles...\n");

  const hashedPassword = await bcrypt.hash("password123", 12);
  const uploadDir = join(process.cwd(), "public", "uploads", "portfolio");
  await mkdir(uploadDir, { recursive: true });

  let created = 0;

  for (let mi = 0; mi < newModels.length; mi++) {
    const m = newModels[mi];

    const existing = await prisma.user.findUnique({ where: { email: m.email } });
    if (existing) {
      console.log(`  Skip ${m.name} (already exists)`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        hashedPassword,
        role: "MODEL",
        locale: "it",
        emailVerified: new Date(),
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        modelProfile: { create: m.profile },
      },
      include: { modelProfile: true },
    });

    const profileId = user.modelProfile!.id;

    // Download 3 photos per model from picsum.photos
    for (let i = 0; i < 3; i++) {
      const seed = (mi + 1) * 100 + i;
      const imgUrl = `https://picsum.photos/seed/${seed}/600/800`;
      const filename = `${profileId}-${Date.now()}-${i}.jpg`;
      const filepath = join(uploadDir, filename);

      try {
        console.log(`    Photo ${i + 1}/3 for ${m.name}...`);
        const buffer = await downloadImage(imgUrl);
        await writeFile(filepath, buffer);

        await prisma.portfolioImage.create({
          data: {
            modelProfileId: profileId,
            url: `/uploads/portfolio/${filename}`,
            key: `portfolio/${filename}`,
            width: 600,
            height: 800,
            sizeBytes: buffer.length,
            order: i,
            isCover: i === 0,
          },
        });
      } catch (err) {
        console.log(`    Failed photo for ${m.name}, using placeholder URL`);
        await prisma.portfolioImage.create({
          data: {
            modelProfileId: profileId,
            url: `https://picsum.photos/seed/${seed}/600/800`,
            key: `placeholder/${seed}`,
            width: 600,
            height: 800,
            order: i,
            isCover: i === 0,
          },
        });
      }
    }

    created++;
    console.log(`  Done: ${m.name} (${m.profile.gender}) - ${m.profile.city}`);
  }

  console.log(`\n${created} new model profiles created.`);
  console.log("Password for all: password123");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
