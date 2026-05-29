const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

const pairs = [
  // marketing/studios CTA
  ['pages.marketing.studios.ctaTitle', 'Have a studio to rent?', 'Hai uno studio da affittare?'],
  ['pages.marketing.studios.ctaDesc', 'List your space for free and start receiving inquiries from fashion professionals.', 'Pubblica il tuo spazio gratis e inizia a ricevere richieste da professionisti della moda.'],

  // admin/castings
  ['pages.admin.castings.title', 'Castings Management', 'Gestione Casting'],
  ['pages.admin.castings.description', 'Manage all castings on the platform', 'Gestisci tutti i casting sulla piattaforma'],
  ['pages.admin.castings.noCastings', 'No castings found', 'Nessun casting trovato'],
  ['pages.admin.castings.applications', 'applications', 'candidature'],
  ['pages.admin.castings.by', 'By', 'Di'],

  // admin/reports
  ['pages.admin.reports.title', 'Reports Management', 'Gestione Segnalazioni'],
  ['pages.admin.reports.description', 'Review and manage user reports', 'Rivedi e gestisci le segnalazioni degli utenti'],
  ['pages.admin.reports.noReports', 'No reports found', 'Nessuna segnalazione trovata'],
  ['pages.admin.reports.reported', 'Reported', 'Segnalato'],
  ['pages.admin.reports.by', 'by', 'da'],

  // admin/settings
  ['pages.admin.settings.title', 'Platform Settings', 'Impostazioni Piattaforma'],
  ['pages.admin.settings.description', 'Configure platform settings', 'Configura le impostazioni della piattaforma'],
  ['pages.admin.settings.maintenanceMode', 'Maintenance Mode', 'Modalità Manutenzione'],
  ['pages.admin.settings.maintenanceDesc', 'Enable maintenance mode to temporarily disable the platform', 'Abilita la modalità manutenzione per disabilitare temporaneamente la piattaforma'],

  // admin/subscriptions
  ['pages.admin.subscriptions.title', 'Subscriptions', 'Abbonamenti'],
  ['pages.admin.subscriptions.description', 'Manage platform subscriptions', 'Gestisci gli abbonamenti della piattaforma'],
  ['pages.admin.subscriptions.noSubscriptions', 'No subscriptions found', 'Nessun abbonamento trovato'],
  ['pages.admin.subscriptions.expires', 'Expires', 'Scade'],

  // admin/users
  ['pages.admin.users.title', 'Users Management', 'Gestione Utenti'],
  ['pages.admin.users.description', 'Manage all platform users', 'Gestisci tutti gli utenti della piattaforma'],
  ['pages.admin.users.noUsers', 'No users found', 'Nessun utente trovato'],

  // admin/verifications
  ['pages.admin.verifications.title', 'Verifications', 'Verifiche'],
  ['pages.admin.verifications.description', 'Review and manage verification requests', 'Rivedi e gestisci le richieste di verifica'],
  ['pages.admin.verifications.noVerifications', 'No pending verifications', 'Nessuna verifica in attesa'],
  ['pages.admin.verifications.submittedOn', 'Submitted on', 'Inviato il'],
  ['pages.admin.verifications.viewDocuments', 'View Documents', 'Visualizza Documenti'],
  ['pages.admin.verifications.pending', 'Pending', 'In attesa'],
  ['pages.admin.verifications.approved', 'Approved', 'Approvato'],
  ['pages.admin.verifications.rejected', 'Rejected', 'Rifiutato'],

  // marketing/studios/[slug]
  ['pages.marketing.studioDetail.from', 'From', 'Da'],
  ['pages.marketing.studioDetail.perHour', '/hour', '/ora'],
  ['pages.marketing.studioDetail.perDay', '/day', '/giorno'],
  ['pages.marketing.studioDetail.description', 'Description', 'Descrizione'],
  ['pages.marketing.studioDetail.features', 'Features', 'Caratteristiche'],
  ['pages.marketing.studioDetail.location', 'Location', 'Posizione'],
  ['pages.marketing.studioDetail.bookThisStudio', 'Book this studio', 'Prenota questo studio'],
  ['pages.marketing.studioDetail.inquireAbout', 'Inquire about this studio', 'Richiedi informazioni su questo studio'],
  ['pages.marketing.studioDetail.availability', 'Availability', 'Disponibilità'],
  ['pages.marketing.studioDetail.reviews', 'Reviews', 'Recensioni'],
  ['pages.marketing.studioDetail.noReviews', 'No reviews yet', 'Nessuna recensione ancora'],
  ['pages.marketing.studioDetail.capacity', 'Capacity', 'Capienza'],
  ['pages.marketing.studioDetail.people', 'people', 'persone'],

  // profile/[slug] (public profile)
  ['pages.publicProfile.about', 'About', 'Chi sono'],
  ['pages.publicProfile.portfolio', 'Portfolio', 'Portfolio'],
  ['pages.publicProfile.experience', 'Experience', 'Esperienza'],
  ['pages.publicProfile.stats', 'Stats', 'Statistiche'],
  ['pages.publicProfile.height', 'Height', 'Altezza'],
  ['pages.publicProfile.weight', 'Weight', 'Peso'],
  ['pages.publicProfile.bust', 'Bust', 'Busto'],
  ['pages.publicProfile.waist', 'Waist', 'Vita'],
  ['pages.publicProfile.hips', 'Hips', 'Fianchi'],
  ['pages.publicProfile.shoes', 'Shoes', 'Scarpe'],
  ['pages.publicProfile.eyeColor', 'Eye Color', 'Colore Occhi'],
  ['pages.publicProfile.hairColor', 'Hair Color', 'Colore Capelli'],
  ['pages.publicProfile.contact', 'Contact', 'Contatta'],
  ['pages.publicProfile.sendMessage', 'Send Message', 'Invia Messaggio'],
  ['pages.publicProfile.addToBoard', 'Add to Board', 'Aggiungi alla Board'],
  ['pages.publicProfile.like', 'Like', 'Mi piace'],
  ['pages.publicProfile.share', 'Share', 'Condividi'],
  ['pages.publicProfile.verified', 'Verified', 'Verificato'],
  ['pages.publicProfile.available', 'Available', 'Disponibile'],
  ['pages.publicProfile.unavailable', 'Unavailable', 'Non disponibile'],
  ['pages.publicProfile.skills', 'Skills', 'Abilità'],
  ['pages.publicProfile.languages', 'Languages', 'Lingue'],
  ['pages.publicProfile.location', 'Location', 'Posizione'],
  ['pages.publicProfile.age', 'Age', 'Età'],
  ['pages.publicProfile.years', 'years', 'anni'],
  ['pages.publicProfile.cm', 'cm', 'cm'],
  ['pages.publicProfile.kg', 'kg', 'kg'],

  // studio/studios/[id]
  ['pages.studio.studioDetail.editStudio', 'Edit Studio', 'Modifica Studio'],
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
