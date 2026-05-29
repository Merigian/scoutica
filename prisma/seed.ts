import { PrismaClient, UserRole, ScoutSubtype, Gender, EyeColor, HairColor, Ethnicity, ModelCategory, ProfessionalStatus, ProfileVisibility, VerificationStatus, PlanTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.castingApplication.deleteMany();
  await prisma.casting.deleteMany();
  await prisma.shortlistItem.deleteMany();
  await prisma.shortlistBoard.deleteMany();
  await prisma.privateNote.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.boost.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.modelProfile.deleteMany();
  await prisma.scoutProfile.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 12);

  // ── ADMIN ────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin Scoutica",
      email: "admin@scoutica.it",
      hashedPassword,
      image: "https://i.pravatar.cc/150?u=admin@scoutica.it",
      role: "ADMIN",
      locale: "it",
      emailVerified: new Date(),
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
    },
  });
  console.log("  ✅ Admin created");

  // ── MODELS ───────────────────────────────────────────────
  const models = [
    {
      name: "Giulia Rossi",
      email: "giulia@example.com",
      profile: {
        slug: "giulia-rossi",
        fullName: "Giulia Rossi",
        bio: "Modella professionista con 5 anni di esperienza nel settore moda. Disponibile per sfilate, campagne pubblicitarie e shooting editoriali.",
        dateOfBirth: new Date("1999-03-15"),
        gender: "FEMALE" as Gender,
        city: "Milano",
        region: "Lombardia",
        height: 178,
        bust: 84,
        waist: 62,
        hips: 90,
        shoeSize: 39,
        dressSize: "38",
        eyeColor: "GREEN" as EyeColor,
        hairColor: "BROWN" as HairColor,
        ethnicity: "CAUCASIAN" as Ethnicity,
        categories: ["EDITORIAL", "RUNWAY", "BEAUTY"] as ModelCategory[],
        professionalStatus: "EXPERIENCED" as ProfessionalStatus,
        spokenLanguages: ["it", "en", "fr"],
        instagramUrl: "https://instagram.com/giuliarossi",
        followerCount: 45000,
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 85,
      },
    },
    {
      name: "Marco Bianchi",
      email: "marco@example.com",
      profile: {
        slug: "marco-bianchi",
        fullName: "Marco Bianchi",
        bio: "Nuovo volto della moda maschile italiana. Appassionato di fitness e lifestyle.",
        dateOfBirth: new Date("2001-07-22"),
        gender: "MALE" as Gender,
        city: "Roma",
        region: "Lazio",
        height: 188,
        bust: 100,
        waist: 80,
        hips: 96,
        shoeSize: 43,
        eyeColor: "BROWN" as EyeColor,
        hairColor: "BLACK" as HairColor,
        ethnicity: "CAUCASIAN" as Ethnicity,
        categories: ["COMMERCIAL", "FITNESS"] as ModelCategory[],
        professionalStatus: "NEW_FACE" as ProfessionalStatus,
        spokenLanguages: ["it", "en"],
        instagramUrl: "https://instagram.com/marcobianchi",
        followerCount: 12000,
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 72,
      },
    },
    {
      name: "Elena Conti",
      email: "elena@example.com",
      profile: {
        slug: "elena-conti",
        fullName: "Elena Conti",
        bio: "Modella curvy con esperienza in commercial e swimwear. Credo nella body positivity.",
        dateOfBirth: new Date("1997-11-08"),
        gender: "FEMALE" as Gender,
        city: "Napoli",
        region: "Campania",
        height: 172,
        bust: 100,
        waist: 78,
        hips: 108,
        shoeSize: 38,
        dressSize: "44",
        eyeColor: "HAZEL" as EyeColor,
        hairColor: "BLONDE" as HairColor,
        ethnicity: "CAUCASIAN" as Ethnicity,
        categories: ["PLUS_SIZE", "SWIMWEAR", "COMMERCIAL"] as ModelCategory[],
        professionalStatus: "FREELANCE" as ProfessionalStatus,
        spokenLanguages: ["it", "en", "es"],
        instagramUrl: "https://instagram.com/elenaconti",
        followerCount: 28000,
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 78,
      },
    },
    {
      name: "Amara Diallo",
      email: "amara@example.com",
      profile: {
        slug: "amara-diallo",
        fullName: "Amara Diallo",
        bio: "Nata in Senegal, cresciuta a Firenze. Esperienza in passerella per brand di lusso italiani.",
        dateOfBirth: new Date("2000-05-30"),
        gender: "FEMALE" as Gender,
        city: "Firenze",
        region: "Toscana",
        height: 180,
        bust: 82,
        waist: 60,
        hips: 88,
        shoeSize: 40,
        dressSize: "36",
        eyeColor: "BROWN" as EyeColor,
        hairColor: "BLACK" as HairColor,
        ethnicity: "AFRICAN" as Ethnicity,
        categories: ["RUNWAY", "EDITORIAL", "BEAUTY"] as ModelCategory[],
        professionalStatus: "AGENCY_REPRESENTED" as ProfessionalStatus,
        spokenLanguages: ["it", "en", "fr"],
        instagramUrl: "https://instagram.com/amaradiallo",
        followerCount: 67000,
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 92,
      },
    },
    {
      name: "Luca Ferrari",
      email: "luca@example.com",
      profile: {
        slug: "luca-ferrari",
        fullName: "Luca Ferrari",
        bio: "Modello e attore. Specializzato in campagne lifestyle e showroom.",
        dateOfBirth: new Date("1998-09-14"),
        gender: "MALE" as Gender,
        city: "Torino",
        region: "Piemonte",
        height: 185,
        bust: 98,
        waist: 78,
        hips: 94,
        shoeSize: 42,
        eyeColor: "BLUE" as EyeColor,
        hairColor: "BLONDE" as HairColor,
        ethnicity: "CAUCASIAN" as Ethnicity,
        categories: ["SHOWROOM", "COMMERCIAL", "FITTING"] as ModelCategory[],
        professionalStatus: "EXPERIENCED" as ProfessionalStatus,
        spokenLanguages: ["it", "en"],
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 68,
      },
    },
    {
      name: "Sofia Chen",
      email: "sofia@example.com",
      profile: {
        slug: "sofia-chen",
        fullName: "Sofia Chen",
        bio: "Italo-cinese, modella beauty e lingerie. Beauty brand ambassador.",
        dateOfBirth: new Date("2002-01-25"),
        gender: "FEMALE" as Gender,
        city: "Milano",
        region: "Lombardia",
        height: 170,
        bust: 80,
        waist: 58,
        hips: 86,
        shoeSize: 37,
        dressSize: "36",
        eyeColor: "BROWN" as EyeColor,
        hairColor: "BLACK" as HairColor,
        ethnicity: "ASIAN" as Ethnicity,
        categories: ["BEAUTY", "LINGERIE", "EDITORIAL"] as ModelCategory[],
        professionalStatus: "EXPERIENCED" as ProfessionalStatus,
        spokenLanguages: ["it", "en", "zh"],
        instagramUrl: "https://instagram.com/sofiachen",
        tiktokUrl: "https://tiktok.com/@sofiachen",
        followerCount: 120000,
        visibility: "PUBLIC" as ProfileVisibility,
        isPublished: true,
        publishedAt: new Date(),
        completenessScore: 90,
      },
    },
  ];

  const createdModels = [];
  for (const m of models) {
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        hashedPassword,
        image: `https://i.pravatar.cc/150?u=${m.email}`,
        role: "MODEL",
        locale: "it",
        emailVerified: new Date(),
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        modelProfile: { create: m.profile },
      },
      include: { modelProfile: true },
    });
    createdModels.push(user);
  }
  console.log(`  ✅ ${models.length} models created`);

  // ── PORTFOLIO IMAGES ─────────────────────────────────────
  // Assign existing on-disk photos to seeded model profiles
  const photoGroups = [
    ["cmmtdbe1g00020956racy3bf0-human-0.jpg", "cmmtdbe1g00020956racy3bf0-human-1.jpg", "cmmtdbe1g00020956racy3bf0-human-2.jpg"],
    ["cmmtdbenf000b0956zoc40v4l-human-0.jpg", "cmmtdbenf000b0956zoc40v4l-human-1.jpg", "cmmtdbenf000b0956zoc40v4l-human-2.jpg"],
    ["cmmtdbf3n000k095605pb77lw-human-0.jpg", "cmmtdbf3n000k095605pb77lw-human-1.jpg", "cmmtdbf3n000k095605pb77lw-human-2.jpg"],
    ["cmmtdbfja000t0956uja9us62-human-0.jpg", "cmmtdbfja000t0956uja9us62-human-1.jpg", "cmmtdbfja000t0956uja9us62-human-2.jpg"],
    ["cmmtdbfyn00120956kikn9adm-human-0.jpg", "cmmtdbfyn00120956kikn9adm-human-1.jpg", "cmmtdbfyn00120956kikn9adm-human-2.jpg"],
    ["cmmtdbgea001b0956twm8ijfx-human-0.jpg", "cmmtdbgea001b0956twm8ijfx-human-1.jpg", "cmmtdbgea001b0956twm8ijfx-human-2.jpg"],
  ];
  for (let i = 0; i < createdModels.length && i < photoGroups.length; i++) {
    const profileId = createdModels[i].modelProfile!.id;
    const photos = photoGroups[i];
    await prisma.portfolioImage.createMany({
      data: photos.map((filename, j) => ({
        modelProfileId: profileId,
        url: `/uploads/portfolio/${filename}`,
        key: `portfolio/${filename}`,
        width: 600,
        height: 800,
        sizeBytes: 50000,
        order: j,
        isCover: j === 0,
      })),
    });
  }
  console.log("  ✅ Portfolio images assigned to models");

  // ── SCOUTS ───────────────────────────────────────────────
  const scouts = [
    {
      name: "Stella Moda Agency",
      email: "stella@agency.com",
      profile: {
        subtype: "AGENCY" as ScoutSubtype,
        businessName: "Stella Moda Agency",
        roleTitle: "Direttore Casting",
        bio: "Agenzia di moda con sede a Milano, specializzata in talenti emergenti per l'alta moda.",
        city: "Milano",
        professionalEmail: "casting@stellamoda.com",
        websiteUrl: "https://stellamoda.com",
        socialProfileUrl: "https://linkedin.com/company/stellamoda",
        vatNumber: "IT12345678901",
        verificationStatus: "APPROVED" as VerificationStatus,
        verifiedAt: new Date(),
      },
      plan: "PRO" as PlanTier,
    },
    {
      name: "Alessandro Moretti",
      email: "alessandro@example.com",
      profile: {
        subtype: "SCOUT" as ScoutSubtype,
        businessName: "Moretti Scouting",
        roleTitle: "Talent Scout",
        bio: "Talent scout freelance con 10 anni di esperienza. Collaboro con i principali brand italiani.",
        city: "Roma",
        professionalEmail: "alessandro@morettiscouting.it",
        verificationStatus: "APPROVED" as VerificationStatus,
        verifiedAt: new Date(),
      },
      plan: "STARTER" as PlanTier,
    },
    {
      name: "Fashion Brand Italia",
      email: "brand@example.com",
      profile: {
        subtype: "BRAND" as ScoutSubtype,
        businessName: "Fashion Brand Italia",
        city: "Firenze",
        professionalEmail: "hr@fashionbranditalia.com",
        websiteUrl: "https://fashionbranditalia.com",
        verificationStatus: "PENDING" as VerificationStatus,
      },
      plan: "FREE" as PlanTier,
    },
  ];

  const createdScouts = [];
  for (const s of scouts) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        hashedPassword,
        image: `https://i.pravatar.cc/150?u=${s.email}`,
        role: "SCOUT",
        locale: "it",
        emailVerified: new Date(),
        subscription: { create: { plan: s.plan, status: "ACTIVE" } },
        scoutProfile: { create: s.profile },
      },
      include: { scoutProfile: true },
    });
    createdScouts.push(user);
  }
  console.log(`  ✅ ${scouts.length} scouts created`);

  // ── CASTINGS ─────────────────────────────────────────────
  const stellaScout = createdScouts[0];
  if (stellaScout?.scoutProfile) {
    const casting = await prisma.casting.create({
      data: {
        scoutProfileId: stellaScout.scoutProfile.id,
        title: "Casting Campagna Primavera/Estate 2025",
        description: "Cerchiamo modelle e modelli per la nuova campagna pubblicitaria SS25 di un importante brand di moda italiano. Lo shooting si terrà a Milano presso studi fotografici professionali.\n\nRequisiti:\n- Età 18-30\n- Esperienza in shooting editoriali\n- Portfolio professionale",
        city: "Milano",
        region: "Lombardia",
        castingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        requirements: "Altezza minima: Donne 175cm, Uomini 183cm\nEsperienza in shooting editoriali\nPortfolio professionale aggiornato",
        compensation: "€800/giorno + usage fee",
        isPaid: true,
        spots: 6,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.casting.create({
      data: {
        scoutProfileId: stellaScout.scoutProfile.id,
        title: "Fitting Models per Fashion Week Milano",
        description: "Servono fitting models per la preparazione della Fashion Week di Milano. Contratto di 3 giorni con possibilità di estensione.",
        city: "Milano",
        region: "Lombardia",
        castingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        requirements: "Taglia 38 (donna) o 48 (uomo)\nDisponibilità per 3 giorni consecutivi",
        compensation: "€500/giorno",
        isPaid: true,
        spots: 4,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    console.log("  ✅ 2 castings created");

    // ── SHORTLIST BOARD ──────────────────────────────────────
    const board = await prisma.shortlistBoard.create({
      data: {
        scoutProfileId: stellaScout.scoutProfile.id,
        name: "Campagna SS25 — Shortlist",
        description: "Candidati selezionati per la campagna primavera/estate",
      },
    });

    // Add some models to the board
    if (createdModels[0]?.modelProfile && createdModels[3]?.modelProfile) {
      await prisma.shortlistItem.createMany({
        data: [
          { boardId: board.id, modelProfileId: createdModels[0].modelProfile.id, pipelineStage: "SHORTLISTED" },
          { boardId: board.id, modelProfileId: createdModels[3].modelProfile.id, pipelineStage: "CONTACTED" },
        ],
      });
    }
    console.log("  ✅ Shortlist board created with items");
  }

  // ── CONVERSATIONS & MESSAGES ────────────────────────────
  const stellaUser = createdScouts[0];
  const modelGiulia = createdModels[0];
  const modelMarco = createdModels[1];
  const modelSofia = createdModels[2];
  const modelLuca = createdModels[3];

  // Conversation 1: Stella <-> Giulia (active, many messages)
  const conv1 = await prisma.conversation.create({
    data: {
      lastMessageAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      participants: {
        create: [
          { userId: stellaUser.id, lastReadAt: new Date(Date.now() - 30 * 60 * 1000) },
          { userId: modelGiulia.id, lastReadAt: new Date() },
        ],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, senderId: stellaUser.id, body: "Ciao Giulia! Ho visto il tuo portfolio, sei perfetta per la nostra campagna SS25. Ti interessa?", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { conversationId: conv1.id, senderId: modelGiulia.id, body: "Ciao! Grazie mille, sono molto interessata. Puoi darmi più dettagli?", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) },
      { conversationId: conv1.id, senderId: stellaUser.id, body: "Certo! Si tratta di uno shooting per un brand di alta moda a Milano. 3 giorni di lavoro, compenso €800/giorno più usage fee.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000) },
      { conversationId: conv1.id, senderId: modelGiulia.id, body: "Fantastico! Quando sarebbe lo shooting?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { conversationId: conv1.id, senderId: stellaUser.id, body: "Tra due settimane, dal 25 al 27. Riusciresti a essere disponibile?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { conversationId: conv1.id, senderId: modelGiulia.id, body: "Sì, sono libera quei giorni! Devo portare qualcosa di specifico?", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { conversationId: conv1.id, senderId: stellaUser.id, body: "Perfetto! Ti mando il brief dettagliato via email. Porta biancheria intima neutra e scarpe con tacco 10cm.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { conversationId: conv1.id, senderId: modelGiulia.id, body: "Ricevuto, grazie! Non vedo l'ora 😊", createdAt: new Date(Date.now() - 10 * 60 * 1000) },
    ],
  });

  // Conversation 2: Stella <-> Marco (recent)
  const conv2 = await prisma.conversation.create({
    data: {
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      participants: {
        create: [
          { userId: stellaUser.id, lastReadAt: new Date() },
          { userId: modelMarco.id, lastReadAt: new Date() },
        ],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv2.id, senderId: stellaUser.id, body: "Ciao Marco, ti scrivo per un fitting durante la Fashion Week. Saresti disponibile?", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { conversationId: conv2.id, senderId: modelMarco.id, body: "Ciao! Sì, mi interessa molto. Quali sono le date?", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { conversationId: conv2.id, senderId: stellaUser.id, body: "Dal 18 al 20 del mese prossimo. Compenso €500/giorno. Taglia 48, confermi?", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { conversationId: conv2.id, senderId: modelMarco.id, body: "Confermo taglia 48. Sono disponibile, procediamo!", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
  });

  // Conversation 3: Stella <-> Sofia (unread messages from Sofia)
  const conv3 = await prisma.conversation.create({
    data: {
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      participants: {
        create: [
          { userId: stellaUser.id, lastReadAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { userId: modelSofia.id, lastReadAt: new Date() },
        ],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv3.id, senderId: stellaUser.id, body: "Buongiorno Sofia! Complimenti per il tuo book, hai uno stile molto interessante.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { conversationId: conv3.id, senderId: modelSofia.id, body: "Grazie mille! Sono appena arrivata a Milano e sto cercando opportunità.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000) },
      { conversationId: conv3.id, senderId: stellaUser.id, body: "Ottimo timing! Abbiamo diverse opportunità per nuovi volti. Possiamo organizzare un incontro?", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { conversationId: conv3.id, senderId: modelSofia.id, body: "Certamente! Quando sareste disponibili?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { conversationId: conv3.id, senderId: modelSofia.id, body: "Scusate, volevo anche chiedere: devo portare il mio portfolio stampato o basta quello digitale?", createdAt: new Date(Date.now() - 30 * 60 * 1000) },
    ],
  });

  // Conversation 4: Stella <-> Luca (older conversation)
  const conv4 = await prisma.conversation.create({
    data: {
      lastMessageAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      participants: {
        create: [
          { userId: stellaUser.id, lastReadAt: new Date() },
          { userId: modelLuca.id, lastReadAt: new Date() },
        ],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv4.id, senderId: modelLuca.id, body: "Buongiorno, ho visto il vostro casting per la campagna SS25. Posso candidarmi?", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { conversationId: conv4.id, senderId: stellaUser.id, body: "Ciao Luca! Certo, abbiamo guardato il tuo profilo e ci piace molto. Ti mandiamo i dettagli.", createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { conversationId: conv4.id, senderId: modelLuca.id, body: "Grazie! Aspetto vostre notizie.", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ],
  });

  console.log("  ✅ 4 conversations with messages created");

  // ── SITE SETTINGS ─────────────────────────────────────────
  await prisma.siteSettings.create({
    data: { key: "scout_gate_open", value: "true" },
  });
  console.log("  ✅ Site settings created (scout gate open)");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Demo accounts:");
  console.log("   Admin:  admin@scoutica.it / password123");
  console.log("   Model:  giulia@example.com / password123");
  console.log("   Scout:  stella@agency.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
