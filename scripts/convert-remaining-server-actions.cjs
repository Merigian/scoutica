const fs = require("fs");

// Helper: replace all occurrences of a string in file content
function replaceAll(content, old, replacement) {
  return content.split(old).join(replacement);
}

// Process a file: add import, then replace strings
function processFile(filePath, importLine, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Add getTranslations import if not already present
  if (!content.includes("getTranslations")) {
    content = content.replace(
      'import { auth } from "@/lib/auth";',
      'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
    );
  }
  
  // Apply replacements
  for (const [old, replacement] of replacements) {
    content = replaceAll(content, old, replacement);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// === castings.ts ===
// Need to add t = await getTranslations("serverErrors") and tc = await getTranslations("serverErrors.castings") 
// at the start of each function
let castings = fs.readFileSync("src/server/actions/castings.ts", "utf8");
if (!castings.includes("getTranslations")) {
  castings = castings.replace(
    'import { auth } from "@/lib/auth";',
    'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
  );
}

// Add translation calls at start of each function
const castingFunctions = [
  ["export async function createCasting(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");'],
  ["export async function updateCasting(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");'],
  ["export async function publishCasting(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");\n  const tm = await getTranslations("serverErrors.modelProfile");'],
  ["export async function closeCasting(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");'],
  ["export async function applyToCasting(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");'],
  ["export async function reviewApplication(", 'const t = await getTranslations("serverErrors");\n  const tc = await getTranslations("serverErrors.castings");'],
];
for (const [funcSig, translationInit] of castingFunctions) {
  // Find the function and add translation right after the opening brace
  const idx = castings.indexOf(funcSig);
  if (idx !== -1) {
    // Find the next "try {" or first line after the opening {
    const afterFunc = castings.indexOf("{\n", idx + funcSig.length);
    if (afterFunc !== -1) {
      const insertPos = afterFunc + 2; // after "{\n"
      castings = castings.slice(0, insertPos) + "  " + translationInit + "\n" + castings.slice(insertPos);
    }
  }
}

// Now replace Italian strings
const castingReplacements = [
  ['"Non autorizzato"', 't("unauthorized")'],
  ['"Dati non validi"', 't("invalidData")'],
  ['"Il tuo account deve essere verificato per creare casting"', 'tc("mustBeVerified")'],
  ['"Casting non trovato"', 'tc("notFound")'],
  ['"Titolo e descrizione sono obbligatori per pubblicare"', 'tm("titleDescRequired")'],
  ['"Casting non trovato o non più aperto"', 'tc("notFoundOrClosed")'],
  ['"Il tuo profilo deve essere pubblicato per candidarti"', 'tc("profileMustBePublished")'],
  ['"Il termine per candidarsi è scaduto"', 'tc("deadlineExpired")'],
  ['"Ti sei già candidato/a a questo casting"', 'tc("alreadyApplied")'],
  ['"Candidatura non trovata"', 'tc("applicationNotFound")'],
];
for (const [old, repl] of castingReplacements) {
  castings = castings.split(old).join(repl);
}

// Notification strings (these use template literals)
castings = castings.replace(
  'title: "Nuova candidatura",',
  'title: tc("newApplicationTitle"),'
);
castings = castings.replace(
  /body: `Una nuova candidatura è stata inviata al tuo casting\.`/,
  'body: tc("newApplicationBody")'
);
// Review application notification
castings = castings.replace(
  /title: action === "accept" \? "Candidatura accettata!" : "Candidatura rifiutata"/,
  'title: action === "accept" ? tc("applicationAccepted") : tc("applicationRejected")'
);
castings = castings.replace(
  /body: action === "accept"\s*\?\s*`La tua candidatura per "[^"]*\$\{application\.casting\.title\}[^`]*`\s*:\s*`La tua candidatura per "[^"]*\$\{application\.casting\.title\}[^`]*`/,
  'body: action === "accept"\n              ? tc("applicationAcceptedBody", { title: application.casting.title })\n              : tc("applicationRejectedBody", { title: application.casting.title })'
);

fs.writeFileSync("src/server/actions/castings.ts", castings);
console.log("Updated castings.ts");

// === jobs.ts ===
let jobs = fs.readFileSync("src/server/actions/jobs.ts", "utf8");
if (!jobs.includes("getTranslations")) {
  jobs = jobs.replace(
    'import { auth } from "@/lib/auth";',
    'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
  );
}

const jobFunctions = [
  ["export async function createJob(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");'],
  ["export async function updateJob(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");'],
  ["export async function publishJob(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");\n  const tm = await getTranslations("serverErrors.modelProfile");'],
  ["export async function closeJob(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");'],
  ["export async function applyToJob(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");'],
  ["export async function reviewJobApplication(", 'const t = await getTranslations("serverErrors");\n  const tj = await getTranslations("serverErrors.jobs");'],
];
for (const [funcSig, translationInit] of jobFunctions) {
  const idx = jobs.indexOf(funcSig);
  if (idx !== -1) {
    const afterFunc = jobs.indexOf("{\n", idx + funcSig.length);
    if (afterFunc !== -1) {
      const insertPos = afterFunc + 2;
      jobs = jobs.slice(0, insertPos) + "  " + translationInit + "\n" + jobs.slice(insertPos);
    }
  }
}

const jobReplacements = [
  ['"Non autorizzato"', 't("unauthorized")'],
  ['"Dati non validi"', 't("invalidData")'],
  ['"Il tuo account deve essere verificato per creare lavori"', 'tj("mustBeVerified")'],
  ['"Lavoro non trovato"', 'tj("notFound")'],
  ['"Titolo e descrizione sono obbligatori per pubblicare"', 'tm("titleDescRequired")'],
  ['"Lavoro non trovato o non più aperto"', 'tj("notFoundOrClosed")'],
  ['"Il tuo profilo deve essere pubblicato per candidarti"', 'tj("profileMustBePublished")'],
  ['"Il termine per candidarsi è scaduto"', 'tj("deadlineExpired")'],
  ['"Ti sei già candidato/a a questo lavoro"', 'tj("alreadyApplied")'],
  ['"Candidatura non trovata"', 'tj("applicationNotFound")'],
];
for (const [old, repl] of jobReplacements) {
  jobs = jobs.split(old).join(repl);
}

jobs = jobs.replace(
  'title: "Nuova candidatura lavoro",',
  'title: tj("newApplicationTitle"),'
);
jobs = jobs.replace(
  /body: `Una nuova candidatura è stata inviata al tuo lavoro "\$\{job\.title\}"\.`/,
  'body: tj("newApplicationBody", { title: job.title })'
);
jobs = jobs.replace(
  /title: action === "accept" \? "Candidatura lavoro accettata!" : "Candidatura lavoro rifiutata"/,
  'title: action === "accept" ? tj("applicationAccepted") : tj("applicationRejected")'
);
jobs = jobs.replace(
  /body: action === "accept"\s*\?\s*`La tua candidatura per "[^"]*\$\{application\.job\.title\}[^`]*`\s*:\s*`La tua candidatura per "[^"]*\$\{application\.job\.title\}[^`]*`/,
  'body: action === "accept"\n              ? tj("applicationAcceptedBody", { title: application.job.title })\n              : tj("applicationRejectedBody", { title: application.job.title })'
);

