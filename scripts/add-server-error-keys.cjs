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

// Shared server errors
const seEn = ensureNs(en, "serverErrors");
const seIt = ensureNs(it, "serverErrors");
const sePairs = [
  ["unauthorized", "Unauthorized", "Non autorizzato"],
  ["profileNotFound", "Profile not found", "Profilo non trovato"],
  ["error", "Error", "Errore"],
  ["studioNotFound", "Studio not found", "Studio non trovato"],
  ["studioProfileNotFound", "Studio profile not found", "Profilo studio non trovato"],
  ["imageNotFound", "Image not found", "Immagine non trovata"],
  ["notFound", "Not found", "Non trovato"],
  ["invalidData", "Invalid data", "Dati non validi"],
  ["scoutProfileNotFound", "Scout profile not found", "Profilo scout non trovato"],
  ["profileNotFoundOrNotPublished", "Profile not found or not published", "Profilo non trovato o non pubblicato"],
  ["registrationError", "Error during registration", "Errore durante la registrazione"],
  ["requestSendError", "Error sending request", "Errore durante l'invio della richiesta"],
  ["emailAlreadyRegistered", "This email is already registered", "Questa email è già registrata"],
];
for (const [k, e, i] of sePairs) { seEn[k] = e; seIt[k] = i; }

// portfolio.ts errors
const pfEn = ensureNs(en, "serverErrors.portfolio");
const pfIt = ensureNs(it, "serverErrors.portfolio");
const pfPairs = [
  ["maxPhotos", "Maximum {max} images", "Massimo {max} immagini"],
  ["uploadError", "Error during upload", "Errore durante il caricamento"],
  ["deleteError", "Error during deletion", "Errore durante l'eliminazione"],
  ["setCoverError", "Error during setting", "Errore durante l'impostazione"],
  ["reorderError", "Error during reordering", "Errore durante il riordinamento"],
];
for (const [k, e, i] of pfPairs) { pfEn[k] = e; pfIt[k] = i; }

// stripe.ts errors
const stEn = ensureNs(en, "serverErrors.stripe");
const stIt = ensureNs(it, "serverErrors.stripe");
const stPairs = [
  ["invalidPlan", "Invalid plan", "Piano non valido"],
  ["paymentSessionError", "Error creating payment session", "Errore nella creazione della sessione di pagamento"],
  ["noActiveSubscription", "No active subscription", "Nessun abbonamento attivo"],
  ["profileMustBePublished", "Your profile must be published to purchase a boost", "Il tuo profilo deve essere pubblicato per acquistare un boost"],
];
for (const [k, e, i] of stPairs) { stEn[k] = e; stIt[k] = i; }

// model-profile.ts errors
const mpEn = ensureNs(en, "serverErrors.modelProfile");
const mpIt = ensureNs(it, "serverErrors.modelProfile");
const mpPairs = [
  ["updateError", "Error updating profile", "Errore durante l'aggiornamento del profilo"],
  ["missingRequirements", "Missing requirements: {missing}", "Requisiti mancanti: {missing}"],
  ["publishError", "Error during publishing", "Errore durante la pubblicazione"],
  ["unpublishError", "Error during removal", "Errore durante la rimozione"],
  ["titleDescRequired", "Title and description are required to publish", "Titolo e descrizione sono obbligatori per pubblicare"],
];
for (const [k, e, i] of mpPairs) { mpEn[k] = e; mpIt[k] = i; }

