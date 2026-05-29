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
  // Auth register pages
  ['auth.registrationError', 'Error during registration', 'Errore durante la registrazione'],
  ['auth.scoutLabel', 'Scout', 'Scout'],
  ['auth.agencyLabel', 'Agency', 'Agenzia'],
  ['auth.brandLabel', 'Brand', 'Brand'],

  // Forgot password page
  ['auth.forgotPassword.emailSent', 'Email sent', 'Email inviata'],
  ['auth.forgotPassword.emailSentDesc', 'If an account with the email {email} exists, you will receive instructions to reset your password.', "Se un account con l'email {email} esiste, riceverai le istruzioni per reimpostare la password."],
  ['auth.forgotPassword.backToLogin', 'Back to login', 'Torna al login'],
  ['auth.forgotPassword.description', 'Enter your email and we will send you instructions to reset your password.', 'Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.'],
  ['auth.forgotPassword.emailPlaceholder', 'name@example.com', 'nome@esempio.com'],
  ['auth.forgotPassword.genericError', 'An error occurred. Please try again.', "Si è verificato un errore. Riprova."],
  ['auth.forgotPassword.submitting', 'Sending...', 'Invio in corso...'],
  ['auth.forgotPassword.submit', 'Send reset link', 'Invia link di reset'],

  // Studio new page
  ['pages.studio.createStudio.nameRequired', 'Studio name is required', 'Il nome dello studio è obbligatorio'],
  ['pages.studio.createStudio.title', 'New Studio', 'Nuovo Studio'],
  ['pages.studio.createStudio.subtitle', 'Enter the details of your space', 'Inserisci i dettagli del tuo spazio'],
  ['pages.studio.createStudio.basicInfo', 'Basic info', 'Informazioni base'],
  ['pages.studio.createStudio.namePlaceholder', 'Photography Studio Milan', 'Studio Fotografico Milano'],
  ['pages.studio.createStudio.spaceType', 'Space type', 'Tipo di spazio'],
  ['pages.studio.createStudio.descPlaceholder', 'Describe your space, the atmosphere, what it is ideal for...', "Descrivi il tuo spazio, l'atmosfera, per cosa è ideale..."],
  ['pages.studio.createStudio.location', 'Location', 'Posizione'],
  ['pages.studio.createStudio.addressPlaceholder', 'Via Roma 1', 'Via Roma 1'],
  ['pages.studio.createStudio.city', 'City', 'Città'],
  ['pages.studio.createStudio.cityPlaceholder', 'Milan', 'Milano'],
  ['pages.studio.createStudio.region', 'Region', 'Regione'],
  ['pages.studio.createStudio.regionPlaceholder', 'Lombardy', 'Lombardia'],
  ['pages.studio.createStudio.zip', 'ZIP', 'CAP'],
  ['pages.studio.createStudio.zipPlaceholder', '20100', '20100'],
  ['pages.studio.createStudio.spaceDetails', 'Space details', 'Dettagli spazio'],
  ['pages.studio.createStudio.area', 'Area (m²)', 'Superficie (m²)'],
  ['pages.studio.createStudio.maxCapacity', 'Max capacity (people)', 'Capienza max (persone)'],
  ['pages.studio.createStudio.amenities', 'Included amenities', 'Servizi inclusi'],
  ['pages.studio.createStudio.rates', 'Rates', 'Tariffe'],
  ['pages.studio.createStudio.hourlyRate', 'Hourly rate (€)', 'Tariffa oraria (€)'],
  ['pages.studio.createStudio.dailyRate', 'Daily rate (€)', 'Tariffa giornaliera (€)'],
  ['pages.studio.createStudio.weeklyRate', 'Weekly rate (€)', 'Tariffa settimanale (€)'],
  ['pages.studio.createStudio.minHours', 'Minimum booking hours', 'Minimo ore prenotazione'],
  ['pages.studio.createStudio.availabilityNotes', 'Availability notes', 'Note sulla disponibilità'],
  ['pages.studio.createStudio.availabilityPlaceholder', 'Mon-Fri 9:00-19:00, weekends on request...', 'Lun-Ven 9:00-19:00, weekend su richiesta...'],
  ['pages.studio.createStudio.contacts', 'Contacts (shown in listing)', 'Contatti (visibili nell\'annuncio)'],
  ['pages.studio.createStudio.email', 'Email', 'Email'],
  ['pages.studio.createStudio.emailPlaceholder', 'studio@example.com', 'studio@esempio.it'],
  ['pages.studio.createStudio.phone', 'Phone', 'Telefono'],
  ['pages.studio.createStudio.phonePlaceholder', '+39 02 1234567', '+39 02 1234567'],
  ['pages.studio.createStudio.createError', 'Error creating studio', 'Errore durante la creazione'],
  ['pages.studio.createStudio.submit', 'Create studio', 'Crea studio'],

  // Booking actions
  ['components.bookingActions.confirmBooking', 'Confirm booking', 'Conferma prenotazione'],
  ['components.bookingActions.markCompleted', 'Mark as completed', 'Segna come completata'],
  ['components.bookingActions.cancelBooking', 'Cancel booking', 'Cancella prenotazione'],

  // Verification form
  ['components.verificationForm.verified', 'Your account has been verified!', 'Il tuo account è stato verificato!'],
  ['components.verificationForm.verifiedDesc', 'You can access all platform features.', 'Puoi accedere a tutte le funzionalità della piattaforma.'],
  ['components.verificationForm.pendingTitle', 'Verification in progress', 'Verifica in corso'],
  ['components.verificationForm.pendingDesc', 'Our team is reviewing your request. You will receive a notification when verification is complete.', 'Il nostro team sta esaminando la tua richiesta. Riceverai una notifica quando la verifica sarà completata.'],
  ['components.verificationForm.rejectedTitle', 'Verification rejected', 'Verifica rifiutata'],
  ['components.verificationForm.rejectedDesc', 'You can update the information and resubmit.', 'Puoi aggiornare le informazioni e inviare nuovamente.'],
  ['components.verificationForm.submittedTitle', 'Request sent!', 'Richiesta inviata!'],
  ['components.verificationForm.submittedDesc', 'You will receive a response within 24-48 hours.', 'Riceverai una risposta entro 24-48 ore.'],
  ['components.verificationForm.dataSection', 'Verification data', 'Dati di verifica'],
  ['components.verificationForm.businessName', 'Business name', 'Nome attività'],
  ['components.verificationForm.rolePlaceholder', 'E.g.: Talent Scout, Casting Director...', 'Es: Talent Scout, Direttore Casting...'],
  ['components.verificationForm.city', 'City', 'Città'],
  ['components.verificationForm.professionalEmail', 'Professional email', 'Email professionale'],
  ['components.verificationForm.website', 'Website', 'Sito web'],
  ['components.verificationForm.linkedin', 'LinkedIn', 'LinkedIn'],
  ['components.verificationForm.vatNumber', 'VAT number (optional)', 'Partita IVA (opzionale)'],
  ['components.verificationForm.vatPlaceholder', 'IT12345678901', 'IT12345678901'],
  ['components.verificationForm.italyOnly', 'Italy', 'Italia'],
  ['components.verificationForm.italyOnlyDesc', 'Verification is available only for professionals based in Italy.', 'La verifica è disponibile solo per professionisti con sede in Italia.'],
  ['components.verificationForm.resubmit', 'Resubmit', 'Invia nuovamente'],
  ['components.verificationForm.submit', 'Submit verification request', 'Invia richiesta di verifica'],

  // Profile photos
  ['components.profilePhotos.formatError', 'Format not supported. Use JPG, PNG or WebP.', 'Formato non supportato. Usa JPG, PNG o WebP.'],
  ['components.profilePhotos.sizeError', 'File is too large. Maximum 10MB.', 'Il file è troppo grande. Massimo 10MB.'],
  ['components.profilePhotos.uploadError', 'Error uploading', 'Errore durante il caricamento'],
  ['components.profilePhotos.error', 'Error', 'Errore'],
  ['components.profilePhotos.deleteConfirm', 'Delete this photo?', 'Eliminare questa foto?'],
  ['components.profilePhotos.title', 'Profile photos', 'Foto profilo'],
  ['components.profilePhotos.description', 'Upload up to {maxPhotos} photos. The cover photo will be shown as preview to scouts.', 'Carica fino a {maxPhotos} foto. La foto copertina sarà mostrata in anteprima agli scout.'],
  ['components.profilePhotos.photoAlt', 'Profile photo', 'Foto profilo'],
  ['components.profilePhotos.cover', 'Cover', 'Copertina'],
  ['components.profilePhotos.setCover', 'Cover', 'Copertina'],
  ['components.profilePhotos.delete', 'Delete', 'Elimina'],
  ['components.profilePhotos.addPhoto', 'Add photo', 'Aggiungi foto'],

  // Portfolio grid
  ['components.portfolio.deleteConfirm', 'Are you sure you want to delete this image?', 'Sei sicuro di voler eliminare questa immagine?'],
  ['components.portfolio.noImages', 'No images', 'Nessuna immagine'],
  ['components.portfolio.noImagesDesc', 'Upload your first photos to start building your portfolio.', 'Carica le tue prime foto per iniziare a costruire il tuo portfolio.'],
  ['components.portfolio.upload', 'Upload image', 'Carica immagine'],
  ['components.portfolio.portfolioAlt', 'Portfolio', 'Portfolio'],
  ['components.portfolio.cover', 'Cover', 'Copertina'],

  // Common
  ['common.unknownError', 'Unknown error', 'Errore sconosciuto'],
  ['common.error', 'Error', 'Errore'],
];

for (const [key, enVal, itVal] of pairs) {
  setNested(en, key, enVal);
  setNested(it, key, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log(`Done adding ${pairs.length} key pairs`);