fs.writeFileSync("src/server/actions/jobs.ts", jobs);
console.log("Updated jobs.ts");

// === contact-request.ts ===
let cr = fs.readFileSync("src/server/actions/contact-request.ts", "utf8");
if (!cr.includes("getTranslations")) {
  cr = cr.replace(
    'import { auth } from "@/lib/auth";',
    'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
  );
}

const crFunctions = [
  ["export async function sendContactRequest(", 'const t = await getTranslations("serverErrors");\n  const tcr = await getTranslations("serverErrors.contactRequest");'],
  ["export async function respondToContactRequest(", 'const t = await getTranslations("serverErrors");\n  const tcr = await getTranslations("serverErrors.contactRequest");'],
];
for (const [funcSig, translationInit] of crFunctions) {
  const idx = cr.indexOf(funcSig);
  if (idx !== -1) {
    const afterFunc = cr.indexOf("{\n", idx + funcSig.length);
    if (afterFunc !== -1) {
      const insertPos = afterFunc + 2;
      cr = cr.slice(0, insertPos) + "  " + translationInit + "\n" + cr.slice(insertPos);
    }
  }
}

const crReplacements = [
  ['"Non autorizzato"', 't("unauthorized")'],
  ['"Dati non validi"', 't("invalidData")'],
  ['"Profilo scout non trovato"', 't("scoutProfileNotFound")'],
  ['"Il tuo account deve essere verificato per inviare richieste di contatto"', 'tcr("mustBeVerified")'],
  ['"Il tuo piano non include richieste di contatto. Passa a Starter o Pro."', 'tcr("planNoContacts")'],
  ['"Hai già inviato una richiesta a questo modello/a"', 'tcr("alreadySent")'],
  ['"Profilo non trovato o non pubblicato"', 't("profileNotFoundOrNotPublished")'],
  ['"Non è possibile contattare questo profilo"', 'tcr("cannotContactProfile")'],
  ['"Richiesta non trovata"', 'tcr("requestNotFound")'],
  ['"Questa richiesta è già stata gestita"', 'tcr("alreadyHandled")'],
];
for (const [old, repl] of crReplacements) {
  cr = cr.split(old).join(repl);
}

// Monthly/daily limit template literals
cr = cr.replace(
  /`Hai raggiunto il limite mensile di \$\{limits\.contactRequestsPerMonth\} richieste`/,
  'tcr("monthlyLimitReached", { limit: limits.contactRequestsPerMonth })'
);
cr = cr.replace(
  /`Hai raggiunto il limite giornaliero di \$\{limits\.contactRequestsPerDay\} richieste`/,
  'tcr("dailyLimitReached", { limit: limits.contactRequestsPerDay })'
);

