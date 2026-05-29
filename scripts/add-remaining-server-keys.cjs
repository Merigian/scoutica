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

// castings server errors
const caEn = ensureNs(en, "serverErrors.castings");
const caIt = ensureNs(it, "serverErrors.castings");
const caPairs = [
  ["newApplicationTitle", "New application", "Nuova candidatura"],
  ["newApplicationBody", "A new application has been submitted to your casting.", "Una nuova candidatura è stata inviata al tuo casting."],
  ["applicationAcceptedBody", "Your application for \"{title}\" has been accepted.", "La tua candidatura per \"{title}\" è stata accettata."],
  ["applicationRejectedBody", "Your application for \"{title}\" has been rejected.", "La tua candidatura per \"{title}\" è stata rifiutata."],
];
for (const [k, e, i] of caPairs) { caEn[k] = e; caIt[k] = i; }

// jobs server errors
const joEn = ensureNs(en, "serverErrors.jobs");
const joIt = ensureNs(it, "serverErrors.jobs");
const joPairs = [
  ["newApplicationTitle", "New job application", "Nuova candidatura lavoro"],
  ["newApplicationBody", "A new application has been submitted to your job \"{title}\".", "Una nuova candidatura è stata inviata al tuo lavoro \"{title}\"."],
  ["applicationAcceptedBody", "Your application for \"{title}\" has been accepted.", "La tua candidatura per \"{title}\" è stata accettata."],
  ["applicationRejectedBody", "Your application for \"{title}\" has been rejected.", "La tua candidatura per \"{title}\" è stata rifiutata."],
];
for (const [k, e, i] of joPairs) { joEn[k] = e; joIt[k] = i; }

// contact-request server errors
const crEn = ensureNs(en, "serverErrors.contactRequest");
const crIt = ensureNs(it, "serverErrors.contactRequest");
const crPairs2 = [
  ["monthlyLimitReached", "You have reached the monthly limit of {limit} requests", "Hai raggiunto il limite mensile di {limit} richieste"],
  ["dailyLimitReached", "You have reached the daily limit of {limit} requests", "Hai raggiunto il limite giornaliero di {limit} richieste"],
  ["cannotContactProfile", "Cannot contact this profile", "Non è possibile contattare questo profilo"],
  ["newContactRequestTitle", "New contact request", "Nuova richiesta di contatto"],
];
for (const [k, e, i] of crPairs2) { crEn[k] = e; crIt[k] = i; }

// messages server errors
const meEn = ensureNs(en, "serverErrors.messages");
const meIt = ensureNs(it, "serverErrors.messages");
const mePairs = [
  ["invalidMessage", "Invalid message", "Messaggio non valido"],
  ["notInConversation", "You are not part of this conversation", "Non fai parte di questa conversazione"],
  ["newMessageTitle", "New message", "Nuovo messaggio"],
  ["userFallback", "User", "Utente"],
];
for (const [k, e, i] of mePairs) { meEn[k] = e; meIt[k] = i; }

// shortlists server errors  
const slEn = ensureNs(en, "serverErrors.shortlists");
const slIt = ensureNs(it, "serverErrors.shortlists");
const slPairs2 = [
  ["boardLimitReached", "You have reached the limit of {limit} boards", "Hai raggiunto il limite di {limit} bacheche"],
  ["itemLimitReached", "You have reached the limit of {limit} profiles per board", "Hai raggiunto il limite di {limit} profili per bacheca"],
];
for (const [k, e, i] of slPairs2) { slEn[k] = e; slIt[k] = i; }

// model-profile titleDescRequired (missed earlier)
const mpEn = ensureNs(en, "serverErrors.modelProfile");
const mpIt = ensureNs(it, "serverErrors.modelProfile");
// already added in previous script, skip duplicates

const total = caPairs.length + joPairs.length + crPairs2.length + mePairs.length + slPairs2.length;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
fs.writeFileSync(itPath, JSON.stringify(it, null, 2) + "\n");
console.log(`Done adding ${total} key pairs for remaining server action errors`);
