const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

const pairs = [
  // admin/castings extras
  ['pages.admin.castings.totalCastings', 'total castings', 'casting totali'],
  ['pages.admin.castings.from', 'By:', 'Da:'],
  ['pages.admin.castings.noCastingsDesc', 'No castings have been created yet.', 'Non ci sono ancora casting creati.'],

  // admin/reports extras
  ['pages.admin.reports.reportsToReview', 'reports to review', 'segnalazioni da esaminare'],
  ['pages.admin.reports.from', 'From:', 'Da:'],
  ['pages.admin.reports.noReportsDesc', 'There are no pending reports.', 'Non ci sono segnalazioni in attesa.'],

  // admin/settings extras
  ['pages.admin.settings.generalSettings', 'General settings', 'Impostazioni generali'],
  ['pages.admin.settings.comingSoon', 'Platform settings will be available soon.', 'Le impostazioni della piattaforma saranno disponibili a breve.'],

  // admin/subscriptions extras
  ['pages.admin.subscriptions.activeSubscriptions', 'active subscriptions', 'abbonamenti attivi'],
  ['pages.admin.subscriptions.noSubscriptionsDesc', 'No paid subscriptions yet.', 'Non ci sono abbonamenti a pagamento.'],

  // admin/users extras
  ['pages.admin.users.usersLatest', 'users (latest 100)', 'utenti (ultimi 100)'],
  ['pages.admin.users.suspended', 'Suspended', 'Sospeso'],

  // admin/verifications extras
  ['pages.admin.verifications.requestsToReview', 'requests to review', 'richieste da esaminare'],
  ['pages.admin.verifications.business', 'Business:', 'Attività:'],
  ['pages.admin.verifications.city', 'City:', 'Città:'],
  ['pages.admin.verifications.registered', 'Registered', 'Registrato'],
  ['pages.admin.verifications.noVerificationsDesc', 'There are no verification requests to review.', 'Non ci sono richieste di verifica da esaminare.'],

  // marketing/studios/[slug]
  ['pages.marketing.studioDetail.backToStudios', 'Back to studios', 'Torna agli studi'],
  ['pages.marketing.studioDetail.noPhotos', 'No photos available', 'Nessuna foto disponibile'],
  ['pages.marketing.studioDetail.managedBy', 'Managed by', 'Gestito da'],
  ['pages.marketing.studioDetail.amenities', 'Amenities', 'Servizi inclusi'],
  ['pages.marketing.studioDetail.directContact', 'Direct Contact', 'Contatti diretti'],
  ['pages.marketing.studioDetail.rates', 'Rates', 'Tariffe'],
  ['pages.marketing.studioDetail.hourlyRate', 'Hourly rate', 'Tariffa oraria'],
  ['pages.marketing.studioDetail.dailyRate', 'Daily rate', 'Tariffa giornaliera'],
  ['pages.marketing.studioDetail.weeklyRate', 'Weekly rate', 'Tariffa settimanale'],
  ['pages.marketing.studioDetail.contactForPricing', 'Contact for pricing', 'Contatta per un preventivo'],

  // profile/[slug] extras
  ['pages.publicProfile.unnamed', 'Unnamed', 'Senza nome'],
  ['pages.publicProfile.views', 'views', 'visualizzazioni'],
  ['pages.publicProfile.likes', 'likes', 'mi piace'],
  ['pages.publicProfile.applied', 'Applied', 'Candidato'],
  ['pages.publicProfile.paid', 'Paid', 'Retribuito'],
  ['pages.publicProfile.availableToTravel', 'Available to travel', 'Disponibile a viaggiare'],
  ['pages.publicProfile.measurements', 'Measurements', 'Misure'],
  ['pages.publicProfile.appearance', 'Appearance', 'Aspetto'],
  ['pages.publicProfile.eyes', 'Eyes', 'Occhi'],
  ['pages.publicProfile.hair', 'Hair', 'Capelli'],
  ['pages.publicProfile.ethnicity', 'Ethnicity', 'Etnia'],
  ['pages.publicProfile.dressSize', 'Dress size', 'Taglia'],
  ['pages.publicProfile.website', 'Website', 'Sito web'],
  ['pages.publicProfile.memberSince', 'Member since', 'Membro dal'],
  ['pages.publicProfile.backToSearch', 'Back to search', 'Torna alla ricerca'],
  ['pages.publicProfile.back', 'Back', 'Indietro'],

  // model castings/lavori remaining
  ['pages.model.castings.applied', 'Applied', 'Candidato'],
  ['pages.model.castings.paid', 'Paid', 'Retribuito'],
  ['pages.model.castings.deadline', 'Deadline:', 'Scadenza:'],
  ['pages.model.castings.noCastings', 'No castings available', 'Nessun casting disponibile'],
  ['pages.model.castings.noCastingsDesc', 'There are no open castings right now. Check back later!', 'Al momento non ci sono casting aperti. Torna più tardi!'],
  ['pages.model.lavori.applied', 'Applied', 'Candidato'],
  ['pages.model.lavori.paid', 'Paid', 'Retribuito'],
  ['pages.model.lavori.deadline', 'Deadline:', 'Scadenza:'],
  ['pages.model.lavori.noJobs', 'No jobs available', 'Nessun lavoro disponibile'],
  ['pages.model.lavori.noJobsDesc', 'No jobs are currently published. Check back later!', 'Al momento non ci sono lavori pubblicati. Torna più tardi!'],

  // studio/studios/[id]
  ['pages.studio.studioDetail.backToStudios', 'Back to my studios', 'Torna ai miei studi'],
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