// Notification strings
cr = cr.replace(
  'title: "Nuova richiesta di contatto",',
  'title: tcr("newContactRequestTitle"),'
);
cr = cr.replace(
  'title: "Richiesta accettata!",',
  'title: tcr("accepted"),'
);
cr = cr.replace(
  'body: "La tua richiesta di contatto è stata accettata. Puoi iniziare una conversazione.",',
  'body: tcr("requestAccepted"),'
);
cr = cr.replace(
  'title: "Richiesta rifiutata",',
  'title: tcr("rejected"),'
);
cr = cr.replace(
  'body: "La tua richiesta di contatto è stata rifiutata.",',
  'body: tcr("requestRejected"),'
);

fs.writeFileSync("src/server/actions/contact-request.ts", cr);
console.log("Updated contact-request.ts");

// === messages.ts ===
let msg = fs.readFileSync("src/server/actions/messages.ts", "utf8");
if (!msg.includes("getTranslations")) {
  msg = msg.replace(
    'import { auth } from "@/lib/auth";',
    'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
  );
}

const msgFunctions = [
  ["export async function sendMessage(", 'const t = await getTranslations("serverErrors");\n  const tm = await getTranslations("serverErrors.messages");'],
  ["export async function markConversationRead(", 'const t = await getTranslations("serverErrors");'],
  ["export async function getConversations(", 'const tm = await getTranslations("serverErrors.messages");'],
  ["export async function getConversationMessages(", 'const tm = await getTranslations("serverErrors.messages");'],
];
for (const [funcSig, translationInit] of msgFunctions) {
  const idx = msg.indexOf(funcSig);
  if (idx !== -1) {
    const afterFunc = msg.indexOf("{\n", idx + funcSig.length);
    if (afterFunc !== -1) {
      const insertPos = afterFunc + 2;
      msg = msg.slice(0, insertPos) + "  " + translationInit + "\n" + msg.slice(insertPos);
    }
  }
}

const msgReplacements = [
  ['"Non autorizzato"', 't("unauthorized")'],
  ['"Messaggio non valido"', 'tm("invalidMessage")'],
  ['"Non fai parte di questa conversazione"', 'tm("notInConversation")'],
  ['"Nuovo messaggio"', 'tm("newMessageTitle")'],
  ['"Utente"', 'tm("userFallback")'],
];
for (const [old, repl] of msgReplacements) {
  msg = msg.split(old).join(repl);
}

fs.writeFileSync("src/server/actions/messages.ts", msg);
console.log("Updated messages.ts");

// === shortlists.ts ===
let sl = fs.readFileSync("src/server/actions/shortlists.ts", "utf8");
if (!sl.includes("getTranslations")) {
  sl = sl.replace(
    'import { auth } from "@/lib/auth";',
    'import { auth } from "@/lib/auth";\nimport { getTranslations } from "next-intl/server";'
  );
}

const slFunctions = [
  ["export async function createBoard(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
  ["export async function deleteBoard(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
  ["export async function addToBoard(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
  ["export async function removeFromBoard(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
  ["export async function updatePipelineStage(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
  ["export async function updateItemNote(", 'const t = await getTranslations("serverErrors");\n  const ts = await getTranslations("serverErrors.shortlists");'],
];
for (const [funcSig, translationInit] of slFunctions) {
  const idx = sl.indexOf(funcSig);
  if (idx !== -1) {
    const afterFunc = sl.indexOf("{\n", idx + funcSig.length);
    if (afterFunc !== -1) {
      const insertPos = afterFunc + 2;
      sl = sl.slice(0, insertPos) + "  " + translationInit + "\n" + sl.slice(insertPos);
    }
  }
}

const slReplacements = [
  ['"Non autorizzato"', 't("unauthorized")'],
  ['"Profilo non trovato"', 't("profileNotFound")'],
  ['"Il tuo piano non include bacheche shortlist"', 'ts("planNoBoards")'],
  ['"Bacheca non trovata"', 'ts("boardNotFound")'],
  ['"Questo profilo è già nella bacheca"', 'ts("alreadyInBoard")'],
  ['"Elemento non trovato"', 'ts("itemNotFound")'],
];
for (const [old, repl] of slReplacements) {
  sl = sl.split(old).join(repl);
}

// Template literal limits
sl = sl.replace(
  /`Hai raggiunto il limite di \$\{limits\.maxShortlistBoards\} bacheche`/,
  'ts("boardLimitReached", { limit: limits.maxShortlistBoards })'
);
sl = sl.replace(
  /`Hai raggiunto il limite di \$\{limits\.maxItemsPerBoard\} profili per bacheca`/,
  'ts("itemLimitReached", { limit: limits.maxItemsPerBoard })'
);

fs.writeFileSync("src/server/actions/shortlists.ts", sl);
console.log("Updated shortlists.ts");

console.log("\nDone! All remaining server action files converted.");
