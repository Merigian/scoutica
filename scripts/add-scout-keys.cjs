const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

function set(obj, path, val) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

const keys = {
  'pages.scout.boards.title': ['Shortlist Boards', 'Bacheche Shortlist'],
  'pages.scout.boards.description': ['Organize talent in custom boards', 'Organizza i talenti in bacheche personalizzate'],
  'pages.scout.boards.profiles': ['profiles', 'profili'],
  'pages.scout.boards.noBoards': ['No boards yet', 'Nessuna bacheca'],
  'pages.scout.boards.noBoardsDesc': ['Create a board to start organizing talent.', 'Crea una bacheca per iniziare a organizzare i talenti.'],
  'pages.scout.boardDetail.backToBoards': ['Back to boards', 'Torna alle bacheche'],
  'pages.scout.boardDetail.profiles': ['profiles', 'profili'],
  'pages.scout.boardDetail.emptyBoard': ['Empty board', 'Bacheca vuota'],
  'pages.scout.boardDetail.emptyBoardDesc': ['Add profiles from the Discover Talent page.', 'Aggiungi profili dalla pagina Scopri Talenti.'],
  'pages.scout.boardDetail.discoverTalent': ['Discover Talent', 'Scopri Talenti'],
  'pages.scout.castings.title': ['My Castings', 'I Miei Casting'],
  'pages.scout.castings.description': ['Manage your castings and applications', 'Gestisci i tuoi casting e le candidature'],
  'pages.scout.castings.newCasting': ['New casting', 'Nuovo casting'],
  'pages.scout.castings.applications': ['applications', 'candidature'],
  'pages.scout.castings.noCastings': ['No castings yet', 'Nessun casting'],
  'pages.scout.castings.noCastingsDesc': ['Create your first casting to start receiving applications.', 'Crea il tuo primo casting per iniziare a ricevere candidature.'],
  'pages.scout.castings.createCasting': ['Create casting', 'Crea casting'],
  'pages.scout.castingsNew.title': ['New Casting', 'Nuovo Casting'],
  'pages.scout.castingsNew.description': ['Create a new casting to find the perfect talent', 'Crea un nuovo casting per trovare i talenti perfetti'],
  'pages.scout.castingApplications.backToCastings': ['Back to castings', 'Torna ai casting'],
  'pages.scout.castingApplications.applicationsReceived': ['applications received', 'candidature ricevute'],
  'pages.scout.castingApplications.noApplications': ['No applications yet', 'Nessuna candidatura'],
  'pages.scout.castingApplications.noApplicationsDesc': ["When models apply, you'll see them here.", 'Quando i modelli si candidano, le vedrai qui.'],
  'pages.scout.contacts.title': ['Sent Requests', 'Richieste Inviate'],
  'pages.scout.contacts.description': ['Monitor the status of your contact requests', 'Monitora lo stato delle tue richieste di contatto'],
  'pages.scout.contacts.noRequests': ['No requests sent', 'Nessuna richiesta inviata'],
  'pages.scout.contacts.noRequestsDesc': ['Go to Discover Talent to search and contact models.', 'Vai su Scopri Talenti per cercare e contattare modelle e modelli.'],
  'pages.scout.contacts.discoverTalent': ['Discover Talent', 'Scopri Talenti'],
  'pages.scout.discover.title': ['Discover Talent', 'Scopri Talenti'],
  'pages.scout.discover.description': ['Explore our database of models across Italy', 'Esplora il nostro database di modelle e modelli in Italia'],
  'pages.scout.discover.result': ['result', 'risultato'],
  'pages.scout.discover.results': ['results', 'risultati'],
  'pages.scout.discover.noResults': ['No results', 'Nessun risultato'],
  'pages.scout.discover.noResultsDesc': ['Try adjusting your search filters to find more profiles.', 'Prova a modificare i filtri di ricerca per trovare pi\u00f9 profili.'],
  'pages.scout.lavori.title': ['My Jobs', 'I Miei Lavori'],
  'pages.scout.lavori.description': ['Manage your jobs and applications', 'Gestisci i tuoi lavori e le candidature'],
  'pages.scout.lavori.newJob': ['New job', 'Nuovo lavoro'],
  'pages.scout.lavori.deadline': ['Deadline:', 'Scadenza:'],
  'pages.scout.lavori.applications': ['applications', 'candidature'],
  'pages.scout.lavori.noJobs': ['No jobs yet', 'Nessun lavoro'],
  'pages.scout.lavori.noJobsDesc': ['Create your first job to start receiving applications.', 'Crea il tuo primo lavoro per iniziare a ricevere candidature.'],
  'pages.scout.lavori.createJob': ['Create job', 'Crea lavoro'],
  'pages.scout.lavoriNew.title': ['New Job', 'Nuovo Lavoro'],
  'pages.scout.lavoriNew.description': ['Create a new job listing to find the perfect talent', 'Crea un nuovo lavoro per trovare i talenti perfetti'],
  'pages.scout.jobApplications.backToJobs': ['Back to jobs', 'Torna ai lavori'],
  'pages.scout.jobApplications.applicationsReceived': ['applications received', 'candidature ricevute'],
  'pages.scout.jobApplications.noApplications': ['No applications yet', 'Nessuna candidatura'],
  'pages.scout.jobApplications.noApplicationsDesc': ["When models apply, you'll see them here.", 'Quando i modelli si candidano, le vedrai qui.'],
  'pages.scout.messages.title': ['Messages', 'Messaggi'],
  'pages.scout.messages.description': ['Your conversations with models', 'Le tue conversazioni con modelle e modelli'],
  'pages.scout.messages.backToMessages': ['Back to messages', 'Torna ai messaggi'],
  'pages.scout.messages.noMessagesDescAlt': ["When a model accepts your request, you can start chatting here.", "Quando un/a modello/a accetta la tua richiesta, potrai chattare qui."],
  'pages.scout.notifications.noNotifications': ['No notifications', 'Nessuna notifica'],
  'pages.scout.notifications.noNotificationsDesc': ['Your notifications will appear here.', 'Le tue notifiche appariranno qui.'],
  'pages.scout.profile.title': ['Profile', 'Profilo'],
  'pages.scout.profile.description': ['Manage your profile information.', 'Gestisci le informazioni del tuo profilo.'],
  'pages.scout.profile.verificationStatus': ['Verification status', 'Stato verifica'],
  'pages.scout.profile.type': ['Type', 'Tipo'],
  'pages.scout.profile.currentPlan': ['Current plan', 'Piano attuale'],
  'pages.scout.profile.pendingVerification': ['Your verification request is under review.', 'La tua richiesta di verifica \u00e8 in fase di revisione.'],
  'pages.scout.profile.pendingVerificationDesc': ['Our team usually responds within 24-48 hours. In the meantime, you can complete your profile settings.', 'Il nostro team risponde di solito entro 24-48 ore. Nel frattempo, puoi completare le impostazioni del tuo profilo.'],
  'pages.scout.profile.rejectedVerification': ['Your verification request has been rejected.', 'La tua richiesta di verifica \u00e8 stata rifiutata.'],
  'pages.scout.profile.resubmit': ['Resubmit', 'Invia nuovamente'],
  'pages.scout.settings.title': ['Settings', 'Impostazioni'],
  'pages.scout.billing.subscriptionActivatedSuccess': ['Subscription activated successfully!', 'Abbonamento attivato con successo!'],
  'pages.scout.billing.freePlanDesc': ["You're on the free plan. Upgrade to Starter or Pro to unlock all features.", "Stai usando il piano gratuito. Passa a Starter o Pro per sbloccare tutte le funzionalit\u00e0."],
  'pages.scout.billing.month': ['month', 'mese'],
  'pages.scout.billing.expiresOn': ['Expires on {date}', 'Scade il {date}'],
  'pages.scout.billing.nextRenewal': ['Next renewal: {date}', 'Prossimo rinnovo: {date}'],
  'pages.scout.verification.title': ['Account Verification', 'Verifica account'],
  'pages.scout.verification.description': ['Complete the verification to access the platform and start discovering new talent.', "Completa la verifica per accedere alla piattaforma e iniziare a scoprire nuovi talenti."],
};

for (const [path, [enVal, itVal]] of Object.entries(keys)) {
  set(en, path, enVal);
  set(it, path, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done adding', Object.keys(keys).length, 'key pairs');
