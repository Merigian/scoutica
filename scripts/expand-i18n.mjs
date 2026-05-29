import { readFileSync, writeFileSync } from 'fs';

// Read existing files
const en = JSON.parse(readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(readFileSync('src/messages/it.json', 'utf8'));

// ─── NEW SECTIONS FOR en.json ───────────────────────────────────────

en.errors = {
  notFound: { title: "Page not found", description: "The page you're looking for doesn't exist or has been moved.", backHome: "Back to home" },
  generic: { title: "Something went wrong", description: "An unexpected error occurred. Try again or go back to the previous page.", retry: "Try again", backHome: "Back to home" },
  unknownError: "Unknown error"
};

en.pages = {
  model: {
    portfolio: { title: "Portfolio", description: "Manage your images. Maximum {maxPhotos} photos. JPG, PNG, WebP — max 10MB each.", yourImages: "Your images ({count}/{max})", upgradeTitle: "Upgrade to Model Pro", upgradeDesc: "9 photos, 1 video, PDF book — €14.99/mo", upgrade: "Upgrade" },
    castings: { title: "Open Castings", description: "Explore castings posted by verified scouts and agencies", noResults: "There are no open castings at the moment. Check back later!" },
    jobs: { title: "Available Jobs", description: "Explore job opportunities posted by scouts and agencies", noResults: "There are no published jobs at the moment. Check back later!" },
    applications: { title: "Your Applications", description: "Track your casting and job applications" },
    contacts: { title: "Contact Requests", description: "Manage requests received from scouts, agencies and brands", noRequests: "No requests yet", noRequestsDesc: "When a professional contacts you, you'll see the request here." },
    messages: { title: "Messages", description: "Your conversations with verified professionals" },
    notifications: { noNotifications: "No notifications", noNotificationsDesc: "Your notifications will appear here." },
    discover: { title: "Discover Models", description: "Browse published model profiles on the platform", noProfiles: "No published profiles", noProfilesDesc: "There are no published profiles yet. Be the first to publish yours!" },
    billing: { freePlanDesc: "You're on the free plan. Upgrade to Model Pro to unlock all features.", month: "month" }
  },
  scout: {
    jobs: { title: "My Jobs", description: "Manage your jobs and applications", new: "New job" },
    castings: { title: "My Castings", description: "Manage your castings and applications", new: "New casting", applicationsReceived: "applications received" },
    discover: { noResults: "No results", noResultsDesc: "Try adjusting your search filters to find more profiles." },
    boards: { backToBoards: "Back to boards", profiles: "profiles", addFromDiscover: "Add profiles from the Discover Talent page." },
    contacts: { title: "Sent Requests", description: "Monitor the status of your contact requests" },
    messages: { title: "Messages", description: "Your conversations with models" },
    notifications: { noNotifications: "No notifications", noNotificationsDesc: "Your notifications will appear here." },
    profile: { title: "Profile", description: "Manage your profile information." },
    billing: { freePlanDesc: "You're on the free plan. Upgrade to Starter or Pro to unlock all features.", month: "month" }
  },
  studio: {
    studios: { title: "My Studios", description: "Manage your spaces and their listings", addStudio: "Add studio", noStudios: "No studios yet", noStudiosDesc: "Add your first studio to start receiving inquiries." },
    bookings: { title: "Bookings", description: "Manage the bookings received for your studios" },
    inquiries: { title: "Received Inquiries", description: "Manage information requests for your studios", noInquiries: "No inquiries yet" },
    messages: { title: "Messages", description: "Your conversations with clients and professionals" },
    notifications: { noNotifications: "No notifications", noNotificationsDesc: "Your notifications will appear here." }
  },
  admin: {
    reports: { noReports: "No reports", noReportsDesc: "There are no pending reports." },
    verifications: { noPending: "No pending verifications", noPendingDesc: "There are no verification requests to review." },
    castings: { noCastings: "No castings", noCastingsDesc: "No castings have been created yet." },
    subscriptions: { noSubscriptions: "No subscriptions", noSubscriptionsDesc: "No paid subscriptions yet." }
  },
  marketing: {
    studios: { spacesFound: "{count} space found", spacesFoundPlural: "{count} spaces found", noSpaces: "No spaces available", noSpacesDesc: "There are no published studios at the moment. Check back soon!", ctaTitle: "Have a studio to rent?", ctaDesc: "List your space for free and start receiving inquiries from fashion professionals.", ctaButton: "Register your studio" }
  },
  common: {
    backToJobs: "Back to jobs", backToCastings: "Back to castings", backToMessages: "Back to messages", backToStudios: "Back to studios", backToSearch: "Back to search", back: "Back", publishedBy: "Published by", publishProfileRequired: "You must publish your profile before you can apply."
  }
};

en.forms = {
  job: {
    sectionDetails: "Job details", title: "Title", titlePlaceholder: "E.g.: Shooting for fashion brand", description: "Description", descriptionPlaceholder: "Describe the job in detail...", jobType: "Job type", selectPlaceholder: "Select...", brandClient: "Brand / Client", city: "City", region: "Region", specificLocation: "Specific location", locationPlaceholder: "E.g.: Photo studio on via Montenapoleone", jobDates: "Job dates", jobDatesPlaceholder: "E.g.: April 15-17, 2026", applicationDeadline: "Application deadline", availableSpots: "Available spots", sectionRequirements: "Requirements & compensation", modelRequirements: "Model requirements", modelRequirementsPlaceholder: "E.g.: Min height 175cm, sizes 38-42...", compensation: "Compensation", compensationPlaceholder: "E.g.: €500/day", paidJob: "This is a paid job", additionalNotes: "Additional notes (private)", saveChanges: "Save changes", createJob: "Create job"
  },
  casting: {
    sectionDetails: "Casting details", title: "Title", titlePlaceholder: "E.g.: Casting for SS25 campaign", description: "Description", descriptionPlaceholder: "Describe the casting in detail...", city: "City", region: "Region", selectPlaceholder: "Select...", castingDate: "Casting date", applicationDeadline: "Application deadline", sectionType: "Casting type", mode: "Mode", time: "Time", timePlaceholder: "E.g.: 10:00 AM - 6:00 PM", address: "Address", addressPlaceholder: "E.g.: 8 Via Montenapoleone, Milan", onlineInstructions: "Online casting instructions", onlineInstructionsPlaceholder: "E.g.: Send a 30-second selfie video...", requiredMaterials: "Required materials", materialsPlaceholder: "E.g.: Photo book, comp card, ID...", sectionRequirements: "Requirements & compensation", requirements: "Requirements", requirementsPlaceholder: "E.g.: Min height 175cm, runway experience...", compensation: "Compensation", compensationPlaceholder: "E.g.: €500/day", availableSpots: "Available spots", paidJob: "This is a paid job", additionalNotes: "Additional notes (private)", saveChanges: "Save changes", createCasting: "Create casting"
  },
  contact: {
    contactTitle: "Contact", contactDescription: "Send a professional contact request. The model can accept or decline.", requestSent: "Request sent!", requestSentDesc: "You'll be notified when the model responds.", reason: "Reason", selectReason: "Select reason...", subject: "Subject", subjectPlaceholder: "E.g.: Casting for SS25 campaign", message: "Message", messagePlaceholder: "Introduce yourself and explain the reason for contact...", charLimit: "Min 20 characters, max 1000", sendRequest: "Send request"
  },
  modelProfile: {
    firstName: "First name", lastName: "Last name", selectRegionFirst: "Select a region first", bioPlaceholder: "Tell us about yourself...", selectCategories: "Select categories...", selectOneOrMore: "Select one or more categories", username: "username"
  },
  scoutProfile: {
    businessInfo: "Business information", businessName: "Business name", businessNamePlaceholder: "E.g. Koci Agency", role: "Role", rolePlaceholder: "E.g. Casting Director", city: "City", cityPlaceholder: "E.g. Milan", vatNumber: "VAT number", vatNumberPlaceholder: "E.g. IT12345678901", bio: "Bio", bioPlaceholder: "Describe your business...", contacts: "Contacts", professionalEmail: "Professional email", emailPlaceholder: "E.g. info@agency.it", website: "Website", websitePlaceholder: "https://www.example.it", socialProfile: "Social profile", socialPlaceholder: "https://instagram.com/..."
  }
};

en.studio = {
  booking: {
    selectDatesFromCalendar: "Select dates from the calendar", selectTimeSlot: "Select a time slot", fillNameEmail: "Fill in name and email", bookingSent: "Booking sent!", bookingSentDesc: "The studio owner will confirm your booking shortly.", selectDates: "Select dates", selectDatesInstructions: "Click start date, then end date.", day: "day", days: "days", estimatedTotal: "Estimated total", priceToAgree: "Price to be agreed with the owner", yourDetails: "Your details", fullName: "Full name", phone: "Phone", additionalNotes: "Additional notes", projectPlaceholder: "Briefly describe your project...", bookNow: "Book now"
  },
  inquiry: {
    fillRequired: "Fill in required fields", inquirySent: "Inquiry sent!", inquirySentDesc: "The studio owner will contact you shortly.", requestInfo: "Request info", name: "Name", phone: "Phone", preferredDates: "Preferred dates", duration: "Duration (hrs)", message: "Message", messagePlaceholder: "Describe your project and needs...", sendInquiry: "Send inquiry"
  },
  filters: { searchPlaceholder: "Search by name, city...", allRegions: "All regions", allTypes: "All types", search: "Search", clear: "Clear" },
  perHour: "/hr", perDay: "/day",
  noStudiosWithLocation: "No studios with location data",
  grid: "Grid", map: "Map",
  publish: { deleteConfirm: "Are you sure you want to delete this studio? This action is irreversible.", view: "View", publishBtn: "Publish", pause: "Pause" },
  availability: { title: "Manage availability", instructions: "Click dates to select them, then block the selected dates.", blockDate: "Block {count} date", blockDates: "Block {count} dates", blockedDates: "Blocked dates ({count})" },
  editForm: { saved: "Changes saved successfully", basicInfo: "Basic information", studioName: "Studio name", spaceType: "Space type", description: "Description", location: "Location", address: "Address", city: "City", region: "Region", postalCode: "ZIP code", spaceDetails: "Space details", area: "Area (m²)", maxCapacity: "Max capacity", includedServices: "Included services", rates: "Rates", hourly: "Hourly (€)", daily: "Daily (€)", weekly: "Weekly (€)", minHours: "Minimum hours", availabilityNotes: "Availability notes", contactsSection: "Contacts", email: "Email", phone: "Phone", saveChanges: "Save changes" },
  photos: { unsupportedFormat: "Unsupported format. Use JPG, PNG or WebP.", fileTooLarge: "File too large. Maximum 10MB.", uploadError: "Error uploading", photosCount: "Photos ({count}/10)", addPhoto: "Add photo", addFirstPhoto: "Add at least one photo of your studio" }
};

en.portfolio = {
  noImages: "No images", noImagesDesc: "Upload your first photos to start building your portfolio.", uploadImage: "Upload image", cover: "Cover", deleteConfirm: "Are you sure you want to delete this image?", profilePhotos: "Profile photos", photosDesc: "Upload up to {maxPhotos} photos. The cover photo will be shown as preview to scouts.", addPhoto: "Add photo", unsupportedFormat: "Unsupported format. Use JPG, PNG or WebP.", fileTooLarge: "File too large. Maximum 10MB.", uploadError: "Error uploading", deletePhotoConfirm: "Delete this photo?", error: "Error"
};

en.publish = {
  published: "Profile published", unpublished: "Profile not published", hideProfile: "Hide profile", publishProfile: "Publish profile", requirementsIntro: "To publish your profile you must meet all requirements:", reqAge: "Age 18+", reqName: "Full name", reqImage: "At least 1 image", reqCover: "Cover image set"
};

en.applications = {
  apply: "Apply", applicationSent: "Application submitted successfully!", introMessage: "Introduction message (optional)", introPlaceholder: "Briefly introduce yourself to the scout...", submitApplication: "Submit application", accept: "Accept", reject: "Reject"
};

en.layout = {
  switchLang: "Switch to English", switchLangAlt: "Passa all'italiano", langCode: "EN", langCodeAlt: "IT"
};

en.ui = {
  timePicker: { morning: "Morning", afternoon: "Afternoon", evening: "Evening", selectTime: "Select time", selectEndTime: "Now select the end time.", tapInstructions: "Tap start, then end. Occupied slots in red.", selected: "Selected", range: "Range", occupied: "Occupied" },
  calendar: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun", selected: "Selected", unavailable: "Unavailable", today: "Today" },
  imageCropper: { title: "Crop image", instructions: "Drag to move, use scroll wheel or buttons to zoom.", zoomOut: "Zoom out", zoomIn: "Zoom in", resetZoom: "Reset", cancel: "Cancel", cropAndUpload: "Crop & upload" },
  password: { show: "Show password", hide: "Hide password" }
};

en.status = {
  saving: "Saving...", saved: "Saved", changesSaved: "Changes saved", errorSaving: "Error saving changes", errorSending: "Error sending", savedExcl: "Saved!"
};

en.timeAgo = { now: "just now", minutesAgo: "{count}m ago", hoursAgo: "{count}h ago", daysAgo: "{count}d ago" };

en.actions = {
  unauthorized: "Unauthorized", profileNotFound: "Profile not found", imageNotFound: "Image not found", maxImages: "Maximum {max} images", uploadError: "Error uploading", deleteError: "Error deleting", updateError: "Error updating", publishError: "Error publishing", reorderError: "Error reordering", setCoverError: "Error setting cover", unpublishError: "Error unpublishing", invalidData: "Invalid data", notFound: "Not found", studioNotFound: "Studio not found", studioProfileNotFound: "Studio profile not found", createError: "Error creating", sendError: "Error sending request", requestNotFound: "Request not found", applicationNotFound: "Application not found", castingNotFound: "Casting not found or no longer open", jobNotFound: "Job not found or no longer open", deadlineExpired: "Application deadline has passed", alreadyApplied: "You have already applied", alreadySentRequest: "You already sent a request to this model", profileNotPublished: "Your profile must be published to apply", profileNotPublishedForBoost: "Your profile must be published to purchase a boost", verificationRequired: "Your account must be verified", planNoContacts: "Your plan does not include contact requests. Upgrade to Starter or Pro.", monthlyLimitReached: "You have reached your monthly limit of {limit} requests", dailyLimitReached: "You have reached your daily limit of {limit} requests", profileNotPublishedOrBlocked: "Profile not found or not published", cannotContactProfile: "Cannot contact this profile", requestAlreadyHandled: "This request has been already handled", titleDescriptionRequired: "Title and description are required to publish", missingRequirements: "Missing requirements: {list}", noFile: "No file", unsupportedFormat: "Unsupported format", fileTooLarge: "File too large (max 10MB)", imageIdMissing: "Image ID missing", dataMissing: "Missing data", maxStudioImages: "Maximum {max} images per studio", noActiveSubscription: "No active subscription", invalidPlan: "Invalid plan", paymentSessionError: "Error creating payment session", error: "Error"
};

en.contactList = {
  pending: "Pending", accepted: "Accepted", rejected: "Rejected", expired: "Expired", collapse: "Collapse", readMessage: "Read message", accept: "Accept", decline: "Decline", goToChat: "Go to chat", waitingResponse: "Waiting for response"
};

en.settingsForm = {
  account: "Account", name: "Name", emailCannotChange: "Email cannot be changed.", language: "Language", save: "Save", saved: "Saved!"
};

en.billingActions = {
  upgradeStarter: "Upgrade to Starter — €39/mo", upgradePro: "Upgrade to Pro — €99/mo", manageSubscription: "Manage subscription", upgradeModelPro: "Upgrade to Model Pro — €14.99/mo"
};

en.profileView = {
  contact: "Contact", bust: "Bust", waist: "Waist", hips: "Hips", shoes: "Shoes", dressSize: "Dress size"
};

en.validation = {
  subjectMinChars: "Subject must be at least 3 characters", messageMinChars: "Message must be at least 10 characters", titleMinChars: "Title must be at least 3 characters", descriptionMinChars: "Description must be at least 20 characters"
};

// ─── NEW SECTIONS FOR it.json ───────────────────────────────────────

it.errors = {
  notFound: { title: "Pagina non trovata", description: "La pagina che stai cercando non esiste o è stata spostata.", backHome: "Torna alla home" },
  generic: { title: "Qualcosa è andato storto", description: "Si è verificato un errore imprevisto. Riprova o torna alla pagina precedente.", retry: "Riprova", backHome: "Torna alla home" },
  unknownError: "Errore sconosciuto"
};

it.pages = {
  model: {
    portfolio: { title: "Portfolio", description: "Gestisci le tue immagini. Massimo {maxPhotos} foto. JPG, PNG, WebP — max 10MB ciascuna.", yourImages: "Le tue immagini ({count}/{max})", upgradeTitle: "Passa a Model Pro", upgradeDesc: "9 foto, 1 video, book PDF — €14,99/mese", upgrade: "Upgrade" },
    castings: { title: "Casting Aperti", description: "Esplora i casting pubblicati da scout e agenzie verificate", noResults: "Al momento non ci sono casting aperti. Torna più tardi!" },
    jobs: { title: "Lavori Disponibili", description: "Esplora le opportunità di lavoro pubblicate da scout e agenzie", noResults: "Al momento non ci sono lavori pubblicati. Torna più tardi!" },
    applications: { title: "Le tue candidature", description: "Tieni traccia delle tue candidature a casting e lavori" },
    contacts: { title: "Richieste di Contatto", description: "Gestisci le richieste ricevute da scout, agenzie e brand", noRequests: "Nessuna richiesta", noRequestsDesc: "Quando un professionista ti contatterà, vedrai la richiesta qui." },
    messages: { title: "Messaggi", description: "Le tue conversazioni con professionisti verificati" },
    notifications: { noNotifications: "Nessuna notifica", noNotificationsDesc: "Le tue notifiche appariranno qui." },
    discover: { title: "Scopri i Modelli", description: "Esplora i profili dei modelli pubblicati sulla piattaforma", noProfiles: "Nessun profilo pubblicato", noProfilesDesc: "Non ci sono ancora profili pubblicati. Sii il primo a pubblicare il tuo!" },
    billing: { freePlanDesc: "Stai usando il piano gratuito. Passa a Model Pro per sbloccare tutte le funzionalità.", month: "mese" }
  },
  scout: {
    jobs: { title: "I Miei Lavori", description: "Gestisci i tuoi lavori e le candidature", new: "Nuovo lavoro" },
    castings: { title: "I Miei Casting", description: "Gestisci i tuoi casting e le candidature", new: "Nuovo casting", applicationsReceived: "candidature ricevute" },
    discover: { noResults: "Nessun risultato", noResultsDesc: "Prova a modificare i filtri di ricerca per trovare più profili." },
    boards: { backToBoards: "Torna alle bacheche", profiles: "profili", addFromDiscover: "Aggiungi profili dalla pagina Scopri Talenti." },
    contacts: { title: "Richieste Inviate", description: "Monitora lo stato delle tue richieste di contatto" },
    messages: { title: "Messaggi", description: "Le tue conversazioni con modelle e modelli" },
    notifications: { noNotifications: "Nessuna notifica", noNotificationsDesc: "Le tue notifiche appariranno qui." },
    profile: { title: "Profilo", description: "Gestisci le informazioni del tuo profilo." },
    billing: { freePlanDesc: "Stai usando il piano gratuito. Passa a Starter o Pro per sbloccare tutte le funzionalità.", month: "mese" }
  },
  studio: {
    studios: { title: "I miei studi", description: "Gestisci i tuoi spazi e i relativi annunci", addStudio: "Aggiungi studio", noStudios: "Nessuno studio ancora", noStudiosDesc: "Aggiungi il tuo primo studio per iniziare a ricevere richieste." },
    bookings: { title: "Prenotazioni", description: "Gestisci le prenotazioni ricevute per i tuoi studi" },
    inquiries: { title: "Richieste ricevute", description: "Gestisci le richieste di informazioni per i tuoi studi", noInquiries: "Nessuna richiesta" },
    messages: { title: "Messaggi", description: "Le tue conversazioni con clienti e professionisti" },
    notifications: { noNotifications: "Nessuna notifica", noNotificationsDesc: "Le tue notifiche appariranno qui." }
  },
  admin: {
    reports: { noReports: "Nessuna segnalazione", noReportsDesc: "Non ci sono segnalazioni in attesa." },
    verifications: { noPending: "Nessuna verifica in attesa", noPendingDesc: "Non ci sono richieste di verifica da esaminare." },
    castings: { noCastings: "Nessun casting", noCastingsDesc: "Non ci sono ancora casting creati." },
    subscriptions: { noSubscriptions: "Nessun abbonamento", noSubscriptionsDesc: "Non ci sono abbonamenti a pagamento." }
  },
  marketing: {
    studios: { spacesFound: "{count} spazio trovato", spacesFoundPlural: "{count} spazi trovati", noSpaces: "Nessuno spazio disponibile", noSpacesDesc: "Al momento non ci sono studi pubblicati. Torna presto!", ctaTitle: "Hai uno studio da affittare?", ctaDesc: "Pubblica il tuo spazio gratis e inizia a ricevere richieste da professionisti della moda.", ctaButton: "Registra il tuo studio" }
  },
  common: {
    backToJobs: "Torna ai lavori", backToCastings: "Torna ai casting", backToMessages: "Torna ai messaggi", backToStudios: "Torna ai miei studi", backToSearch: "Torna alla ricerca", back: "Indietro", publishedBy: "Pubblicato da", publishProfileRequired: "Devi pubblicare il tuo profilo prima di poterti candidare."
  }
};

it.forms = {
  job: {
    sectionDetails: "Dettagli del lavoro", title: "Titolo", titlePlaceholder: "Es: Shooting per brand moda", description: "Descrizione", descriptionPlaceholder: "Descrivi il lavoro in dettaglio...", jobType: "Tipo di lavoro", selectPlaceholder: "Seleziona...", brandClient: "Brand / Cliente", city: "Città", region: "Regione", specificLocation: "Luogo specifico", locationPlaceholder: "Es: Studio fotografico via Montenapoleone", jobDates: "Date del lavoro", jobDatesPlaceholder: "Es: 15-17 Aprile 2026", applicationDeadline: "Scadenza candidature", availableSpots: "Posti disponibili", sectionRequirements: "Requisiti e compenso", modelRequirements: "Requisiti modello", modelRequirementsPlaceholder: "Es: Altezza minima 175cm, taglie 38-42...", compensation: "Compenso", compensationPlaceholder: "Es: €500/giorno", paidJob: "Questo è un lavoro retribuito", additionalNotes: "Note aggiuntive (solo per te)", saveChanges: "Salva modifiche", createJob: "Crea lavoro"
  },
  casting: {
    sectionDetails: "Dettagli del casting", title: "Titolo", titlePlaceholder: "Es: Casting per campagna SS25", description: "Descrizione", descriptionPlaceholder: "Descrivi il casting in dettaglio...", city: "Città", region: "Regione", selectPlaceholder: "Seleziona...", castingDate: "Data casting", applicationDeadline: "Scadenza candidature", sectionType: "Tipo di casting", mode: "Modalità", time: "Orario", timePlaceholder: "Es: 10:00 - 18:00", address: "Indirizzo", addressPlaceholder: "Es: Via Montenapoleone 8, Milano", onlineInstructions: "Istruzioni per il casting online", onlineInstructionsPlaceholder: "Es: Inviare un video selfie di 30 secondi...", requiredMaterials: "Materiali richiesti", materialsPlaceholder: "Es: Book fotografico, comp card, documento d'identità...", sectionRequirements: "Requisiti e compenso", requirements: "Requisiti", requirementsPlaceholder: "Es: Altezza minima 175cm, esperienza in passerella...", compensation: "Compenso", compensationPlaceholder: "Es: €500/giorno", availableSpots: "Posti disponibili", paidJob: "Questo è un lavoro retribuito", additionalNotes: "Note aggiuntive (solo per te)", saveChanges: "Salva modifiche", createCasting: "Crea casting"
  },
  contact: {
    contactTitle: "Contatta", contactDescription: "Invia una richiesta di contatto professionale. Il/la modello/a potrà accettare o rifiutare.", requestSent: "Richiesta inviata!", requestSentDesc: "Riceverai una notifica quando il/la modello/a risponderà.", reason: "Motivo", selectReason: "Seleziona motivo...", subject: "Oggetto", subjectPlaceholder: "Es: Casting per campagna SS25", message: "Messaggio", messagePlaceholder: "Presentati e spiega il motivo del contatto...", charLimit: "Min 20 caratteri, max 1000", sendRequest: "Invia richiesta"
  },
  modelProfile: {
    firstName: "Nome", lastName: "Cognome", selectRegionFirst: "Seleziona prima la regione", bioPlaceholder: "Racconta qualcosa di te...", selectCategories: "Seleziona categorie...", selectOneOrMore: "Seleziona una o più categorie", username: "nomeutente"
  },
  scoutProfile: {
    businessInfo: "Informazioni attività", businessName: "Nome attività", businessNamePlaceholder: "Es. Koci Agency", role: "Ruolo", rolePlaceholder: "Es. Direttore Casting", city: "Città", cityPlaceholder: "Es. Milano", vatNumber: "Partita IVA", vatNumberPlaceholder: "Es. IT12345678901", bio: "Bio", bioPlaceholder: "Descrivi la tua attività...", contacts: "Contatti", professionalEmail: "Email professionale", emailPlaceholder: "Es. info@agenzia.it", website: "Sito web", websitePlaceholder: "https://www.esempio.it", socialProfile: "Profilo social", socialPlaceholder: "https://instagram.com/..."
  }
};

it.studio = {
  booking: {
    selectDatesFromCalendar: "Seleziona le date dal calendario", selectTimeSlot: "Seleziona l'orario", fillNameEmail: "Compila nome e email", bookingSent: "Prenotazione inviata!", bookingSentDesc: "Il proprietario dello studio confermerà la tua prenotazione al più presto.", selectDates: "Seleziona le date", selectDatesInstructions: "Clicca la data di inizio, poi la data di fine.", day: "giorno", days: "giorni", estimatedTotal: "Totale stimato", priceToAgree: "Prezzo da concordare con il proprietario", yourDetails: "I tuoi dati", fullName: "Nome completo", phone: "Telefono", additionalNotes: "Note aggiuntive", projectPlaceholder: "Descrivi brevemente il tuo progetto...", bookNow: "Prenota"
  },
  inquiry: {
    fillRequired: "Compila i campi obbligatori", inquirySent: "Richiesta inviata!", inquirySentDesc: "Il proprietario dello studio ti contatterà al più presto.", requestInfo: "Richiedi informazioni", name: "Nome", phone: "Telefono", preferredDates: "Date preferite", duration: "Durata (ore)", message: "Messaggio", messagePlaceholder: "Descrivi il tuo progetto e le tue esigenze...", sendInquiry: "Invia richiesta"
  },
  filters: { searchPlaceholder: "Cerca per nome, città...", allRegions: "Tutte le regioni", allTypes: "Tutti i tipi", search: "Cerca", clear: "Pulisci" },
  perHour: "/ora", perDay: "/giorno",
  noStudiosWithLocation: "Nessuno studio con posizione disponibile",
  grid: "Griglia", map: "Mappa",
  publish: { deleteConfirm: "Sei sicuro di voler eliminare questo studio? L'azione è irreversibile.", view: "Vedi", publishBtn: "Pubblica", pause: "Metti in pausa" },
  availability: { title: "Gestisci disponibilità", instructions: "Clicca sulle date per selezionarle, poi blocca le date selezionate.", blockDate: "Blocca {count} data", blockDates: "Blocca {count} date", blockedDates: "Date bloccate ({count})" },
  editForm: { saved: "Modifiche salvate con successo", basicInfo: "Informazioni base", studioName: "Nome dello studio", spaceType: "Tipo di spazio", description: "Descrizione", location: "Posizione", address: "Indirizzo", city: "Città", region: "Regione", postalCode: "CAP", spaceDetails: "Dettagli spazio", area: "Superficie (m²)", maxCapacity: "Capienza max", includedServices: "Servizi inclusi", rates: "Tariffe", hourly: "Oraria (€)", daily: "Giornaliera (€)", weekly: "Settimanale (€)", minHours: "Minimo ore", availabilityNotes: "Note disponibilità", contactsSection: "Contatti", email: "Email", phone: "Telefono", saveChanges: "Salva modifiche" },
  photos: { unsupportedFormat: "Formato non supportato. Usa JPG, PNG o WebP.", fileTooLarge: "Il file è troppo grande. Massimo 10MB.", uploadError: "Errore durante il caricamento", photosCount: "Foto ({count}/10)", addPhoto: "Aggiungi foto", addFirstPhoto: "Aggiungi almeno una foto del tuo studio" }
};

it.portfolio = {
  noImages: "Nessuna immagine", noImagesDesc: "Carica le tue prime foto per iniziare a costruire il tuo portfolio.", uploadImage: "Carica immagine", cover: "Copertina", deleteConfirm: "Sei sicuro di voler eliminare questa immagine?", profilePhotos: "Foto profilo", photosDesc: "Carica fino a {maxPhotos} foto. La foto copertina sarà mostrata in anteprima agli scout.", addPhoto: "Aggiungi foto", unsupportedFormat: "Formato non supportato. Usa JPG, PNG o WebP.", fileTooLarge: "Il file è troppo grande. Massimo 10MB.", uploadError: "Errore durante il caricamento", deletePhotoConfirm: "Eliminare questa foto?", error: "Errore"
};

it.publish = {
  published: "Profilo pubblicato", unpublished: "Profilo non pubblicato", hideProfile: "Nascondi profilo", publishProfile: "Pubblica profilo", requirementsIntro: "Per pubblicare il profilo devi soddisfare tutti i requisiti:", reqAge: "Età 18+", reqName: "Nome completo", reqImage: "Almeno 1 immagine", reqCover: "Immagine di copertina"
};

it.applications = {
  apply: "Candidati", applicationSent: "Candidatura inviata con successo!", introMessage: "Messaggio di presentazione (opzionale)", introPlaceholder: "Presentati brevemente allo scout...", submitApplication: "Invia candidatura", accept: "Accetta", reject: "Rifiuta"
};

it.layout = {
  switchLang: "Passa all'italiano", switchLangAlt: "Switch to English", langCode: "IT", langCodeAlt: "EN"
};

it.ui = {
  timePicker: { morning: "Mattina", afternoon: "Pomeriggio", evening: "Sera", selectTime: "Seleziona orario", selectEndTime: "Ora seleziona l'orario di fine.", tapInstructions: "Tocca per selezionare inizio, poi fine. Slot occupati in rosso.", selected: "Selezionato", range: "Intervallo", occupied: "Occupato" },
  calendar: { mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab", sun: "Dom", selected: "Selezionato", unavailable: "Non disponibile", today: "Oggi" },
  imageCropper: { title: "Ritaglia immagine", instructions: "Trascina per spostare, usa la rotellina o i pulsanti per zoomare.", zoomOut: "Riduci", zoomIn: "Ingrandisci", resetZoom: "Ripristina", cancel: "Annulla", cropAndUpload: "Ritaglia e carica" },
  password: { show: "Mostra password", hide: "Nascondi password" }
};

it.status = {
  saving: "Salvataggio in corso...", saved: "Salvato", changesSaved: "Modifiche salvate", errorSaving: "Errore durante il salvataggio", errorSending: "Errore nell'invio", savedExcl: "Salvato!"
};

it.timeAgo = { now: "adesso", minutesAgo: "{count} min fa", hoursAgo: "{count}h fa", daysAgo: "{count}g fa" };

it.actions = {
  unauthorized: "Non autorizzato", profileNotFound: "Profilo non trovato", imageNotFound: "Immagine non trovata", maxImages: "Massimo {max} immagini", uploadError: "Errore durante il caricamento", deleteError: "Errore durante l'eliminazione", updateError: "Errore durante l'aggiornamento", publishError: "Errore durante la pubblicazione", reorderError: "Errore durante il riordinamento", setCoverError: "Errore durante l'impostazione", unpublishError: "Errore durante la rimozione", invalidData: "Dati non validi", notFound: "Non trovato", studioNotFound: "Studio non trovato", studioProfileNotFound: "Profilo studio non trovato", createError: "Errore durante la creazione", sendError: "Errore durante l'invio della richiesta", requestNotFound: "Richiesta non trovata", applicationNotFound: "Candidatura non trovata", castingNotFound: "Casting non trovato o non più aperto", jobNotFound: "Lavoro non trovato o non più aperto", deadlineExpired: "Il termine per candidarsi è scaduto", alreadyApplied: "Ti sei già candidato/a", alreadySentRequest: "Hai già inviato una richiesta a questo modello/a", profileNotPublished: "Il tuo profilo deve essere pubblicato per candidarti", profileNotPublishedForBoost: "Il tuo profilo deve essere pubblicato per acquistare un boost", verificationRequired: "Il tuo account deve essere verificato", planNoContacts: "Il tuo piano non include richieste di contatto. Passa a Starter o Pro.", monthlyLimitReached: "Hai raggiunto il limite mensile di {limit} richieste", dailyLimitReached: "Hai raggiunto il limite giornaliero di {limit} richieste", profileNotPublishedOrBlocked: "Profilo non trovato o non pubblicato", cannotContactProfile: "Non è possibile contattare questo profilo", requestAlreadyHandled: "Questa richiesta è già stata gestita", titleDescriptionRequired: "Titolo e descrizione sono obbligatori per pubblicare", missingRequirements: "Requisiti mancanti: {list}", noFile: "Nessun file", unsupportedFormat: "Formato non supportato", fileTooLarge: "File troppo grande (max 10MB)", imageIdMissing: "ID immagine mancante", dataMissing: "Dati mancanti", maxStudioImages: "Massimo {max} immagini per studio", noActiveSubscription: "Nessun abbonamento attivo", invalidPlan: "Piano non valido", paymentSessionError: "Errore nella creazione della sessione di pagamento", error: "Errore"
};

it.contactList = {
  pending: "In attesa", accepted: "Accettata", rejected: "Rifiutata", expired: "Scaduta", collapse: "Comprimi", readMessage: "Leggi messaggio", accept: "Accetta", decline: "Rifiuta", goToChat: "Vai alla chat", waitingResponse: "In attesa di risposta"
};

it.settingsForm = {
  account: "Account", name: "Nome", emailCannotChange: "L'email non può essere modificata.", language: "Lingua", save: "Salva", saved: "Salvato!"
};

it.billingActions = {
  upgradeStarter: "Passa a Starter — 39€/mese", upgradePro: "Passa a Pro — 99€/mese", manageSubscription: "Gestisci abbonamento", upgradeModelPro: "Passa a Model Pro — €14,99/mese"
};

it.profileView = {
  contact: "Contatta", bust: "Busto", waist: "Vita", hips: "Fianchi", shoes: "Scarpe", dressSize: "Taglia"
};

it.validation = {
  subjectMinChars: "L'oggetto deve contenere almeno 3 caratteri", messageMinChars: "Il messaggio deve contenere almeno 10 caratteri", titleMinChars: "Il titolo deve contenere almeno 3 caratteri", descriptionMinChars: "La descrizione deve contenere almeno 20 caratteri"
};

// ─── WRITE FILES ────────────────────────────────────────────────────

writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');

console.log('✅ en.json expanded:', Object.keys(en).length, 'top-level keys');
console.log('✅ it.json expanded:', Object.keys(it).length, 'top-level keys');