// studio-bookings.ts errors
const sbEn = ensureNs(en, "serverErrors.studioBookings");
const sbIt = ensureNs(it, "serverErrors.studioBookings");
const sbPairs = [
  ["datesNoLongerAvailable", "Selected dates are no longer available", "Le date selezionate non sono più disponibili"],
  ["someDatesUnavailable", "Some selected dates are not available", "Alcune date selezionate non sono disponibili"],
  ["bookingError", "Error during booking", "Errore durante la prenotazione"],
  ["bookingNotFound", "Booking not found", "Prenotazione non trovata"],
  ["bookingNotPending", "Booking not pending", "Prenotazione non in attesa"],
  ["onlyConfirmedBookings", "Only confirmed bookings", "Solo prenotazioni confermate"],
  ["newBookingTitle", "New booking — {studio}", "Nuova prenotazione — {studio}"],
  ["newBookingBody", "{name} requested a booking from {from} to {to}", "{name} ha richiesto una prenotazione dal {from} al {to}"],
  ["bookingConfirmedTitle", "Booking confirmed — {studio}", "Prenotazione confermata — {studio}"],
  ["bookingConfirmedBody", "Your booking from {from} to {to} has been confirmed.", "La tua prenotazione dal {from} al {to} è stata confermata."],
  ["bookingCancelledTitle", "Booking cancelled — {studio}", "Prenotazione cancellata — {studio}"],
  ["bookingCancelledBody", "Your booking from {from} to {to} has been cancelled.", "La tua prenotazione dal {from} al {to} è stata cancellata."],
];
for (const [k, e, i] of sbPairs) { sbEn[k] = e; sbIt[k] = i; }

// scout-profile.ts
const spEn = ensureNs(en, "serverErrors.scoutProfile");
const spIt = ensureNs(it, "serverErrors.scoutProfile");
const spPairs = [
  ["updateError", "Error during update", "Errore durante l'aggiornamento"],
  ["submitError", "Error sending request", "Errore durante l'invio della richiesta"],
];
for (const [k, e, i] of spPairs) { spEn[k] = e; spIt[k] = i; }

// studios.ts
const suEn = ensureNs(en, "serverErrors.studios");
const suIt = ensureNs(it, "serverErrors.studios");
const suPairs = [
  ["createError", "Error during creation", "Errore durante la creazione"],
  ["updateError", "Error during update", "Errore durante l'aggiornamento"],
  ["publishError", "Error during publishing", "Errore durante la pubblicazione"],
  ["deleteError", "Error during deletion", "Errore durante l'eliminazione"],
  ["newInquiryTitle", "New inquiry for your studio", "Nuova richiesta per il tuo studio"],
  ["newInquiryBody", "{name} sent an inquiry for \"{studio}\"", "{name} ha inviato una richiesta per \"{studio}\""],
  ["inquiryNotFound", "Inquiry not found", "Richiesta non trovata"],
];
for (const [k, e, i] of suPairs) { suEn[k] = e; suIt[k] = i; }

// auth.ts
const auEn = ensureNs(en, "serverErrors.auth");
const auIt = ensureNs(it, "serverErrors.auth");
const auPairs = [
  ["resetEmailSent", "Success", "Email inviata"],
];
for (const [k, e, i] of auPairs) { auEn[k] = e; auIt[k] = i; }

// contact-request.ts
const crEn = ensureNs(en, "serverErrors.contactRequest");
const crIt = ensureNs(it, "serverErrors.contactRequest");
const crPairs = [
  ["alreadySent", "You have already sent a request to this model", "Hai già inviato una richiesta a questo modello/a"],
  ["mustBeVerified", "Your account must be verified to send contact requests", "Il tuo account deve essere verificato per inviare richieste di contatto"],
  ["planNoContacts", "Your plan does not include contact requests. Upgrade to Starter or Pro.", "Il tuo piano non include richieste di contatto. Passa a Starter o Pro."],
  ["accepted", "Contact request accepted!", "Richiesta accettata!"],
  ["rejected", "Contact request rejected", "Richiesta rifiutata"],
  ["alreadyHandled", "This request has already been handled", "Questa richiesta è già stata gestita"],
  ["requestAccepted", "Your contact request has been accepted. You can start a conversation.", "La tua richiesta di contatto è stata accettata. Puoi iniziare una conversazione."],
  ["requestRejected", "Your contact request has been rejected.", "La tua richiesta di contatto è stata rifiutata."],
  ["invalidMessage", "Invalid message", "Messaggio non valido"],
  ["notInConversation", "You are not part of this conversation", "Non fai parte di questa conversazione"],
];
for (const [k, e, i] of crPairs) { crEn[k] = e; crIt[k] = i; }

