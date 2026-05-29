const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

const pairs = [
  // search-filters.tsx
  ['components.searchFilters.searchPlaceholder', 'Search by name, city, bio...', 'Cerca per nome, città, bio...'],
  ['components.searchFilters.sortRelevance', 'Relevance', 'Rilevanza'],
  ['components.searchFilters.sortRecent', 'Most recent', 'Più recenti'],
  ['components.searchFilters.sortCompleteness', 'Completeness', 'Profilo completo'],
  ['components.searchFilters.sortPopular', 'Most popular', 'Più popolari'],
  ['components.searchFilters.sortBy', 'Sort by', 'Ordina per'],
  ['components.searchFilters.region', 'Region', 'Regione'],
  ['components.searchFilters.allFem', 'All', 'Tutte'],
  ['components.searchFilters.city', 'City', 'Città'],
  ['components.searchFilters.gender', 'Gender', 'Genere'],
  ['components.searchFilters.allMasc', 'All', 'Tutti'],
  ['components.searchFilters.category', 'Category', 'Categoria'],
  ['components.searchFilters.advancedFilters', 'Advanced filters', 'Filtri avanzati'],
  ['components.searchFilters.clearFilters', 'Clear filters', 'Cancella filtri'],
  ['components.searchFilters.loading', 'Loading...', 'Caricamento...'],
  ['components.searchFilters.bodySection', 'Body & Measurements', 'Fisico & Misure'],
  ['components.searchFilters.heightMin', 'Min height (cm)', 'Altezza min (cm)'],
  ['components.searchFilters.heightMax', 'Max height (cm)', 'Altezza max (cm)'],
  ['components.searchFilters.ageMin', 'Min age', 'Età min'],
  ['components.searchFilters.ageMax', 'Max age', 'Età max'],
  ['components.searchFilters.bustMin', 'Bust min (cm)', 'Busto min (cm)'],
  ['components.searchFilters.waistMin', 'Waist min (cm)', 'Vita min (cm)'],
  ['components.searchFilters.hipsMin', 'Hips min (cm)', 'Fianchi min (cm)'],
  ['components.searchFilters.bustMax', 'Bust max (cm)', 'Busto max (cm)'],
  ['components.searchFilters.waistMax', 'Waist max (cm)', 'Vita max (cm)'],
  ['components.searchFilters.hipsMax', 'Hips max (cm)', 'Fianchi max (cm)'],
  ['components.searchFilters.shoeMin', 'Shoe min (EU)', 'Scarpe min (EU)'],
  ['components.searchFilters.shoeMax', 'Shoe max (EU)', 'Scarpe max (EU)'],
  ['components.searchFilters.appearance', 'Appearance', 'Aspetto'],
  ['components.searchFilters.eyeColor', 'Eye color', 'Colore occhi'],
  ['components.searchFilters.hairColor', 'Hair color', 'Colore capelli'],
  ['components.searchFilters.ethnicity', 'Ethnicity', 'Etnia'],
  ['components.searchFilters.professional', 'Professional', 'Professionale'],
  ['components.searchFilters.status', 'Status', 'Status'],
  ['components.searchFilters.spokenLanguage', 'Spoken language', 'Lingua parlata'],
  ['components.searchFilters.availableToTravel', 'Available to travel', 'Disponibile a viaggiare'],

  // casting-form.tsx
  ['components.castingForm.cardTitle', 'Casting details', 'Dettagli del casting'],
  ['components.castingForm.title', 'Title', 'Titolo'],
  ['components.castingForm.titlePlaceholder', 'E.g.: Casting for SS25 campaign', 'Es: Casting per campagna SS25'],
  ['components.castingForm.description', 'Description', 'Descrizione'],
  ['components.castingForm.descPlaceholder', 'Describe the casting in detail...', 'Descrivi il casting in dettaglio...'],
  ['components.castingForm.city', 'City', 'Città'],
  ['components.castingForm.region', 'Region', 'Regione'],
  ['components.castingForm.select', 'Select...', 'Seleziona...'],
  ['components.castingForm.castingDate', 'Casting date', 'Data casting'],
  ['components.castingForm.deadline', 'Application deadline', 'Scadenza candidature'],
  ['components.castingForm.typeCardTitle', 'Casting type', 'Tipo di casting'],
  ['components.castingForm.mode', 'Mode', 'Modalità'],
  ['components.castingForm.time', 'Time', 'Orario'],
  ['components.castingForm.timePlaceholder', 'E.g.: 10:00 AM - 6:00 PM', 'Es: 10:00 - 18:00'],
  ['components.castingForm.address', 'Address', 'Indirizzo'],
  ['components.castingForm.addressPlaceholder', 'E.g.: 8 Via Montenapoleone, Milan', 'Es: Via Montenapoleone 8, Milano'],
  ['components.castingForm.onlineInstructions', 'Online casting instructions', 'Istruzioni per il casting online'],
  ['components.castingForm.onlineInstructionsPlaceholder', 'E.g.: Send a 30-second selfie video...', 'Es: Inviare un video selfie di 30 secondi...'],
  ['components.castingForm.materials', 'Required materials', 'Materiali richiesti'],
  ['components.castingForm.materialsPlaceholder', 'E.g.: Photo book, comp card, ID...', "Es: Book fotografico, comp card, documento d'identità..."],
  ['components.castingForm.requirementsCardTitle', 'Requirements & compensation', 'Requisiti e compenso'],
  ['components.castingForm.requirements', 'Requirements', 'Requisiti'],
  ['components.castingForm.requirementsPlaceholder', 'E.g.: Min height 175cm, runway experience...', 'Es: Altezza minima 175cm, esperienza in passerella...'],
  ['components.castingForm.compensation', 'Compensation', 'Compenso'],
  ['components.castingForm.compensationPlaceholder', 'E.g.: €500/day', 'Es: €500/giorno'],
  ['components.castingForm.spots', 'Available spots', 'Posti disponibili'],
  ['components.castingForm.paidJob', 'This is a paid job', 'Questo è un lavoro retribuito'],
  ['components.castingForm.notes', 'Additional notes (private)', 'Note aggiuntive (solo per te)'],
  ['components.castingForm.cancel', 'Cancel', 'Annulla'],
  ['components.castingForm.saveChanges', 'Save changes', 'Salva modifiche'],
  ['components.castingForm.create', 'Create casting', 'Crea casting'],

  // job-form.tsx
  ['components.jobForm.cardTitle', 'Job details', 'Dettagli del lavoro'],
  ['components.jobForm.title', 'Title', 'Titolo'],
  ['components.jobForm.titlePlaceholder', 'E.g.: Shooting for fashion brand', 'Es: Shooting per brand moda'],
  ['components.jobForm.description', 'Description', 'Descrizione'],
  ['components.jobForm.descPlaceholder', 'Describe the job in detail...', 'Descrivi il lavoro in dettaglio...'],
  ['components.jobForm.jobType', 'Job type', 'Tipo di lavoro'],
  ['components.jobForm.select', 'Select...', 'Seleziona...'],
  ['components.jobForm.brand', 'Brand / Client', 'Brand / Cliente'],
  ['components.jobForm.city', 'City', 'Città'],
  ['components.jobForm.region', 'Region', 'Regione'],
  ['components.jobForm.location', 'Specific location', 'Luogo specifico'],
  ['components.jobForm.locationPlaceholder', 'E.g.: Photo studio on via Montenapoleone', 'Es: Studio fotografico via Montenapoleone'],
  ['components.jobForm.jobDates', 'Job dates', 'Date del lavoro'],
  ['components.jobForm.jobDatesPlaceholder', 'E.g.: April 15-17, 2026', 'Es: 15-17 Aprile 2026'],
  ['components.jobForm.deadline', 'Application deadline', 'Scadenza candidature'],
  ['components.jobForm.spots', 'Available spots', 'Posti disponibili'],
  ['components.jobForm.requirementsCardTitle', 'Requirements & compensation', 'Requisiti e compenso'],
  ['components.jobForm.requirements', 'Model requirements', 'Requisiti modello'],
  ['components.jobForm.requirementsPlaceholder', 'E.g.: Min height 175cm, sizes 38-42...', 'Es: Altezza minima 175cm, taglie 38-42...'],
  ['components.jobForm.compensation', 'Compensation', 'Compenso'],
  ['components.jobForm.compensationPlaceholder', 'E.g.: €500/day', 'Es: €500/giorno'],
  ['components.jobForm.paidJob', 'This is a paid job', 'Questo è un lavoro retribuito'],
  ['components.jobForm.notes', 'Additional notes (private)', 'Note aggiuntive (solo per te)'],
  ['components.jobForm.cancel', 'Cancel', 'Annulla'],
  ['components.jobForm.saveChanges', 'Save changes', 'Salva modifiche'],
  ['components.jobForm.create', 'Create job', 'Crea lavoro'],

  // studio-booking-form.tsx
  ['components.studioBooking.errorSelectDates', 'Select dates from the calendar', 'Seleziona le date dal calendario'],
  ['components.studioBooking.errorSelectTime', 'Select a time slot', "Seleziona l'orario"],
  ['components.studioBooking.errorNameEmail', 'Fill in name and email', 'Compila nome e email'],
  ['components.studioBooking.errorSending', 'Error sending', "Errore nell'invio"],
  ['components.studioBooking.successTitle', 'Booking sent!', 'Prenotazione inviata!'],
  ['components.studioBooking.successMessage', 'The studio owner will confirm your booking shortly.', 'Il proprietario dello studio confermerà la tua prenotazione al più presto.'],
  ['components.studioBooking.selectDates', 'Select dates', 'Seleziona le date'],
  ['components.studioBooking.calendarInstruction', 'Click start date, then end date.', 'Clicca la data di inizio, poi la data di fine.'],
  ['components.studioBooking.day', 'day', 'giorno'],
  ['components.studioBooking.days', 'days', 'giorni'],
  ['components.studioBooking.estimatedTotal', 'Estimated total', 'Totale stimato'],
  ['components.studioBooking.priceHelp', 'Price to be agreed with the owner', 'Prezzo da concordare con il proprietario'],
  ['components.studioBooking.yourDetails', 'Your details', 'I tuoi dati'],
  ['components.studioBooking.fullName', 'Full name', 'Nome completo'],
  ['components.studioBooking.phone', 'Phone', 'Telefono'],
  ['components.studioBooking.additionalNotes', 'Additional notes', 'Note aggiuntive'],
  ['components.studioBooking.notesPlaceholder', 'Briefly describe your project...', 'Descrivi brevemente il tuo progetto...'],
  ['components.studioBooking.submit', 'Book now', 'Prenota'],

  // studio-inquiry-form.tsx
  ['components.studioInquiry.errorRequired', 'Fill in required fields', 'Compila i campi obbligatori'],
  ['components.studioInquiry.errorSending', 'Error sending', "Errore nell'invio"],
  ['components.studioInquiry.successTitle', 'Inquiry sent!', 'Richiesta inviata!'],
  ['components.studioInquiry.successMessage', 'The studio owner will contact you shortly.', 'Il proprietario dello studio ti contatterà al più presto.'],
  ['components.studioInquiry.cardTitle', 'Request info', 'Richiedi informazioni'],
  ['components.studioInquiry.name', 'Name', 'Nome'],
  ['components.studioInquiry.phone', 'Phone', 'Telefono'],
  ['components.studioInquiry.dates', 'Preferred dates', 'Date preferite'],
  ['components.studioInquiry.duration', 'Duration (hrs)', 'Durata (ore)'],
  ['components.studioInquiry.message', 'Message', 'Messaggio'],
  ['components.studioInquiry.messagePlaceholder', 'Describe your project and needs...', 'Descrivi il tuo progetto e le tue esigenze...'],
  ['components.studioInquiry.submit', 'Send inquiry', 'Invia richiesta'],

  // contact-request-form.tsx
  ['components.contactForm.dialogTitle', 'Contact', 'Contatta'],
  ['components.contactForm.dialogDesc', 'Send a professional contact request. The model can accept or decline.', 'Invia una richiesta di contatto professionale. Il/la modello/a potrà accettare o rifiutare.'],
  ['components.contactForm.successTitle', 'Request sent!', 'Richiesta inviata!'],
  ['components.contactForm.successMessage', "You'll be notified when the model responds.", 'Riceverai una notifica quando il/la modello/a risponderà.'],
  ['components.contactForm.reason', 'Reason', 'Motivo'],
  ['components.contactForm.reasonPlaceholder', 'Select reason...', 'Seleziona motivo...'],
  ['components.contactForm.subject', 'Subject', 'Oggetto'],
  ['components.contactForm.subjectPlaceholder', 'E.g.: Casting for SS25 campaign', 'Es: Casting per campagna SS25'],
  ['components.contactForm.message', 'Message', 'Messaggio'],
  ['components.contactForm.messagePlaceholder', 'Introduce yourself and explain the reason for contact...', 'Presentati e spiega il motivo del contatto...'],
  ['components.contactForm.messageHelp', 'Min 20 characters, max 1000', 'Min 20 caratteri, max 1000'],
  ['components.contactForm.cancel', 'Cancel', 'Annulla'],
  ['components.contactForm.submit', 'Send request', 'Invia richiesta'],

  // model-profile-form.tsx
  ['components.profileForm.firstName', 'First name', 'Nome'],
  ['components.profileForm.lastName', 'Last name', 'Cognome'],
  ['components.profileForm.cityNoRegion', 'Select a region first', 'Seleziona prima la regione'],
  ['components.profileForm.bioPlaceholder', 'Tell us about yourself...', 'Racconta qualcosa di te...'],
  ['components.profileForm.select', 'Select...', 'Seleziona...'],
  ['components.profileForm.igPlaceholder', 'username', 'nomeutente'],
  ['components.profileForm.tiktokPlaceholder', 'username', 'nomeutente'],
  ['components.profileForm.categoriesPlaceholder', 'Select categories...', 'Seleziona categorie...'],
  ['components.profileForm.categoriesHelp', 'Select one or more categories', 'Seleziona una o più categorie'],
  ['components.profileForm.saving', 'Saving...', 'Salvataggio in corso...'],
  ['components.profileForm.saved', 'Changes saved', 'Modifiche salvate'],
  ['components.profileForm.error', 'Error saving changes', 'Errore durante il salvataggio'],
];

function setNested(obj, path, val) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
}

for (const [key, enVal, itVal] of pairs) {
  setNested(en, key, enVal);
  setNested(it, key, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log(`Done adding ${pairs.length} key pairs`);
