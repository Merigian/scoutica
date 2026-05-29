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
  // Studio pages
  'pages.studio.bookings.title': ['Bookings', 'Prenotazioni'],
  'pages.studio.bookings.description': ['Manage the bookings received for your studios', 'Gestisci le prenotazioni ricevute per i tuoi studi'],
  'pages.studio.bookings.noBookings': ['No bookings yet', 'Nessuna prenotazione'],
  'pages.studio.bookings.noBookingsDesc': ['Bookings will appear here when someone books your studios.', 'Le prenotazioni appariranno qui quando qualcuno prenota i tuoi studi.'],
  'pages.studio.bookings.for': ['For', 'Per'],
  'pages.studio.bookings.date': ['Date', 'Data'],
  'pages.studio.bookings.time': ['Time', 'Orario'],
  'pages.studio.bookings.price': ['Price', 'Prezzo'],
  'pages.studio.bookings.contact': ['Contact', 'Contatto'],
  'pages.studio.inquiries.title': ['Received Inquiries', 'Richieste ricevute'],
  'pages.studio.inquiries.description': ['Manage information requests for your studios', 'Gestisci le richieste di informazioni per i tuoi studi'],
  'pages.studio.inquiries.noInquiries': ['No inquiries yet', 'Nessuna richiesta'],
  'pages.studio.inquiries.noInquiriesDesc': ['Inquiries will appear here when someone contacts your studios.', 'Le richieste appariranno qui quando qualcuno contatter\u00e0 i tuoi studi.'],
  'pages.studio.messages.title': ['Messages', 'Messaggi'],
  'pages.studio.messages.description': ['Your conversations with clients and professionals', 'Le tue conversazioni con clienti e professionisti'],
  'pages.studio.messages.noMessagesDescAlt': ['When you receive inquiries for your studios, you can chat here.', 'Quando riceverai richieste per i tuoi studi, potrai chattare qui.'],
  'pages.studio.notifications.noNotifications': ['No notifications', 'Nessuna notifica'],
  'pages.studio.notifications.noNotificationsDesc': ['Your notifications will appear here.', 'Le tue notifiche appariranno qui.'],
  'pages.studio.settings.title': ['Settings', 'Impostazioni'],
  'pages.studio.studios.title': ['My Studios', 'I miei studi'],
  'pages.studio.studios.description': ['Manage your spaces and their listings', 'Gestisci i tuoi spazi e i relativi annunci'],
  'pages.studio.studios.addStudio': ['Add studio', 'Aggiungi studio'],
  'pages.studio.studios.noStudios': ['No studios yet', 'Nessuno studio ancora'],
  'pages.studio.studios.noStudiosDesc': ['Add your first studio to start receiving inquiries.', 'Aggiungi il tuo primo studio per iniziare a ricevere richieste.'],

  // Admin pages
  'pages.admin.dashboard.title': ['Admin Dashboard', 'Pannello Amministratore'],
  'pages.admin.dashboard.description': ['Platform overview', 'Panoramica della piattaforma'],
  'pages.admin.dashboard.totalUsers': ['Total users', 'Utenti totali'],
  'pages.admin.dashboard.models': ['Models', 'Modelli'],
  'pages.admin.dashboard.scoutsAgencies': ['Scouts/Agencies', 'Scout/Agenzie'],
  'pages.admin.dashboard.pendingVerifications': ['Pending verifications', 'Verifiche in attesa'],
  'pages.admin.dashboard.reports': ['Reports', 'Segnalazioni'],
  'pages.admin.dashboard.activeCastings': ['Active castings', 'Casting attivi'],
  'pages.admin.dashboard.activeSubscriptions': ['Active subscriptions', 'Abbonamenti attivi'],

  // Model profile & settings
  'pages.model.profile.title': ['Your Profile', 'Il tuo profilo'],
  'pages.model.profile.description': ['Complete your profile to get discovered by scouts.', 'Completa il tuo profilo per farti scoprire dagli scout.'],
  'pages.model.settings.title': ['Settings', 'Impostazioni'],

  // Marketing studios page
  'pages.marketing.studios.title': ['Studios & Spaces', 'Studi & Spazi'],
  'pages.marketing.studios.description': ['Find the perfect space for your next shoot, event, or creative project.', 'Trova lo spazio perfetto per il tuo prossimo shooting, evento o progetto creativo.'],
  'pages.marketing.studios.spaceFound': ['space found', 'spazio trovato'],
  'pages.marketing.studios.spacesFound': ['spaces found', 'spazi trovati'],
  'pages.marketing.studios.previous': ['Previous', 'Precedente'],
  'pages.marketing.studios.next': ['Next', 'Successivo'],
  'pages.marketing.studios.noStudios': ['No studios found', 'Nessuno studio trovato'],
  'pages.marketing.studios.noStudiosDesc': ['Try adjusting your search filters.', 'Prova a modificare i filtri di ricerca.'],
  'pages.marketing.studios.registerStudio': ['Register your studio', 'Registra il tuo studio'],

  // Error pages
  'errors.notFound.title': ['Page not found', 'Pagina non trovata'],
  'errors.notFound.description': ['The page you are looking for does not exist or has been moved.', 'La pagina che stai cercando non esiste o \u00e8 stata spostata.'],
  'errors.notFound.backHome': ['Back to home', 'Torna alla home'],
  'errors.generic.title': ['Something went wrong', 'Qualcosa \u00e8 andato storto'],
  'errors.generic.description': ['An unexpected error occurred. Try again or go back to the previous page.', 'Si \u00e8 verificato un errore imprevisto. Riprova o torna alla pagina precedente.'],
  'errors.generic.retry': ['Retry', 'Riprova'],
  'errors.generic.backHome': ['Back to home', 'Torna alla home'],
};

for (const [path, [enVal, itVal]] of Object.entries(keys)) {
  set(en, path, enVal);
  set(it, path, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done adding', Object.keys(keys).length, 'key pairs');
