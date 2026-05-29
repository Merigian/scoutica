const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

function setNested(obj, path, val) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
}

const pairs = [
  // Auth registration errors
  ['auth.registrationError', 'Error during registration', 'Errore durante la registrazione'],
  // Studio creation errors
  ['pages.studio.createError', 'Error creating studio', 'Errore durante la creazione'],
  // Common errors
  ['common.unknownError', 'Unknown error', 'Errore sconosciuto'],
  ['common.error', 'Error', 'Errore'],
  ['common.uploadError', 'Error uploading', 'Errore durante il caricamento'],
  ['common.deletePhotoConfirm', 'Delete this photo?', 'Eliminare questa foto?'],
  ['common.select', 'Select...', 'Seleziona...'],
  // Booking actions
  ['components.bookingActions.confirmTitle', 'Confirm booking', 'Conferma prenotazione'],
  // Verification form
  ['components.verificationForm.resubmit', 'Resubmit', 'Invia nuovamente'],
  ['components.verificationForm.submit', 'Submit verification request', 'Invia richiesta di verifica'],
  // Portfolio
  ['components.portfolio.noImages', 'No images', 'Nessuna immagine'],
  // Forgot password fallback
  ['auth.sendResetLink', 'Send reset link', 'Invia link di reset'],
];

for (const [key, enVal, itVal] of pairs) {
  setNested(en, key, enVal);
  setNested(it, key, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log(`Done adding ${pairs.length} key pairs`);