// shortlists.ts
const slEn = ensureNs(en, "serverErrors.shortlists");
const slIt = ensureNs(it, "serverErrors.shortlists");
const slPairs = [
  ["planNoBoards", "Your plan does not include shortlist boards", "Il tuo piano non include bacheche shortlist"],
  ["boardNotFound", "Board not found", "Bacheca non trovata"],
  ["itemNotFound", "Item not found", "Elemento non trovato"],
  ["alreadyInBoard", "This profile is already in the board", "Questo profilo è già nella bacheca"],
];
for (const [k, e, i] of slPairs) { slEn[k] = e; slIt[k] = i; }

// castings.ts
const caEn = ensureNs(en, "serverErrors.castings");
const caIt = ensureNs(it, "serverErrors.castings");
const caPairs = [
  ["mustBeVerified", "Your account must be verified to create castings", "Il tuo account deve essere verificato per creare casting"],
  ["notFoundOrClosed", "Casting not found or no longer open", "Casting non trovato o non più aperto"],
  ["notFound", "Casting not found", "Casting non trovato"],
  ["profileMustBePublished", "Your profile must be published to apply", "Il tuo profilo deve essere pubblicato per candidarti"],
  ["deadlineExpired", "The application deadline has expired", "Il termine per candidarsi è scaduto"],
  ["alreadyApplied", "You have already applied to this casting", "Ti sei già candidato/a a questo casting"],
  ["applicationNotFound", "Application not found", "Candidatura non trovata"],
  ["applicationAccepted", "Application accepted!", "Candidatura accettata!"],
  ["applicationRejected", "Application rejected", "Candidatura rifiutata"],
];
for (const [k, e, i] of caPairs) { caEn[k] = e; caIt[k] = i; }

// jobs.ts
const joEn = ensureNs(en, "serverErrors.jobs");
const joIt = ensureNs(it, "serverErrors.jobs");
const joPairs = [
  ["mustBeVerified", "Your account must be verified to create jobs", "Il tuo account deve essere verificato per creare lavori"],
  ["notFoundOrClosed", "Job not found or no longer open", "Lavoro non trovato o non più aperto"],
  ["notFound", "Job not found", "Lavoro non trovato"],
  ["alreadyApplied", "You have already applied to this job", "Ti sei già candidato/a a questo lavoro"],
  ["applicationAccepted", "Job application accepted!", "Candidatura lavoro accettata!"],
  ["applicationRejected", "Job application rejected", "Candidatura lavoro rifiutata"],
];
for (const [k, e, i] of joPairs) { joEn[k] = e; joIt[k] = i; }

// admin.ts / verification
const adEn = ensureNs(en, "serverErrors.admin");
const adIt = ensureNs(it, "serverErrors.admin");
const adPairs = [
  ["verificationApproved", "Verification approved!", "Verifica approvata!"],
  ["verificationRejected", "Verification rejected", "Verifica rifiutata"],
  ["accountVerified", "Your account has been verified. You can now access all features.", "Il tuo account è stato verificato. Ora puoi accedere a tutte le funzionalità."],
  ["verificationRejectedNotif", "Your verification request has been rejected.", "La tua richiesta di verifica è stata rifiutata."],
];
for (const [k, e, i] of adPairs) { adEn[k] = e; adIt[k] = i; }

const total = sePairs.length + pfPairs.length + stPairs.length + mpPairs.length + 
  sbPairs.length + spPairs.length + suPairs.length + auPairs.length +
  crPairs.length + slPairs.length + caPairs.length + joPairs.length + adPairs.length;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
fs.writeFileSync(itPath, JSON.stringify(it, null, 2) + "\n");
console.log(`Done adding ${total} key pairs for server errors`);
