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

// pages.studio.createStudio
const csEn = ensureNs(en, "pages.studio.createStudio");
const csIt = ensureNs(it, "pages.studio.createStudio");
csEn["nameRequired"] = "Studio name is required";
csIt["nameRequired"] = "Il nome dello studio è obbligatorio";

// stripe webhook notification
const swEn = ensureNs(en, "serverErrors.stripe");
const swIt = ensureNs(it, "serverErrors.stripe");
swEn["boostActivatedTitle"] = "Boost activated!";
swIt["boostActivatedTitle"] = "Boost attivato!";
swEn["boostActivatedBody"] = "Your profile will be featured for 7 days.";
swIt["boostActivatedBody"] = "Il tuo profilo sarà in evidenza per 7 giorni.";

// layout.tsx metadata
const metaEn = ensureNs(en, "metadata");
const metaIt = ensureNs(it, "metadata");
metaEn["title"] = "Scoutica — The Italian platform for professional scouting";
metaIt["title"] = "Scoutica — La piattaforma italiana per lo scouting professionale";
metaEn["description"] = "The professional platform that connects models with verified scouts, agencies and brands in Italy.";
metaIt["description"] = "La piattaforma professionale che connette modelli con scout, agenzie e brand verificati in Italia.";

// castings - "profileMustBePublished" key with "per candidarti" (missed in castings)
const cpEn = ensureNs(en, "serverErrors.castings");
const cpIt = ensureNs(it, "serverErrors.castings");
if (!cpEn["profileMustBePublished"]) {
  cpEn["profileMustBePublished"] = "Your profile must be published to apply";
  cpIt["profileMustBePublished"] = "Il tuo profilo deve essere pubblicato per candidarti";
}
if (!cpEn["deadlineExpired"]) {
  cpEn["deadlineExpired"] = "The application deadline has expired";
  cpIt["deadlineExpired"] = "Il termine per candidarsi è scaduto";
}

// jobs - same keys
const jpEn = ensureNs(en, "serverErrors.jobs");
const jpIt = ensureNs(it, "serverErrors.jobs");
if (!jpEn["profileMustBePublished"]) {
  jpEn["profileMustBePublished"] = "Your profile must be published to apply";
  jpIt["profileMustBePublished"] = "Il tuo profilo deve essere pubblicato per candidarti";
}
if (!jpEn["deadlineExpired"]) {
  jpEn["deadlineExpired"] = "The application deadline has expired";
  jpIt["deadlineExpired"] = "Il termine per candidarsi è scaduto";
}
if (!jpEn["applicationNotFound"]) {
  jpEn["applicationNotFound"] = "Application not found";
  jpIt["applicationNotFound"] = "Candidatura non trovata";
}

// contact-request requestNotFound (missed)
const crEn = ensureNs(en, "serverErrors.contactRequest");
const crIt = ensureNs(it, "serverErrors.contactRequest");
if (!crEn["requestNotFound"]) {
  crEn["requestNotFound"] = "Request not found";
  crIt["requestNotFound"] = "Richiesta non trovata";
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
fs.writeFileSync(itPath, JSON.stringify(it, null, 2) + "\n");
console.log("Done adding final keys");
