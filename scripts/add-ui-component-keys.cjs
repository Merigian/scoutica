const fs = require("fs");
const enPath = "src/messages/en.json";
const itPath = "src/messages/it.json";
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const it = JSON.parse(fs.readFileSync(itPath, "utf8"));

function ensureNs(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur[p]) cur[p] = {};
    cur = cur[p];
  }
  return cur;
}

// completeness-score.tsx
const csEn = ensureNs(en, "components.completenessScore");
const csIt = ensureNs(it, "components.completenessScore");
const csPairs = [
  ["basic", "Basic profile", "Profilo base"],
  ["almostComplete", "Almost complete", "Quasi completo"],
  ["ready", "Ready to be discovered", "Pronto per essere scoperto"],
  ["completeProfile", "Complete your profile to increase visibility in searches.", "Completa il tuo profilo per aumentare la visibilità nelle ricerche."],
];
for (const [k, e, i] of csPairs) { csEn[k] = e; csIt[k] = i; }

// publish-control.tsx
const pcEn = ensureNs(en, "components.publishControl");
const pcIt = ensureNs(it, "components.publishControl");
const pcPairs = [
  ["reqAge", "Age 18+", "Età 18+"],
  ["reqName", "Full name", "Nome completo"],
  ["reqImage", "At least 1 image", "Almeno 1 immagine"],
  ["reqCover", "Cover image set", "Immagine di copertina"],
  ["published", "Profile published", "Profilo pubblicato"],
  ["notPublished", "Profile not published", "Profilo non pubblicato"],
  ["online", "Online", "Online"],
  ["offline", "Offline", "Offline"],
  ["hideProfile", "Hide profile", "Nascondi profilo"],
  ["publishProfile", "Publish profile", "Pubblica profilo"],
  ["requirementsMessage", "To publish your profile you must meet all requirements:", "Per pubblicare il profilo devi soddisfare tutti i requisiti:"],
];
for (const [k, e, i] of pcPairs) { pcEn[k] = e; pcIt[k] = i; }

// applications/page.tsx STATUS_CONFIG
const apEn = ensureNs(en, "pages.model.applications");
const apIt = ensureNs(it, "pages.model.applications");
const apPairs = [
  ["statusPending", "Pending", "In attesa"],
  ["statusAccepted", "Accepted", "Accettata"],
  ["statusRejected", "Rejected", "Rifiutata"],
  ["statusWithdrawn", "Withdrawn", "Ritirata"],
];
for (const [k, e, i] of apPairs) { apEn[k] = e; apIt[k] = i; }

// contact-request-list.tsx status labels
const crEn = ensureNs(en, "components.contactRequests");
const crIt = ensureNs(it, "components.contactRequests");
const crPairs = [
  ["statusPending", "Pending", "In attesa"],
  ["statusAccepted", "Accepted", "Accettata"],
  ["statusRejected", "Rejected", "Rifiutata"],
  ["statusExpired", "Expired", "Scaduta"],
];
for (const [k, e, i] of crPairs) { crEn[k] = e; crIt[k] = i; }

// plans.ts
const plEn = ensureNs(en, "config.plans");
const plIt = ensureNs(it, "config.plans");
const plPairs = [
  ["month", "month", "mese"],
  // Model Pro features
  ["modelProPhotos", "Up to 9 portfolio photos", "Fino a 9 foto nel portfolio"],
  ["modelProVideo", "1 video upload", "Upload di 1 video"],
  ["modelProPdf", "PDF book upload", "Upload del book PDF"],
  ["modelProBadge", "Pro badge on profile", "Badge Pro sul profilo"],
  ["modelProSupport", "Priority support", "Supporto prioritario"],
  // Starter features
  ["starterContacts", "20 contact requests per month", "20 richieste di contatto al mese"],
  ["starterDaily", "5 requests per day", "5 richieste al giorno"],
  ["starterBoards", "3 shortlist boards", "3 bacheche shortlist"],
  ["starterProfiles", "Up to 50 profiles per board", "Fino a 50 profili per bacheca"],
  ["starterFilters", "Basic filters", "Filtri base"],
  // Pro features
  ["proContacts", "100 contact requests per month", "100 richieste di contatto al mese"],
  ["proDaily", "25 requests per day", "25 richieste al giorno"],
  ["proBoards", "Unlimited boards", "Bacheche illimitate"],
  ["proProfiles", "Unlimited profiles per board", "Profili illimitati per bacheca"],
  ["proFilters", "Advanced filters", "Filtri avanzati"],
  ["proSearches", "Saved searches", "Ricerche salvate"],
  ["proSupport", "Priority support", "Supporto prioritario"],
];
for (const [k, e, i] of plPairs) { plEn[k] = e; plIt[k] = i; }

const total = csPairs.length + pcPairs.length + apPairs.length + crPairs.length + plPairs.length;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
fs.writeFileSync(itPath, JSON.stringify(it, null, 2) + "\n");
console.log(`Done adding ${total} key pairs for UI components`);
