const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

const pairs = [
  // components: discover
  ['components.discover.unnamed', 'Unnamed', 'Senza nome'],
  ['components.discover.profilesFound', '{count} profile found', '{count} profilo trovato'],
  ['components.discover.profilesFoundPlural', '{count} profiles found', '{count} profili trovati'],

  // components: pagination
  ['components.pagination.profileFound', '{count} profile found', '{count} profilo trovato'],
  ['components.pagination.profilesFound', '{count} profiles found', '{count} profili trovati'],

  // components: notifications
  ['components.notifications.markAllRead', 'Mark all as read', 'Segna tutto come letto'],

  // components: profile
  ['components.profile.contact', 'Contact', 'Contatta'],

  // components: application-actions (castings)
  ['components.applicationActions.accept', 'Accept', 'Accetta'],
  ['components.applicationActions.reject', 'Reject', 'Rifiuta'],

  // components: job-application-actions 
  ['components.jobApplicationActions.accept', 'Accept', 'Accetta'],
  ['components.jobApplicationActions.reject', 'Reject', 'Rifiuta'],

  // components: studio-card
  ['components.studioCard.perHour', '/hr', '/ora'],
  ['components.studioCard.perDay', '/day', '/giorno'],

  // components: studios-view
  ['components.studiosView.grid', 'Grid', 'Griglia'],
  ['components.studiosView.map', 'Map', 'Mappa'],

  // components: model-billing-actions
  ['components.modelBilling.upgrade', 'Upgrade to Model Pro — €14.99/mo', 'Passa a Model Pro — €14,99/mese'],
  ['components.modelBilling.manage', 'Manage subscription', 'Gestisci abbonamento'],

  // components: studio-map-view
  ['components.studioMap.perHour', '/hr', '/ora'],
  ['components.studioMap.perDay', '/day', '/giorno'],
  ['components.studioMap.noStudios', 'No studios with location data', 'Nessuno studio con posizione disponibile'],

  // components: conversation-list
  ['components.conversations.noConversations', 'No conversations yet', 'Nessuna conversazione'],
  ['components.conversations.model', 'Model', 'Modello/a'],
  ['components.conversations.scout', 'Scout', 'Scout'],

  // components: message-thread
  ['components.messageThread.model', 'Model', 'Modello/a'],
  ['components.messageThread.scout', 'Scout', 'Scout'],
  ['components.messageThread.placeholder', 'Type a message...', 'Scrivi un messaggio...'],
  ['components.messageThread.hint', 'Press Enter to send, Shift+Enter for new line', 'Premi Invio per inviare, Shift+Invio per nuova riga'],

  // components: billing-actions (scout)
  ['components.billing.upgradeStarter', 'Upgrade to Starter — €39/mo', 'Passa a Starter — 39€/mese'],
  ['components.billing.upgradePro', 'Upgrade to Pro — €99/mo', 'Passa a Pro — 99€/mese'],
  ['components.billing.manage', 'Manage subscription', 'Gestisci abbonamento'],

  // components: contact-request-list
  ['components.contactRequests.collapse', 'Collapse', 'Comprimi'],
  ['components.contactRequests.readMessage', 'Read message', 'Leggi messaggio'],
  ['components.contactRequests.accept', 'Accept', 'Accetta'],
  ['components.contactRequests.decline', 'Decline', 'Rifiuta'],
  ['components.contactRequests.goToChat', 'Go to chat', 'Vai alla chat'],
  ['components.contactRequests.waiting', 'Waiting for response', 'In attesa di risposta'],

  // components: report-actions
  ['components.reportActions.notesPlaceholder', 'Admin notes...', 'Note admin...'],
  ['components.reportActions.resolve', 'Resolve', 'Risolvi'],
  ['components.reportActions.dismiss', 'Dismiss', 'Archivia'],
  ['components.reportActions.cancel', 'Cancel', 'Annulla'],

  // components: report-actions extras
  ['components.reportActions.actions', 'Actions', 'Azioni'],
  ['components.reportActions.warnUser', 'Warn User', 'Avvisa Utente'],
  ['components.reportActions.suspendUser', 'Suspend User', 'Sospendi Utente'],

  // components: verification-actions
  ['components.verificationActions.rejectReason', 'Reason for rejection...', 'Motivo del rifiuto...'],
  ['components.verificationActions.confirmReject', 'Confirm reject', 'Conferma rifiuto'],
  ['components.verificationActions.cancel', 'Cancel', 'Annulla'],
  ['components.verificationActions.approve', 'Approve', 'Approva'],
  ['components.verificationActions.reject', 'Reject', 'Rifiuta'],

  // components: studio-availability
  ['components.studioAvailability.title', 'Manage availability', 'Gestisci disponibilità'],
  ['components.studioAvailability.instructions', 'Click dates to select them, then block the selected dates.', 'Clicca sulle date per selezionarle, poi blocca le date selezionate.'],
  ['components.studioAvailability.blockDate', 'Block {count} date', 'Blocca {count} data'],
  ['components.studioAvailability.blockDates', 'Block {count} dates', 'Blocca {count} date'],
  ['components.studioAvailability.blockedDates', 'Blocked dates', 'Date bloccate'],
  ['components.studioAvailability.unblock', 'Unblock', 'Sblocca'],

  // components: calendar
  ['components.calendar.daysShortEn', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'],
  ['components.calendar.daysShortIt', 'Lun,Mar,Mer,Gio,Ven,Sab,Dom', 'Lun,Mar,Mer,Gio,Ven,Sab,Dom'],
  ['components.calendar.selected', 'Selected', 'Selezionato'],
  ['components.calendar.unavailable', 'Unavailable', 'Non disponibile'],
  ['components.calendar.today', 'Today', 'Oggi'],

  // components: studio-filters
  ['components.studioFilters.searchPlaceholder', 'Search by name, city...', 'Cerca per nome, città...'],
  ['components.studioFilters.allRegions', 'All regions', 'Tutte le regioni'],
  ['components.studioFilters.allTypes', 'All types', 'Tutti i tipi'],
  ['components.studioFilters.search', 'Search', 'Cerca'],
  ['components.studioFilters.clear', 'Clear', 'Pulisci'],

  // components: casting-apply-button
  ['components.castingApply.success', 'Application submitted successfully!', 'Candidatura inviata con successo!'],
  ['components.castingApply.apply', 'Apply', 'Candidati'],
  ['components.castingApply.messageLabel', 'Introduction message (optional)', 'Messaggio di presentazione (opzionale)'],
  ['components.castingApply.messagePlaceholder', 'Briefly introduce yourself to the scout...', 'Presentati brevemente allo scout...'],
  ['components.castingApply.submit', 'Submit application', 'Invia candidatura'],
  ['components.castingApply.cancel', 'Cancel', 'Annulla'],

  // components: job-apply-button
  ['components.jobApply.success', 'Application submitted successfully!', 'Candidatura inviata con successo!'],
  ['components.jobApply.apply', 'Apply', 'Candidati'],
  ['components.jobApply.messageLabel', 'Introduction message (optional)', 'Messaggio di presentazione (opzionale)'],
  ['components.jobApply.messagePlaceholder', 'Briefly introduce yourself to the scout...', 'Presentati brevemente allo scout...'],
  ['components.jobApply.submit', 'Submit application', 'Invia candidatura'],
  ['components.jobApply.cancel', 'Cancel', 'Annulla'],

  // components: settings-form
  ['components.settingsForm.account', 'Account', 'Account'],
  ['components.settingsForm.name', 'Name', 'Nome'],
  ['components.settingsForm.emailReadonly', 'Email cannot be changed.', "L'email non può essere modificata."],
  ['components.settingsForm.language', 'Language', 'Lingua'],
  ['components.settingsForm.save', 'Save', 'Salva'],
  ['components.settingsForm.saved', 'Saved!', 'Salvato!'],

  // components: create-board-dialog
  ['components.createBoard.newBoard', 'New board', 'Nuova bacheca'],
  ['components.createBoard.createBoard', 'Create board', 'Crea bacheca'],
  ['components.createBoard.name', 'Name', 'Nome'],
  ['components.createBoard.namePlaceholder', 'E.g.: Milan FW25 Casting', 'Es: Casting Milano FW25'],
  ['components.createBoard.description', 'Description (optional)', 'Descrizione (opzionale)'],
  ['components.createBoard.descPlaceholder', 'Brief description...', 'Breve descrizione...'],
  ['components.createBoard.cancel', 'Cancel', 'Annulla'],
  ['components.createBoard.create', 'Create', 'Crea'],

  // components: time-slot-picker
  ['components.timeSlotPicker.morning', 'Morning', 'Mattina'],
  ['components.timeSlotPicker.afternoon', 'Afternoon', 'Pomeriggio'],
  ['components.timeSlotPicker.evening', 'Evening', 'Sera'],
  ['components.timeSlotPicker.selectTime', 'Select time', 'Seleziona orario'],
  ['components.timeSlotPicker.selectEnd', 'Now select the end time.', "Ora seleziona l'orario di fine."],
  ['components.timeSlotPicker.instructions', 'Tap start, then end. Occupied slots in red.', 'Tocca per selezionare inizio, poi fine. Slot occupati in rosso.'],
  ['components.timeSlotPicker.selected', 'Selected', 'Selezionato'],
  ['components.timeSlotPicker.range', 'Range', 'Intervallo'],
  ['components.timeSlotPicker.occupied', 'Occupied', 'Occupato'],
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
