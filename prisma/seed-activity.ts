// Seed realistic activity data: jobs, castings, contacts, messages, applications, notifications
// Dynamically discovers scouts + models from the database — no hardcoded emails.
// Run: npx tsx prisma/seed-activity.ts

import {
  PrismaClient,
  ApplicationStatus,
  NotificationType,
  PipelineStage,
} from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(d: number) { return new Date(Date.now() + d * 864e5); }
function daysAgo(d: number) { return new Date(Date.now() - d * 864e5); }
function hoursAgo(h: number) { return new Date(Date.now() - h * 36e5); }

async function main() {
  console.log("🎬 Seeding activity data…\n");

  // ── Discover users ────────────────────────────────────────
  const scoutUsers = await prisma.user.findMany({
    where: { role: "SCOUT", scoutProfile: { verificationStatus: "APPROVED" } },
    include: { scoutProfile: true },
  });
  const modelUsers = await prisma.user.findMany({
    where: { role: "MODEL", modelProfile: { isNot: null } },
    include: { modelProfile: true },
    take: 20,
  });
  const models = modelUsers.filter((u) => u.modelProfile);

  if (scoutUsers.length < 1) { console.error("❌ No approved scouts."); return; }
  if (models.length < 6) { console.error("❌ Need ≥6 models."); return; }

  const s1 = scoutUsers[0];
  const s2 = scoutUsers[1] ?? scoutUsers[0];
  const sp1 = s1.scoutProfile!;
  const sp2 = s2.scoutProfile!;

  console.log(`  ${models.length} models, ${scoutUsers.length} scouts`);
  console.log(`  Scout 1: ${s1.name} (${s1.email})`);
  if (s2.id !== s1.id) console.log(`  Scout 2: ${s2.name} (${s2.email})`);

  // ── Cleanup ───────────────────────────────────────────────
  console.log("  🧹 Cleaning existing activity data…");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.castingApplication.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.casting.deleteMany();
  await prisma.job.deleteMany();
  await prisma.shortlistItem.deleteMany();
  await prisma.shortlistBoard.deleteMany();
  await prisma.privateNote.deleteMany();

  // ─────────────────────────────────────────────────────────
  // CASTINGS
  // ─────────────────────────────────────────────────────────
  console.log("\n  📢 Castings…");

  const casting1 = await prisma.casting.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Campagna Primavera/Estate 2026 — Brand di Lusso",
      description: "Cerchiamo modelle e modelli per la nuova campagna SS26 di un importante brand di moda italiano.\n\nLo shooting si terrà a Milano presso studi fotografici professionali con un team creativo internazionale.\n\nRequisiti:\n- Età 18-30\n- Esperienza in editoriali o campagne\n- Portfolio aggiornato",
      city: "Milano", region: "Lombardia",
      castingDate: daysFromNow(14), deadline: daysFromNow(10),
      castingType: "PHYSICAL", time: "10:00",
      address: "Via Tortona 27, Milano",
      instructions: "Presentarsi con portfolio stampato e digitale. Book composito gradito.",
      requirements: "Altezza: Donne min 175cm, Uomini min 183cm\nEtà 18-30\nEsperienza editoriale",
      compensation: "€800/giorno + usage fee", isPaid: true, spots: 6,
      status: "PUBLISHED", publishedAt: daysAgo(3),
    },
  });

  const casting2 = await prisma.casting.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Fitting Models — Milano Fashion Week",
      description: "Servono fitting models per la preparazione della Fashion Week di Milano. Contratto di 3 giorni. Possibilità di partecipare anche come modelli in passerella.",
      city: "Milano", region: "Lombardia",
      castingDate: daysFromNow(30), deadline: daysFromNow(25),
      castingType: "PHYSICAL", time: "09:00",
      address: "Via Montenapoleone 8, Milano",
      requirements: "Taglia 38 (donna) o 48 (uomo)\nDisponibilità 3 giorni consecutivi\nAltezza minima 176cm",
      compensation: "€500/giorno", isPaid: true, spots: 4,
      status: "PUBLISHED", publishedAt: daysAgo(5),
    },
  });

  const casting3 = await prisma.casting.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Editorial Shooting — Vogue Italia Talents",
      description: "Selezione volti per un editoriale dedicato ai nuovi talenti della moda italiana. Il progetto sarà pubblicato su Vogue Italia (edizione digitale).\n\nCerchiamo volti freschi e personalità forti.",
      city: "Milano", region: "Lombardia",
      castingDate: daysFromNow(7), deadline: daysFromNow(5),
      castingType: "ONLINE",
      materialsRequired: "3 foto recenti (primo piano, mezzo busto, figura intera)\nVideo presentazione 30 secondi\nBreve bio",
      requirements: "Età 16-25\nNew face o prime esperienze\nFortemente espressivo/a",
      compensation: "Pubblicazione editoriale + copie rivista", isPaid: false, spots: 8,
      status: "PUBLISHED", publishedAt: daysAgo(1),
    },
  });

  const casting4 = await prisma.casting.create({
    data: {
      scoutProfileId: sp2.id,
      title: "Casting Beauty — Campagna Skincare",
      description: "Brand skincare italiano cerca volti per campagna digital e social media. Focus su pelle naturale, minimal makeup. Shooting a Roma in studio professionale.",
      city: "Roma", region: "Lazio",
      castingDate: daysFromNow(21), deadline: daysFromNow(17),
      castingType: "ONLINE",
      materialsRequired: "Foto senza trucco (volto pulito)\n2 foto in luce naturale\nBreve video (15 sec) skin routine",
      requirements: "Pelle curata e naturale\nEtà 20-35\nDisponibilità per 2 giorni a Roma",
      compensation: "€600/giorno + prodotti omaggio", isPaid: true, spots: 4,
      status: "PUBLISHED", publishedAt: daysAgo(2),
    },
  });

  const castingClosed = await prisma.casting.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Sfilata Evento Charity — Milano",
      description: "Sfilata di beneficenza per una fondazione milanese. Cerchiamo modelli/e di tutte le taglie e origini.",
      city: "Milano", region: "Lombardia",
      castingDate: daysAgo(10), deadline: daysAgo(15),
      requirements: "Nessun requisito fisico specifico. Passione per la moda.",
      compensation: "Evento benefico non retribuito + cena gala", isPaid: false, spots: 12,
      status: "CLOSED", publishedAt: daysAgo(30),
    },
  });

  console.log("    ✅ 5 castings");

  // ─────────────────────────────────────────────────────────
  // CASTING APPLICATIONS
  // ─────────────────────────────────────────────────────────
  console.log("  📋 Casting applications…");

  const castingAppData: { castingId: string; idx: number; status: ApplicationStatus; msg: string }[] = [];
  const msgs1 = [
    "Buongiorno, sono molto interessata a questa campagna. Ho esperienza con brand di lusso.",
    "Vorrei candidarmi per il casting. Il mio portfolio include lavori recenti con brand italiani.",
    "Mi piacerebbe partecipare alla campagna SS26. Ho lavorato con fotografi internazionali.",
    "Salve, sono interessato. Allego il mio portfolio aggiornato.",
    "Mi candido per le date proposte, sono disponibile e ho esperienza in campagne pubblicitarie.",
  ];
  [0,1,2,3,4].forEach((i) => {
    const st: ApplicationStatus[] = ["PENDING","PENDING","ACCEPTED","REJECTED","PENDING"];
    castingAppData.push({ castingId: casting1.id, idx: i, status: st[i], msg: msgs1[i] });
  });
  [2,3,4,5].forEach((i, j) => {
    const st: ApplicationStatus[] = ["ACCEPTED","PENDING","PENDING","ACCEPTED"];
    castingAppData.push({ castingId: casting2.id, idx: i, status: st[j], msg: "Mi candido per il fitting. Le mie misure corrispondono ai requisiti." });
  });
  [0,1,2,3,4,5,6,7].forEach((i) => {
    const st: ApplicationStatus[] = ["PENDING","ACCEPTED","PENDING","ACCEPTED","REJECTED","PENDING","PENDING","ACCEPTED"];
    const m = i % 2 === 0
      ? "Sono un nuovo volto nel mondo della moda e sarebbe un'opportunità incredibile."
      : "Mi piacerebbe partecipare a questo progetto editoriale.";
    castingAppData.push({ castingId: casting3.id, idx: i, status: st[i], msg: m });
  });
  [1,2,3,4].forEach((i) => {
    castingAppData.push({ castingId: casting4.id, idx: i, status: "PENDING", msg: "Adoro i prodotti della vostra linea skincare. Sarebbe un piacere rappresentare il brand." });
  });
  [3,4,5,6].forEach((i, j) => {
    castingAppData.push({ castingId: castingClosed.id, idx: i, status: j < 2 ? "ACCEPTED" : "REJECTED", msg: "Sarebbe un piacere partecipare all'evento benefico." });
  });

  for (const { castingId, idx, status, msg } of castingAppData) {
    await prisma.castingApplication.create({
      data: { castingId, modelProfileId: models[idx].modelProfile!.id, introMessage: msg, status },
    });
  }
  console.log(`    ✅ ${castingAppData.length} casting applications`);

  // ─────────────────────────────────────────────────────────
  // JOBS (LAVORI)
  // ─────────────────────────────────────────────────────────
  console.log("\n  💼 Jobs…");

  const job1 = await prisma.job.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Shooting E-commerce — Brand Moda Donna",
      description: "Shooting per catalogo e-commerce di un brand di moda donna. 3 giorni di lavoro a Milano.\n\nCerchiamo una modella con esperienza in e-commerce, taglia 38-40.",
      jobType: "ECOMMERCE", brand: "Atelier Bianca",
      city: "Milano", region: "Lombardia", location: "Studio Bellini, Via Lecco 18",
      jobDates: "15-17 Aprile 2026", compensation: "€700/giorno", isPaid: true,
      modelRequirements: "Donna, taglia 38-40\nAltezza 174-180cm\nEsperienza e-commerce",
      spotsNeeded: 2, deadline: daysFromNow(15),
      status: "PUBLISHED", publishedAt: daysAgo(4),
    },
  });

  const job2 = await prisma.job.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Campagna Social Media — Streetwear Brand",
      description: "Brand streetwear emergente cerca modelli/e per campagna Instagram e TikTok. Shooting outdoor a Milano.\n\nCerchiamo personalità autentiche con forte presenza social.",
      jobType: "SOCIAL_COLLAB", brand: "URBAN.IT",
      city: "Milano", region: "Lombardia", location: "Navigli — location esterne",
      jobDates: "20-21 Aprile 2026", compensation: "€400/giorno + capi omaggio", isPaid: true,
      modelRequirements: "18-28 anni\nStile urban/streetwear\nProfilo Instagram attivo",
      spotsNeeded: 4, deadline: daysFromNow(20),
      status: "PUBLISHED", publishedAt: daysAgo(2),
    },
  });

  const job3 = await prisma.job.create({
    data: {
      scoutProfileId: sp2.id,
      title: "Sfilata Runway — Evento Moda Roma",
      description: "Grande evento di moda a Roma. Cerchiamo modelli e modelle per sfilata di 5 designer emergenti.",
      jobType: "RUNWAY", brand: "Roma Fashion Collective",
      city: "Roma", region: "Lazio", location: "Palazzo delle Esposizioni, Via Nazionale",
      jobDates: "28 Aprile 2026", compensation: "€300 + lookbook professionale", isPaid: true,
      modelRequirements: "Donne: 176-182cm, taglia 36-40\nUomini: 185-192cm, taglia 48-50",
      spotsNeeded: 10, deadline: daysFromNow(25),
      status: "PUBLISHED", publishedAt: daysAgo(1),
    },
  });

  const job4 = await prisma.job.create({
    data: {
      scoutProfileId: sp2.id,
      title: "Shooting Lookbook — Collezione Autunno",
      description: "Brand di prêt-à-porter cerca modello e modella per shooting lookbook A/W 26. Location: villa storica alle porte di Roma.\n\nAtmosfera elegante e cinematografica.",
      jobType: "SHOOTING", brand: "Casa Morandi",
      city: "Roma", region: "Lazio", location: "Villa Doria Pamphilj",
      jobDates: "5-6 Maggio 2026", compensation: "€900/giorno", isPaid: true,
      modelRequirements: "Donna: 175-180cm, taglia 38-42\nUomo: 183-190cm\nLook elegante",
      spotsNeeded: 2, deadline: daysFromNow(30),
      status: "PUBLISHED", publishedAt: daysAgo(1),
    },
  });

  const job5 = await prisma.job.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Hostess Evento — Lancio Profumo",
      description: "Cerchiamo hostess per evento di lancio di un nuovo profumo di lusso. Evento serale presso hotel 5 stelle a Milano.",
      jobType: "EVENT", brand: "Maison Dorata",
      city: "Milano", region: "Lombardia", location: "Hotel Principe di Savoia",
      jobDates: "10 Aprile 2026, ore 19:00-23:00", compensation: "€250 + cena", isPaid: true,
      modelRequirements: "Donna, 170-180cm\nPresenza elegante\nConoscenza inglese",
      spotsNeeded: 6, deadline: daysFromNow(12),
      status: "PUBLISHED", publishedAt: daysAgo(3),
    },
  });

  const jobClosed = await prisma.job.create({
    data: {
      scoutProfileId: sp1.id,
      title: "Campagna Pubblicitaria — Brand Eyewear",
      description: "Shooting per campagna occhiali da sole. Completato con successo.",
      jobType: "CAMPAIGN", brand: "Ottica Moderna",
      city: "Milano", region: "Lombardia",
      compensation: "€1200/giorno", isPaid: true, spotsNeeded: 2,
      status: "CLOSED", publishedAt: daysAgo(45),
    },
  });

  console.log("    ✅ 6 jobs");

  // ─────────────────────────────────────────────────────────
  // JOB APPLICATIONS
  // ─────────────────────────────────────────────────────────
  console.log("  📋 Job applications…");

  const jobAppData: { jobId: string; idx: number; status: ApplicationStatus; msg: string }[] = [];
  [0,1,2,3].forEach((i) => {
    const st: ApplicationStatus[] = ["ACCEPTED","PENDING","REJECTED","PENDING"];
    jobAppData.push({ jobId: job1.id, idx: i, status: st[i], msg: "Ho esperienza in shooting e-commerce per diversi brand." });
  });
  [2,3,4,5,6].forEach((i, j) => {
    const st: ApplicationStatus[] = ["PENDING","ACCEPTED","PENDING","ACCEPTED","PENDING"];
    jobAppData.push({ jobId: job2.id, idx: i, status: st[j], msg: "Il mio stile è perfetto per questa campagna!" });
  });
  [0,1,2,3,4,5,6,7].forEach((i) => {
    const st: ApplicationStatus[] = ["ACCEPTED","ACCEPTED","PENDING","PENDING","ACCEPTED","REJECTED","PENDING","PENDING"];
    jobAppData.push({ jobId: job3.id, idx: i, status: st[i], msg: "Mi candido per la sfilata." });
  });
  [5,6,7].forEach((i) => {
    jobAppData.push({ jobId: job4.id, idx: i, status: "PENDING", msg: "L'atmosfera cinematografica è perfetta per il mio stile." });
  });
  [0,1,2,3,4].forEach((i) => {
    const st: ApplicationStatus[] = ["ACCEPTED","ACCEPTED","ACCEPTED","PENDING","PENDING"];
    jobAppData.push({ jobId: job5.id, idx: i, status: st[i], msg: "Sono disponibile per l'evento luxury." });
  });
  [1,2,3].forEach((i, j) => {
    jobAppData.push({ jobId: jobClosed.id, idx: i, status: j === 0 ? "ACCEPTED" : "REJECTED", msg: "Candidatura campagna eyewear." });
  });

  for (const { jobId, idx, status, msg } of jobAppData) {
    await prisma.jobApplication.create({
      data: { jobId, modelProfileId: models[idx].modelProfile!.id, introMessage: msg, status },
    });
  }
  console.log(`    ✅ ${jobAppData.length} job applications`);

  // ─────────────────────────────────────────────────────────
  // CONTACT REQUESTS + CONVERSATIONS + MESSAGES
  // ─────────────────────────────────────────────────────────
  console.log("\n  📨 Contacts & conversations…");

  async function contactWithConvo(
    scoutUser: typeof s1,
    scoutProfileId: string,
    modelIdx: number,
    subject: string,
    message: string,
    reason: "SCOUTING" | "EDITORIAL" | "JOB_OPPORTUNITY" | "CASTING" | "OTHER",
    msgs: { fromScout: boolean; body: string; ago: number }[],
  ) {
    const model = models[modelIdx];
    const mp = model.modelProfile!;

    const conv = await prisma.conversation.create({
      data: {
        lastMessageAt: hoursAgo(msgs[msgs.length - 1].ago),
        participants: {
          create: [
            { userId: scoutUser.id },
            { userId: model.id, lastReadAt: hoursAgo(msgs[msgs.length - 1].ago + 2) },
          ],
        },
      },
    });

    await prisma.contactRequest.create({
      data: {
        scoutProfileId, modelProfileId: mp.id,
        subject, message, reason,
        status: "ACCEPTED", respondedAt: daysAgo(msgs[0].ago / 24 + 1),
        conversationId: conv.id, createdAt: daysAgo(msgs[0].ago / 24 + 2),
      },
    });

    for (const m of msgs) {
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: m.fromScout ? scoutUser.id : model.id,
          body: m.body,
          createdAt: hoursAgo(m.ago),
        },
      });
    }
  }

  // Contact 1: Scout 1 → model[0]
  await contactWithConvo(s1, sp1.id, 0,
    "Interessati al tuo profilo per campagna SS26",
    "Siamo molto interessati a collaborare con te per una importante campagna SS26.",
    "SCOUTING",
    [
      { fromScout: true,  body: "Ciao! Grazie per aver accettato la nostra richiesta. Come stai?", ago: 120 },
      { fromScout: false, body: "Ciao! Grazie a voi per l'interesse. Sono entusiasta della proposta!", ago: 118 },
      { fromScout: true,  body: "Stiamo cercando volti per la campagna SS26. Saresti disponibile per un fitting la prossima settimana?", ago: 96 },
      { fromScout: false, body: "Assolutamente sì! Sono disponibile sia martedì che mercoledì.", ago: 94 },
      { fromScout: true,  body: "Martedì sarebbe perfetto. Ore 10:00 presso il nostro studio in Via Tortona 27.", ago: 72 },
      { fromScout: false, body: "Perfetto, confermo martedì alle 10. A presto! 🙏", ago: 70 },
      { fromScout: true,  body: "Il fitting è andato benissimo! Il team creativo è rimasto molto colpito. Ti confermiamo per la campagna! 🎉", ago: 24 },
      { fromScout: false, body: "Che bella notizia! Non vedo l'ora di iniziare! Quando saranno le date dello shooting?", ago: 20 },
      { fromScout: true,  body: "Lo shooting sarà dal 15 al 17 aprile. Ti mandiamo il contratto domani. Congratulazioni!", ago: 2 },
    ],
  );

  // Contact 2: Scout 1 → model[3]
  await contactWithConvo(s1, sp1.id, 3,
    "Proposta collaborazione editoriale",
    "Abbiamo un progetto editoriale molto interessante e il tuo profilo è esattamente quello che cerchiamo.",
    "EDITORIAL",
    [
      { fromScout: true,  body: "Grazie per aver accettato! Abbiamo un progetto editoriale molto interessante.", ago: 72 },
      { fromScout: false, body: "Grazie! Raccontatemi di più, sono curiosissima.", ago: 70 },
      { fromScout: true,  body: "Si tratta di un editoriale per una rivista internazionale, tema 'New Italian Beauty'. 2 giorni a Firenze.", ago: 48 },
      { fromScout: false, body: "Firenze! Bellissimo. Quali sono le date?", ago: 46 },
      { fromScout: true,  body: "22-23 aprile. Il fotografo è Marco Valentini. Ti mando il mood board?", ago: 24 },
      { fromScout: false, body: "Sì, mandami pure tutto! Marco Valentini è fantastico.", ago: 5 },
    ],
  );

  // Contact 3: Scout 2 → model[1]
  await contactWithConvo(s2, sp2.id, 1,
    "Opportunità campagna beauty maschile",
    "Ho un'opportunità per una campagna beauty maschile per un brand emergente.",
    "JOB_OPPORTUNITY",
    [
      { fromScout: true,  body: "Ciao! Grazie per la risposta. Ti racconto meglio della campagna beauty.", ago: 144 },
      { fromScout: false, body: "Ciao, sì dimmi pure!", ago: 120 },
      { fromScout: true,  body: "Il brand è emergente ma molto promettente. Shooting a Roma, 2 giorni, €600/giorno.", ago: 96 },
      { fromScout: false, body: "Mi piace molto il concept! Quando sarebbero le date esatte?", ago: 72 },
      { fromScout: true,  body: "Stiamo definendo, probabilmente prima settimana di maggio. Ti tengo aggiornato!", ago: 24 },
    ],
  );

  // Contact 4: Scout 2 → model[6]
  await contactWithConvo(s2, sp2.id, 6,
    "Shooting lookbook brand romano",
    "Ho visto il tuo profilo e mi piacerebbe proporti per uno shooting lookbook.",
    "JOB_OPPORTUNITY",
    [
      { fromScout: true,  body: "Grazie per aver accettato! Il progetto con Casa Morandi è davvero bello.", ago: 48 },
      { fromScout: false, body: "Grazie a te per la proposta! Quali sono i dettagli?", ago: 46 },
      { fromScout: true,  body: "Shooting lookbook presso Villa Doria Pamphilj a Roma. 5-6 maggio. Budget: €900/giorno.", ago: 24 },
      { fromScout: false, body: "Villa Doria Pamphilj è fantastica! Confermo la mia disponibilità!", ago: 8 },
      { fromScout: true,  body: "Ottimo! Ti invio il brief completo domani mattina. A presto!", ago: 1 },
    ],
  );

  // Pending contacts
  await prisma.contactRequest.create({
    data: {
      scoutProfileId: sp1.id, modelProfileId: models[5].modelProfile!.id,
      subject: "Proposta casting per sfilata",
      message: "Stiamo organizzando una sfilata importante e il suo profilo ci ha colpito.",
      reason: "CASTING", status: "PENDING", createdAt: daysAgo(1),
    },
  });
  await prisma.contactRequest.create({
    data: {
      scoutProfileId: sp2.id, modelProfileId: models[2].modelProfile!.id,
      subject: "Campagna swimwear estate 2026",
      message: "Ho una campagna swimwear per l'estate 2026 e il tuo profilo è perfetto. Shooting in Sardegna.",
      reason: "JOB_OPPORTUNITY", status: "PENDING", createdAt: hoursAgo(6),
    },
  });

  // Rejected contact
  await prisma.contactRequest.create({
    data: {
      scoutProfileId: sp1.id, modelProfileId: models[4].modelProfile!.id,
      subject: "Invito a evento moda",
      message: "Vorremmo invitarti a un nostro evento esclusivo di presentazione nuovi talenti.",
      reason: "OTHER", status: "REJECTED", respondedAt: daysAgo(2), createdAt: daysAgo(4),
    },
  });

  console.log("    ✅ 7 contacts (4 with conversations, ~25 messages)");

  // ─────────────────────────────────────────────────────────
  // SHORTLIST BOARDS
  // ─────────────────────────────────────────────────────────
  console.log("\n  📌 Shortlists…");

  const board1 = await prisma.shortlistBoard.create({
    data: { scoutProfileId: sp1.id, name: "Campagna SS26 — Shortlist Finale", description: "Candidati selezionati per la campagna primavera/estate 2026" },
  });
  await prisma.shortlistItem.createMany({
    data: [
      { boardId: board1.id, modelProfileId: models[0].modelProfile!.id, pipelineStage: "BOOKED", note: "Confermata per la campagna SS26" },
      { boardId: board1.id, modelProfileId: models[3].modelProfile!.id, pipelineStage: "SHORTLISTED", note: "Ottimo profilo editoriale" },
      { boardId: board1.id, modelProfileId: models[5].modelProfile!.id, pipelineStage: "CONTACTED", note: "In attesa di risposta" },
      { boardId: board1.id, modelProfileId: models[2].modelProfile!.id, pipelineStage: "SAVED" },
    ],
  });

  const board2 = await prisma.shortlistBoard.create({
    data: { scoutProfileId: sp1.id, name: "Fashion Week Milano — Modelle", description: "Modelle per fitting e sfilata Fashion Week" },
  });
  await prisma.shortlistItem.createMany({
    data: [
      { boardId: board2.id, modelProfileId: models[0].modelProfile!.id, pipelineStage: "BOOKED" },
      { boardId: board2.id, modelProfileId: models[2].modelProfile!.id, pipelineStage: "SHORTLISTED" },
      { boardId: board2.id, modelProfileId: models[4].modelProfile!.id, pipelineStage: "REPLIED" },
      { boardId: board2.id, modelProfileId: models[6].modelProfile!.id, pipelineStage: "CONTACTED" },
      { boardId: board2.id, modelProfileId: models[8].modelProfile!.id, pipelineStage: "SAVED" },
    ],
  });

  const board3 = await prisma.shortlistBoard.create({
    data: { scoutProfileId: sp2.id, name: "Roma Fashion Collective — Sfilata", description: "Modelli per evento moda Roma" },
  });
  await prisma.shortlistItem.createMany({
    data: [
      { boardId: board3.id, modelProfileId: models[1].modelProfile!.id, pipelineStage: "BOOKED", note: "Confermato per sfilata" },
      { boardId: board3.id, modelProfileId: models[3].modelProfile!.id, pipelineStage: "SHORTLISTED" },
      { boardId: board3.id, modelProfileId: models[7].modelProfile!.id, pipelineStage: "CONTACTED" },
    ],
  });

  console.log("    ✅ 3 boards, 12 items");

  // ─────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────
  console.log("\n  🔔 Notifications…");

  type NData = { userId: string; type: NotificationType; title: string; body: string; link?: string; isRead: boolean; createdAt: Date };
  const notifs: NData[] = [];

  // Model notifications
  for (let i = 0; i < Math.min(8, models.length); i++) {
    const m = models[i];
    notifs.push({
      userId: m.id, type: "APPLICATION_SUBMITTED",
      title: "Candidatura inviata", body: "La tua candidatura per un casting è stata registrata.",
      link: "/model/castings", isRead: true, createdAt: daysAgo(2),
    });
    if (i < 4) {
      notifs.push({
        userId: m.id, type: "APPLICATION_ACCEPTED",
        title: "Candidatura accettata!", body: "Una delle tue candidature è stata accettata.",
        link: "/model/castings", isRead: i < 2, createdAt: daysAgo(1),
      });
    }
    if (i < 2) {
      notifs.push({
        userId: m.id, type: "CONTACT_REQUEST_RECEIVED",
        title: "Nuova richiesta di contatto", body: "Un'agenzia vuole contattarti.",
        link: "/model/contacts", isRead: true, createdAt: daysAgo(7),
      });
      notifs.push({
        userId: m.id, type: "NEW_MESSAGE",
        title: "Nuovo messaggio", body: "Hai ricevuto un nuovo messaggio.",
        link: "/model/messages", isRead: false, createdAt: hoursAgo(3),
      });
    }
  }

  // model[5] — pending contact notification
  notifs.push({
    userId: models[5].id, type: "CONTACT_REQUEST_RECEIVED",
    title: "Nuova richiesta di contatto", body: "Un'agenzia vorrebbe proporti un casting.",
    link: "/model/contacts", isRead: false, createdAt: daysAgo(1),
  });

  // model[6] — accepted + message
  notifs.push(
    { userId: models[6].id, type: "CONTACT_REQUEST_RECEIVED", title: "Nuova richiesta di contatto", body: "Un talent scout vuole proporti uno shooting lookbook.", link: "/model/contacts", isRead: true, createdAt: daysAgo(4) },
    { userId: models[6].id, type: "NEW_MESSAGE", title: "Nuovo messaggio", body: "Hai un nuovo messaggio.", link: "/model/messages", isRead: false, createdAt: hoursAgo(1) },
  );

  // Scout 1 notifications
  notifs.push(
    { userId: s1.id, type: "APPLICATION_SUBMITTED", title: "Nuova candidatura", body: "Nuova candidatura ricevuta per un tuo casting.", link: "/scout/castings", isRead: true, createdAt: daysAgo(2) },
    { userId: s1.id, type: "APPLICATION_SUBMITTED", title: "Nuova candidatura", body: "Un'altra candidatura ricevuta.", link: "/scout/castings", isRead: true, createdAt: daysAgo(1) },
    { userId: s1.id, type: "APPLICATION_SUBMITTED", title: "Nuova candidatura", body: "Nuova candidatura per la campagna SS26.", link: "/scout/castings", isRead: false, createdAt: hoursAgo(8) },
    { userId: s1.id, type: "JOB_APPLICATION_SUBMITTED", title: "Candidatura lavoro", body: "Nuova candidatura per il tuo annuncio.", link: "/scout/lavori", isRead: false, createdAt: hoursAgo(4) },
    { userId: s1.id, type: "CONTACT_REQUEST_ACCEPTED", title: "Richiesta accettata", body: "La tua richiesta di contatto è stata accettata.", link: "/scout/messages", isRead: true, createdAt: daysAgo(5) },
    { userId: s1.id, type: "NEW_MESSAGE", title: "Nuovo messaggio", body: "Hai ricevuto un nuovo messaggio.", link: "/scout/messages", isRead: false, createdAt: hoursAgo(20) },
  );

  // Scout 2 notifications (only if different from scout 1)
  if (s2.id !== s1.id) {
    notifs.push(
      { userId: s2.id, type: "APPLICATION_SUBMITTED", title: "Nuova candidatura", body: "Nuova candidatura per il tuo casting beauty.", link: "/scout/castings", isRead: false, createdAt: daysAgo(1) },
      { userId: s2.id, type: "JOB_APPLICATION_SUBMITTED", title: "Candidatura lavoro", body: "Nuove candidature per la sfilata Roma.", link: "/scout/lavori", isRead: false, createdAt: hoursAgo(5) },
      { userId: s2.id, type: "CONTACT_REQUEST_ACCEPTED", title: "Richiesta accettata", body: "Il modello ha accettato la tua richiesta.", link: "/scout/messages", isRead: true, createdAt: daysAgo(2) },
      { userId: s2.id, type: "NEW_MESSAGE", title: "Nuovo messaggio", body: "Nuovo messaggio da una conversazione.", link: "/scout/messages", isRead: false, createdAt: hoursAgo(1) },
    );
  }

  for (const n of notifs) {
    await prisma.notification.create({ data: n });
  }
  console.log(`    ✅ ${notifs.length} notifications`);

  // ─────────────────────────────────────────────────────────
  // PRIVATE NOTES
  // ─────────────────────────────────────────────────────────
  console.log("\n  📝 Private notes…");
  await prisma.privateNote.createMany({
    data: [
      { scoutProfileId: sp1.id, modelProfileId: models[0].modelProfile!.id, content: "Ottima esperienza, molto professionale. Confermata per campagna SS26." },
      { scoutProfileId: sp1.id, modelProfileId: models[3].modelProfile!.id, content: "Profilo editoriale fortissimo. Proporre per editoriale Vogue." },
      { scoutProfileId: sp1.id, modelProfileId: models[2].modelProfile!.id, content: "Potenziale per campagna swimwear. Da contattare." },
      { scoutProfileId: sp2.id, modelProfileId: models[1].modelProfile!.id, content: "Ragazzo interessante, stile unico. Proposto per campagna beauty." },
      { scoutProfileId: sp2.id, modelProfileId: models[6].modelProfile!.id, content: "Perfetta per il lookbook Casa Morandi. Estetica cinematografica." },
    ],
  });
  console.log("    ✅ 5 notes");

  // ─────────────────────────────────────────────────────────
  // PROFILE VIEWS & LIKES
  // ─────────────────────────────────────────────────────────
  console.log("\n  👀 Views & likes…");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < Math.min(10, models.length); i++) {
    const mpId = models[i].modelProfile!.id;
    await prisma.profileView.create({ data: { modelProfileId: mpId, viewerId: s1.id, viewDate: yesterday } }).catch(() => {});
    if (i < 5) await prisma.profileView.create({ data: { modelProfileId: mpId, viewerId: s1.id, viewDate: today } }).catch(() => {});
    if (i < 7 && s2.id !== s1.id) await prisma.profileView.create({ data: { modelProfileId: mpId, viewerId: s2.id, viewDate: yesterday } }).catch(() => {});
  }

  const likeTargets = [0, 3, 1, 2, 5, 6, 4];
  const likeFrom   = [s1, s1, s2, s1, s1, s2, s1];
  for (let i = 0; i < likeTargets.length; i++) {
    const mpId = models[likeTargets[i]].modelProfile!.id;
    await prisma.profileLike.create({ data: { modelProfileId: mpId, userId: likeFrom[i].id } }).catch(() => {});
  }
  // If two scouts, add s2 like on model[0] too
  if (s2.id !== s1.id) {
    await prisma.profileLike.create({ data: { modelProfileId: models[0].modelProfile!.id, userId: s2.id } }).catch(() => {});
  }

  // Update like counts
  const likedIds = [...new Set(likeTargets.map((i) => models[i].modelProfile!.id))];
  for (const mpId of likedIds) {
    const count = await prisma.profileLike.count({ where: { modelProfileId: mpId } });
    await prisma.modelProfile.update({ where: { id: mpId }, data: { likeCount: count } });
  }

  console.log("    ✅ Views & likes");

  // ─────────────────────────────────────────────────────────
  console.log("\n🎉 Activity data seeded!\n");
  console.log("  5 castings · ~25 casting apps");
  console.log("  6 jobs · ~28 job apps");
  console.log("  7 contacts (4 with conversations, ~25 messages)");
  console.log("  3 shortlist boards · 12 items");
  console.log(`  ${notifs.length} notifications`);
  console.log("  5 private notes · views & likes\n");
  console.log("Test accounts:");
  console.log(`  Scout:  ${s1.email}`);
  if (s2.id !== s1.id) console.log(`  Scout:  ${s2.email}`);
  console.log(`  Model:  ${models[0].email} (rich data: contacts, messages, applications)`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
