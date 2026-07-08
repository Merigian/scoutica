// Targeted, idempotent test data for the model account giulia@example.com.
// Adds: castings (cast) + contact requests (richieste) + applications
// (candidature) + matching notifications, so her dashboard, /model/contacts
// and /model/applications look realistic.
//
// SAFE TO RE-RUN: uses upserts / find-guards and does NOT wipe unrelated data
// (unlike prisma/seed-activity.ts, which clears all activity first).
//
// Run: npx tsx prisma/seed-giulia-test.ts

import {
  PrismaClient,
  type ScoutSubtype,
  type ContactReason,
  type ApplicationStatus,
  type ContactRequestStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GIULIA_EMAIL = "giulia@example.com";

const daysFromNow = (d: number) => new Date(Date.now() + d * 864e5);
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5);
const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5);

async function main() {
  console.log(`🎯 Seeding test data for ${GIULIA_EMAIL}…\n`);

  // ── Giulia ────────────────────────────────────────────────
  const giulia = await prisma.user.findUnique({
    where: { email: GIULIA_EMAIL },
    include: { modelProfile: true },
  });
  if (!giulia?.modelProfile) {
    console.error(
      `❌ ${GIULIA_EMAIL} not found (or has no model profile). Run \`npm run db:seed\` first.`,
    );
    return;
  }
  const mp = giulia.modelProfile;
  console.log(`  Model: ${mp.fullName} · ${mp.city ?? "—"} · profile ${mp.id}`);

  // ── Scout pool: reuse existing APPROVED scouts, top up to 4 ────
  const hashedPassword = await bcrypt.hash("password123", 12);
  const testScoutDefs: {
    name: string;
    email: string;
    subtype: ScoutSubtype;
    businessName: string;
    city: string;
  }[] = [
    { name: "Vogue Talents Italia", email: "casting.vogue@scoutica.test", subtype: "AGENCY", businessName: "Vogue Talents Italia", city: "Milano" },
    { name: "Elite Model Milano", email: "casting.elite@scoutica.test", subtype: "AGENCY", businessName: "Elite Model Milano", city: "Milano" },
    { name: "Riviera Brand Studio", email: "casting.riviera@scoutica.test", subtype: "BRAND", businessName: "Riviera Brand Studio", city: "Genova" },
    { name: "Firenze Fashion Scouting", email: "casting.firenze@scoutica.test", subtype: "SCOUT", businessName: "Firenze Fashion Scouting", city: "Firenze" },
  ];

  type Scout = { id: string; userId: string; name: string | null };
  const pool: Scout[] = [];

  const existingApproved = await prisma.scoutProfile.findMany({
    where: { verificationStatus: "APPROVED" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const sp of existingApproved) {
    pool.push({ id: sp.id, userId: sp.user.id, name: sp.user.name });
  }

  for (const def of testScoutDefs) {
    if (pool.length >= 4) break;
    const user = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: {
        name: def.name,
        email: def.email,
        hashedPassword,
        role: "SCOUT",
        locale: "it",
        emailVerified: new Date(),
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        scoutProfile: {
          create: {
            subtype: def.subtype,
            businessName: def.businessName,
            city: def.city,
            verificationStatus: "APPROVED",
            verifiedAt: new Date(),
          },
        },
      },
      include: { scoutProfile: true },
    });
    if (user.scoutProfile && !pool.some((p) => p.id === user.scoutProfile!.id)) {
      pool.push({ id: user.scoutProfile.id, userId: user.id, name: user.name });
    }
  }
  console.log(`  Scout pool: ${pool.length} → ${pool.map((p) => p.name).join(", ")}`);

  // ── Castings (cast) — idempotent by (scout, title) ─────────
  const castingDefs = [
    { title: "Campagna SS26 — Maison milanese", city: "Milano", region: "Lombardia", castingType: "PHYSICAL" as const, time: "10:00", address: "Via Tortona 27, Milano", requirements: "Donne min 175cm · 18-30 anni · esperienza editoriale", compensation: "€800/giorno + usage fee", isPaid: true, spots: 5, deadlineIn: 12, dateIn: 18, publishedAgo: 3 },
    { title: "Editoriale 'Nuovi Volti' — rivista di moda", city: "Milano", region: "Lombardia", castingType: "ONLINE" as const, materialsRequired: "3 foto (primo piano, mezzo busto, figura intera) + breve bio", requirements: "16-28 anni · forte personalità · new face gradito", compensation: "Pubblicazione editoriale + copie", isPaid: false, spots: 8, deadlineIn: 6, dateIn: 9, publishedAgo: 1 },
    { title: "Milano Fashion Week — Fitting & Runway", city: "Milano", region: "Lombardia", castingType: "PHYSICAL" as const, time: "09:00", address: "Via Montenapoleone 8, Milano", requirements: "Taglia 38 · altezza min 176cm · disponibilità 3 giorni", compensation: "€500/giorno", isPaid: true, spots: 10, deadlineIn: 20, dateIn: 26, publishedAgo: 5 },
    { title: "Campagna Beauty — skincare naturale", city: "Milano", region: "Lombardia", castingType: "ONLINE" as const, materialsRequired: "Foto senza trucco in luce naturale + video skin routine (15s)", requirements: "Pelle curata e naturale · 20-35 anni", compensation: "€600/giorno + prodotti omaggio", isPaid: true, spots: 4, deadlineIn: 17, dateIn: 23, publishedAgo: 2 },
    { title: "Lookbook Resort — Riviera Ligure", city: "Genova", region: "Liguria", castingType: "PHYSICAL" as const, time: "11:00", address: "Porto Antico, Genova", requirements: "Look mediterraneo · disponibilità 2 giorni", compensation: "€700/giorno", isPaid: true, spots: 3, deadlineIn: 25, dateIn: 32, publishedAgo: 4 },
    { title: "Casting Beauty Roma — profumo di lusso", city: "Roma", region: "Lazio", castingType: "PHYSICAL" as const, time: "15:00", address: "Via del Corso 1, Roma", requirements: "Volto elegante · 20-35 anni · presenza scenica", compensation: "€900/giorno", isPaid: true, spots: 4, deadlineIn: 15, dateIn: 21, publishedAgo: 2 },
  ];

  const castingIds: string[] = [];
  for (let i = 0; i < castingDefs.length; i++) {
    const d = castingDefs[i];
    const scout = pool[i % pool.length];
    const existing = await prisma.casting.findFirst({
      where: { scoutProfileId: scout.id, title: d.title },
      select: { id: true },
    });
    if (existing) {
      castingIds.push(existing.id);
      continue;
    }
    const c = await prisma.casting.create({
      data: {
        scoutProfileId: scout.id,
        title: d.title,
        description: `${d.title}. Selezione aperta: candidati con il tuo book aggiornato.`,
        city: d.city,
        region: d.region,
        castingType: d.castingType,
        time: "time" in d ? d.time : undefined,
        address: "address" in d ? d.address : undefined,
        materialsRequired: "materialsRequired" in d ? d.materialsRequired : undefined,
        requirements: d.requirements,
        compensation: d.compensation,
        isPaid: d.isPaid,
        spots: d.spots,
        castingDate: daysFromNow(d.dateIn),
        deadline: daysFromNow(d.deadlineIn),
        status: "PUBLISHED",
        publishedAt: daysAgo(d.publishedAgo),
      },
      select: { id: true },
    });
    castingIds.push(c.id);
  }
  console.log(`  Castings ready: ${castingIds.length}`);

  // ── Jobs (lavori) — idempotent by (scout, title) ───────────
  const jobDefs = [
    { title: "Shooting E-commerce — brand donna", jobType: "ECOMMERCE" as const, brand: "Atelier Bianca", city: "Milano", region: "Lombardia", location: "Studio Bellini, Via Lecco 18", jobDates: "15-17 maggio 2026", compensation: "€700/giorno", modelRequirements: "Donna taglia 38-40 · 174-180cm · esperienza e-commerce", spotsNeeded: 2, deadlineIn: 15, publishedAgo: 4 },
    { title: "Campagna Social — streetwear", jobType: "SOCIAL_COLLAB" as const, brand: "URBAN.IT", city: "Milano", region: "Lombardia", location: "Navigli — location esterne", jobDates: "20-21 maggio 2026", compensation: "€400/giorno + capi omaggio", modelRequirements: "18-28 anni · stile urban · profilo social attivo", spotsNeeded: 4, deadlineIn: 20, publishedAgo: 2 },
  ];

  const jobIds: string[] = [];
  for (let i = 0; i < jobDefs.length; i++) {
    const d = jobDefs[i];
    const scout = pool[i % pool.length];
    const existing = await prisma.job.findFirst({
      where: { scoutProfileId: scout.id, title: d.title },
      select: { id: true },
    });
    if (existing) {
      jobIds.push(existing.id);
      continue;
    }
    const j = await prisma.job.create({
      data: {
        scoutProfileId: scout.id,
        title: d.title,
        description: `${d.title}. Cerchiamo profili in linea con i requisiti indicati.`,
        jobType: d.jobType,
        brand: d.brand,
        city: d.city,
        region: d.region,
        location: d.location,
        jobDates: d.jobDates,
        compensation: d.compensation,
        isPaid: true,
        modelRequirements: d.modelRequirements,
        spotsNeeded: d.spotsNeeded,
        deadline: daysFromNow(d.deadlineIn),
        status: "PUBLISHED",
        publishedAt: daysAgo(d.publishedAgo),
      },
      select: { id: true },
    });
    jobIds.push(j.id);
  }
  console.log(`  Jobs ready: ${jobIds.length}`);

  // ── Candidature — casting applications by Giulia ───────────
  const castingApps: { castingIdx: number; status: ApplicationStatus; msg: string }[] = [
    { castingIdx: 0, status: "PENDING", msg: "Sono molto interessata alla campagna SS26, ho esperienza con brand di lusso." },
    { castingIdx: 1, status: "PENDING", msg: "Mi candido per l'editoriale: adoro i progetti dedicati ai nuovi volti." },
    { castingIdx: 2, status: "ACCEPTED", msg: "Disponibile per tutti e 3 i giorni della Fashion Week, misure in linea." },
    { castingIdx: 3, status: "PENDING", msg: "La mia pelle è curata e naturale, sarebbe un piacere rappresentare il brand." },
    { castingIdx: 5, status: "REJECTED", msg: "Mi candido per il casting beauty a Roma." },
  ];
  for (const a of castingApps) {
    const castingId = castingIds[a.castingIdx];
    if (!castingId) continue;
    await prisma.castingApplication.upsert({
      where: { castingId_modelProfileId: { castingId, modelProfileId: mp.id } },
      update: { status: a.status, introMessage: a.msg },
      create: { castingId, modelProfileId: mp.id, introMessage: a.msg, status: a.status },
    });
  }

  // ── Candidature — one job application by Giulia ────────────
  if (jobIds[0]) {
    await prisma.jobApplication.upsert({
      where: { jobId_modelProfileId: { jobId: jobIds[0], modelProfileId: mp.id } },
      update: { status: "PENDING" },
      create: { jobId: jobIds[0], modelProfileId: mp.id, status: "PENDING", introMessage: "Ho esperienza in shooting e-commerce per diversi brand." },
    });
  }
  console.log(`  Candidature: ${castingApps.length} casting + 1 job (3 casting + 1 job PENDING)`);

  // ── Richieste — contact requests to Giulia ─────────────────
  const contactDefs: {
    subject: string;
    message: string;
    reason: ContactReason;
    status: ContactRequestStatus;
  }[] = [
    { subject: "Interessati al tuo profilo per la campagna SS26", message: "Ciao Giulia, il tuo profilo è perfetto per la nostra campagna SS26. Ti va di parlarne?", reason: "SCOUTING", status: "ACCEPTED" },
    { subject: "Selezione editoriale 'Vogue Talents'", message: "Vorremmo proporti una selezione per un editoriale dedicato ai nuovi talenti italiani.", reason: "CASTING", status: "PENDING" },
    { subject: "Proposta campagna beauty", message: "Abbiamo una campagna beauty che si adatta perfettamente al tuo profilo. Interessata?", reason: "JOB_OPPORTUNITY", status: "PENDING" },
    { subject: "Editoriale 'New Italian Beauty' a Firenze", message: "Progetto editoriale di 2 giorni a Firenze: il tuo profilo è esattamente ciò che cerchiamo.", reason: "EDITORIAL", status: "PENDING" },
  ];

  const usableContacts = Math.min(contactDefs.length, pool.length);
  for (let i = 0; i < usableContacts; i++) {
    const scout = pool[i];
    const d = contactDefs[i];

    if (d.status === "ACCEPTED") {
      // Accepted request → conversation + a few messages (idempotent)
      const existing = await prisma.contactRequest.findUnique({
        where: { scoutProfileId_modelProfileId: { scoutProfileId: scout.id, modelProfileId: mp.id } },
        select: { id: true, conversationId: true },
      });
      if (existing?.conversationId) continue; // already wired up

      const conv = await prisma.conversation.create({
        data: {
          lastMessageAt: hoursAgo(20),
          participants: {
            create: [
              { userId: scout.userId },
              { userId: giulia.id, lastReadAt: hoursAgo(18) },
            ],
          },
        },
      });
      await prisma.message.createMany({
        data: [
          { conversationId: conv.id, senderId: scout.userId, body: "Ciao Giulia! Grazie per aver accettato. Il team è rimasto colpito dal tuo book.", createdAt: hoursAgo(72) },
          { conversationId: conv.id, senderId: giulia.id, body: "Grazie mille! Sono molto interessata al progetto.", createdAt: hoursAgo(70) },
          { conversationId: conv.id, senderId: scout.userId, body: "Perfetto. Saresti disponibile per un fitting la prossima settimana a Milano?", createdAt: hoursAgo(24) },
          { conversationId: conv.id, senderId: giulia.id, body: "Assolutamente sì, fatemi sapere il giorno!", createdAt: hoursAgo(20) },
        ],
      });
      await prisma.contactRequest.upsert({
        where: { scoutProfileId_modelProfileId: { scoutProfileId: scout.id, modelProfileId: mp.id } },
        update: { status: "ACCEPTED", conversationId: conv.id, respondedAt: daysAgo(2) },
        create: { scoutProfileId: scout.id, modelProfileId: mp.id, subject: d.subject, message: d.message, reason: d.reason, status: "ACCEPTED", respondedAt: daysAgo(2), conversationId: conv.id, createdAt: daysAgo(3) },
      });
    } else {
      await prisma.contactRequest.upsert({
        where: { scoutProfileId_modelProfileId: { scoutProfileId: scout.id, modelProfileId: mp.id } },
        update: { subject: d.subject, message: d.message, reason: d.reason, status: "PENDING" },
        create: { scoutProfileId: scout.id, modelProfileId: mp.id, subject: d.subject, message: d.message, reason: d.reason, status: "PENDING", createdAt: daysAgo(i) },
      });
    }
  }
  const pendingContacts = Math.max(0, usableContacts - 1);
  console.log(`  Richieste: ${usableContacts} (${pendingContacts} in sospeso + 1 accettata con chat)`);

  // ── Notifications (bell) — idempotent by known titles ──────
  const NOTIF_TITLES = [
    "Nuova richiesta di contatto",
    "Candidatura accettata",
    "Candidatura non selezionata",
    "Nuovo messaggio",
  ];
  await prisma.notification.deleteMany({
    where: { userId: giulia.id, title: { in: NOTIF_TITLES } },
  });

  const notifData: {
    type: "CONTACT_REQUEST_RECEIVED" | "APPLICATION_ACCEPTED" | "APPLICATION_REJECTED" | "NEW_MESSAGE";
    title: string;
    body: string;
    link: string;
    isRead: boolean;
    createdAt: Date;
  }[] = [];

  for (let i = 1; i < usableContacts; i++) {
    notifData.push({
      type: "CONTACT_REQUEST_RECEIVED",
      title: "Nuova richiesta di contatto",
      body: `${pool[i].name ?? "Uno scout"} vuole entrare in contatto con te.`,
      link: "/model/contacts",
      isRead: false,
      createdAt: hoursAgo(4 + i),
    });
  }
  notifData.push(
    { type: "APPLICATION_ACCEPTED", title: "Candidatura accettata", body: "La tua candidatura per 'Milano Fashion Week — Fitting & Runway' è stata accettata.", link: "/model/applications", isRead: false, createdAt: hoursAgo(30) },
    { type: "APPLICATION_REJECTED", title: "Candidatura non selezionata", body: "La tua candidatura per 'Casting Beauty Roma — profumo di lusso' non è stata selezionata.", link: "/model/applications", isRead: true, createdAt: daysAgo(2) },
    { type: "NEW_MESSAGE", title: "Nuovo messaggio", body: `${pool[0].name ?? "Uno scout"}: "Saresti disponibile per un fitting la prossima settimana?"`, link: "/model/messages", isRead: false, createdAt: hoursAgo(24) },
  );

  await prisma.notification.createMany({
    data: notifData.map((n) => ({ ...n, userId: giulia.id })),
  });
  console.log(`  Notifications: ${notifData.length}`);

  console.log(`\n✅ Done. Login: ${GIULIA_EMAIL} / password123`);
  console.log(`   → /model (dashboard), /model/contacts, /model/applications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
