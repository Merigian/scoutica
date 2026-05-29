import json

with open('src/messages/it.json', 'r', encoding='utf-8') as f:
    it = json.load(f)
with open('src/messages/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

it_new = {
    "privacy": {
        "title": "Informativa sulla Privacy",
        "lastUpdated": "Ultimo aggiornamento: 13 aprile 2026",
        "intro": "Scoutica si impegna a proteggere la tua privacy. Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali in conformit\u00e0 con il Regolamento (UE) 2016/679 (GDPR) e il D.lgs. 196/2003.",
        "sections": {
            "dataController": {"title": "Titolare del Trattamento", "content": "Il titolare del trattamento dei dati \u00e8 Scoutica, con sede in Italia. Per qualsiasi richiesta relativa ai dati personali, contattare: privacy@scoutica.it"},
            "dataCollected": {"title": "Dati Raccolti", "content": "Raccogliamo i seguenti dati personali: nome e cognome, indirizzo email, data di nascita, misure corporee (altezza, busto, vita, fianchi, taglia scarpe, taglia vestito), caratteristiche fisiche (colore occhi, capelli, etnia), fotografie del portfolio, link ai profili social, citt\u00e0 e regione di residenza, dati di pagamento (elaborati tramite Stripe), dati di navigazione e cookie tecnici."},
            "purpose": {"title": "Finalit\u00e0 del Trattamento", "content": "I tuoi dati sono trattati per: creazione e gestione del tuo account, pubblicazione del tuo profilo sulla piattaforma, connessione tra modelli e professionisti dello scouting, gestione delle candidature a casting e lavori, elaborazione dei pagamenti e degli abbonamenti, invio di notifiche relative al servizio, miglioramento e sicurezza della piattaforma."},
            "legalBasis": {"title": "Base Giuridica", "content": "Il trattamento \u00e8 basato su: il tuo consenso esplicito (art. 6.1.a GDPR), l\u2019esecuzione del contratto di servizio (art. 6.1.b GDPR), il legittimo interesse per la sicurezza della piattaforma (art. 6.1.f GDPR)."},
            "rights": {"title": "I Tuoi Diritti", "content": "Hai il diritto di: accedere ai tuoi dati personali, rettificare dati inesatti, cancellare i tuoi dati (diritto all\u2019oblio), limitare il trattamento, portabilit\u00e0 dei dati, opporti al trattamento, revocare il consenso in qualsiasi momento. Per esercitare questi diritti, contatta privacy@scoutica.it o utilizza le funzionalit\u00e0 disponibili nelle impostazioni del tuo account."},
            "dataRetention": {"title": "Conservazione dei Dati", "content": "I tuoi dati personali sono conservati per la durata del tuo account. Dopo la cancellazione dell\u2019account, i dati vengono eliminati entro 30 giorni, ad eccezione dei dati necessari per obblighi legali o contrattuali."},
            "sharing": {"title": "Condivisione dei Dati", "content": "I tuoi dati possono essere condivisi con: Stripe Inc. per l\u2019elaborazione dei pagamenti, Resend per l\u2019invio delle email transazionali, Cloudflare per la distribuzione dei contenuti. Non vendiamo i tuoi dati a terzi."},
            "security": {"title": "Sicurezza", "content": "Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati, inclusa la crittografia delle password, connessioni HTTPS e accesso limitato ai dati."},
            "cookies": {"title": "Cookie", "content": "Utilizziamo cookie tecnici necessari per il funzionamento del sito (sessione di autenticazione, preferenze lingua e tema). Non utilizziamo cookie di profilazione o di terze parti per scopi pubblicitari."},
            "contact": {"title": "Contatti", "content": "Per domande sulla privacy, contatta: privacy@scoutica.it"}
        }
    },
    "terms": {
        "title": "Termini di Servizio",
        "lastUpdated": "Ultimo aggiornamento: 13 aprile 2026",
        "intro": "Benvenuto su Scoutica. Utilizzando la nostra piattaforma, accetti i seguenti termini e condizioni.",
        "sections": {
            "service": {"title": "Il Servizio", "content": "Scoutica \u00e8 una piattaforma online che mette in contatto modelli/e con scout, agenzie e brand per opportunit\u00e0 professionali nel settore della moda."},
            "eligibility": {"title": "Requisiti di Accesso", "content": "Per utilizzare Scoutica devi: avere almeno 18 anni di et\u00e0, fornire informazioni veritiere e accurate, non essere stato precedentemente sospeso dalla piattaforma."},
            "accounts": {"title": "Account e Profili", "content": "Sei responsabile della sicurezza del tuo account e della veridicit\u00e0 delle informazioni fornite. \u00c8 vietato creare account falsi, utilizzare foto di altre persone senza consenso, o fornire misure non veritiere."},
            "conduct": {"title": "Comportamento", "content": "\u00c8 vietato: molestare, intimidire o discriminare altri utenti, pubblicare contenuti offensivi, violenti o sessualmente espliciti, utilizzare la piattaforma per scopi illegali, contattare utenti al di fuori della piattaforma per aggirare il sistema a pagamento."},
            "ip": {"title": "Propriet\u00e0 Intellettuale", "content": "Mantieni la propriet\u00e0 delle foto e dei contenuti che carichi su Scoutica. Concedi a Scoutica una licenza non esclusiva per visualizzare i tuoi contenuti sulla piattaforma."},
            "payments": {"title": "Pagamenti e Abbonamenti", "content": "I pagamenti sono elaborati tramite Stripe. Gli abbonamenti si rinnovano automaticamente. Puoi annullare in qualsiasi momento; l\u2019accesso premium rimane attivo fino alla fine del periodo pagato. I boost non sono rimborsabili."},
            "liability": {"title": "Limitazione di Responsabilit\u00e0", "content": "Scoutica non \u00e8 responsabile per: la veridicit\u00e0 delle informazioni fornite dagli utenti, accordi stipulati tra utenti al di fuori della piattaforma, perdita di dati dovuta a circostanze al di fuori del nostro controllo."},
            "termination": {"title": "Sospensione e Chiusura", "content": "Scoutica pu\u00f2 sospendere o chiudere il tuo account in caso di violazione di questi termini. Puoi eliminare il tuo account in qualsiasi momento dalle impostazioni."},
            "changes": {"title": "Modifiche ai Termini", "content": "Ci riserviamo il diritto di modificare questi termini. Le modifiche significative saranno comunicate via email o notifica nella piattaforma."},
            "law": {"title": "Legge Applicabile", "content": "Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia \u00e8 competente il Foro di Milano."}
        }
    },
    "cookie": {
        "message": "Questo sito utilizza cookie tecnici necessari per il funzionamento del servizio.",
        "accept": "Accetta",
        "learnMore": "Scopri di pi\u00f9"
    },
    "deleteAccount": {
        "title": "Elimina Account",
        "warning": "Questa azione \u00e8 irreversibile. Tutti i tuoi dati, foto, messaggi e candidature verranno eliminati permanentemente.",
        "confirm": "Scrivi ELIMINA per confermare",
        "placeholder": "ELIMINA",
        "button": "Elimina il mio account",
        "success": "Account eliminato con successo.",
        "mismatch": "La conferma non corrisponde."
    },
    "dataExport": {
        "title": "Esporta i tuoi dati",
        "description": "Scarica una copia di tutti i tuoi dati personali in formato JSON.",
        "button": "Scarica i miei dati",
        "preparing": "Preparazione in corso..."
    },
    "resetPassword": {
        "title": "Reimposta Password",
        "newPassword": "Nuova password",
        "confirmPassword": "Conferma password",
        "button": "Reimposta password",
        "success": "Password reimpostata con successo!",
        "invalidToken": "Il link \u00e8 scaduto o non valido.",
        "backToLogin": "Torna al login"
    },
    "withdraw": {
        "button": "Ritira candidatura",
        "confirm": "Sei sicuro di voler ritirare questa candidatura?",
        "success": "Candidatura ritirata.",
        "cancel": "Annulla"
    },
    "onboarding": {
        "welcome": "Benvenuto su Scoutica!",
        "subtitle": "Completa il tuo profilo per iniziare a ricevere opportunit\u00e0.",
        "steps": {
            "photo": "Carica le tue foto",
            "photoDesc": "Aggiungi almeno 3 foto al tuo portfolio.",
            "measurements": "Inserisci le misure",
            "measurementsDesc": "Altezza e almeno altre 2 misure.",
            "info": "Completa le informazioni",
            "infoDesc": "Nome, citt\u00e0, categoria professionale.",
            "publish": "Pubblica il profilo",
            "publishDesc": "Renditi visibile a scout e agenzie."
        },
        "skip": "Lo far\u00f2 dopo",
        "goTo": "Vai a",
        "done": "Il tuo profilo \u00e8 completo!",
        "doneDesc": "Ora sei visibile a scout e agenzie. Buona fortuna!"
    },
    "boostPurchase": {
        "title": "Boosta il tuo profilo",
        "description": "Appari in evidenza nella ricerca e sulla homepage per 7 giorni.",
        "price": "\u20ac4.99 per 7 giorni",
        "button": "Acquista Boost",
        "active": "Boost attivo",
        "activeUntil": "In evidenza fino al",
        "maxReached": "Hai raggiunto il massimo di 4 boost attivi."
    },
    "report": {
        "button": "Segnala",
        "blockButton": "Blocca utente",
        "blockConfirm": "Sei sicuro di voler bloccare questo utente? Non potrete pi\u00f9 comunicare.",
        "blocked": "Utente bloccato.",
        "title": "Segnala contenuto",
        "reason": "Motivo della segnalazione",
        "details": "Dettagli aggiuntivi",
        "submit": "Invia segnalazione",
        "success": "Segnalazione inviata. Grazie per aiutarci a mantenere la piattaforma sicura."
    },
    "opportunityFilters": {
        "search": "Cerca casting e lavori...",
        "city": "Citt\u00e0",
        "paidOnly": "Solo retribuiti",
        "allTypes": "Tutti i tipi",
        "clearFilters": "Rimuovi filtri"
    }
}

en_new = {
    "privacy": {
        "title": "Privacy Policy",
        "lastUpdated": "Last updated: April 13, 2026",
        "intro": "Scoutica is committed to protecting your privacy. This policy describes how we collect, use, and protect your personal data in accordance with Regulation (EU) 2016/679 (GDPR).",
        "sections": {
            "dataController": {"title": "Data Controller", "content": "The data controller is Scoutica, based in Italy. For any request regarding personal data, contact: privacy@scoutica.it"},
            "dataCollected": {"title": "Data Collected", "content": "We collect the following personal data: full name, email address, date of birth, body measurements, physical characteristics, portfolio photographs, social media links, city and region of residence, payment data (processed via Stripe), browsing data and technical cookies."},
            "purpose": {"title": "Purpose of Processing", "content": "Your data is processed for: account creation and management, profile publication, connecting models with scouting professionals, managing casting and job applications, payment processing, service notifications, platform improvement and security."},
            "legalBasis": {"title": "Legal Basis", "content": "Processing is based on: your explicit consent (art. 6.1.a GDPR), performance of the service contract (art. 6.1.b GDPR), legitimate interest for platform security (art. 6.1.f GDPR)."},
            "rights": {"title": "Your Rights", "content": "You have the right to: access your personal data, rectify inaccurate data, delete your data (right to be forgotten), restrict processing, data portability, object to processing, withdraw consent at any time. To exercise these rights, contact privacy@scoutica.it or use the features available in your account settings."},
            "dataRetention": {"title": "Data Retention", "content": "Your personal data is retained for the duration of your account. After account deletion, data is removed within 30 days, except for data required for legal or contractual obligations."},
            "sharing": {"title": "Data Sharing", "content": "Your data may be shared with: Stripe Inc. for payment processing, Resend for transactional emails, Cloudflare for content delivery. We do not sell your data to third parties."},
            "security": {"title": "Security", "content": "We adopt appropriate technical and organizational measures to protect your data, including password encryption, HTTPS connections, and restricted data access."},
            "cookies": {"title": "Cookies", "content": "We use technical cookies necessary for site functionality (authentication session, language and theme preferences). We do not use profiling or third-party cookies for advertising purposes."},
            "contact": {"title": "Contact", "content": "For privacy questions, contact: privacy@scoutica.it"}
        }
    },
    "terms": {
        "title": "Terms of Service",
        "lastUpdated": "Last updated: April 13, 2026",
        "intro": "Welcome to Scoutica. By using our platform, you agree to the following terms and conditions.",
        "sections": {
            "service": {"title": "The Service", "content": "Scoutica is an online platform connecting models with scouts, agencies, and brands for professional opportunities in the fashion industry."},
            "eligibility": {"title": "Eligibility Requirements", "content": "To use Scoutica you must: be at least 18 years old, provide truthful and accurate information, not have been previously suspended from the platform."},
            "accounts": {"title": "Accounts and Profiles", "content": "You are responsible for the security of your account and the accuracy of the information provided. It is forbidden to create fake accounts, use photos of other people without consent, or provide false information."},
            "conduct": {"title": "Conduct", "content": "It is forbidden to: harass, intimidate or discriminate against other users, publish offensive or violent content, use the platform for illegal purposes, contact users outside the platform to circumvent the payment system."},
            "ip": {"title": "Intellectual Property", "content": "You retain ownership of photos and content you upload to Scoutica. You grant Scoutica a non-exclusive license to display your content on the platform."},
            "payments": {"title": "Payments and Subscriptions", "content": "Payments are processed via Stripe. Subscriptions renew automatically. You can cancel at any time; premium access remains active until the end of the paid period. Boosts are non-refundable."},
            "liability": {"title": "Limitation of Liability", "content": "Scoutica is not responsible for: the accuracy of information provided by users, agreements made between users outside the platform, loss of data due to circumstances beyond our control."},
            "termination": {"title": "Suspension and Closure", "content": "Scoutica may suspend or close your account if you violate these terms. You can delete your account at any time from settings."},
            "changes": {"title": "Changes to Terms", "content": "We reserve the right to modify these terms. Significant changes will be communicated via email or in-platform notification."},
            "law": {"title": "Applicable Law", "content": "These terms are governed by Italian law. For any disputes, the Court of Milan has jurisdiction."}
        }
    },
    "cookie": {
        "message": "This site uses technical cookies necessary for the service to function.",
        "accept": "Accept",
        "learnMore": "Learn more"
    },
    "deleteAccount": {
        "title": "Delete Account",
        "warning": "This action is irreversible. All your data, photos, messages, and applications will be permanently deleted.",
        "confirm": "Type DELETE to confirm",
        "placeholder": "DELETE",
        "button": "Delete my account",
        "success": "Account deleted successfully.",
        "mismatch": "Confirmation does not match."
    },
    "dataExport": {
        "title": "Export your data",
        "description": "Download a copy of all your personal data in JSON format.",
        "button": "Download my data",
        "preparing": "Preparing..."
    },
    "resetPassword": {
        "title": "Reset Password",
        "newPassword": "New password",
        "confirmPassword": "Confirm password",
        "button": "Reset password",
        "success": "Password reset successfully!",
        "invalidToken": "The link is expired or invalid.",
        "backToLogin": "Back to login"
    },
    "withdraw": {
        "button": "Withdraw application",
        "confirm": "Are you sure you want to withdraw this application?",
        "success": "Application withdrawn.",
        "cancel": "Cancel"
    },
    "onboarding": {
        "welcome": "Welcome to Scoutica!",
        "subtitle": "Complete your profile to start receiving opportunities.",
        "steps": {
            "photo": "Upload your photos",
            "photoDesc": "Add at least 3 photos to your portfolio.",
            "measurements": "Enter your measurements",
            "measurementsDesc": "Height and at least 2 other measurements.",
            "info": "Complete your information",
            "infoDesc": "Name, city, professional category.",
            "publish": "Publish your profile",
            "publishDesc": "Make yourself visible to scouts and agencies."
        },
        "skip": "I'll do this later",
        "goTo": "Go to",
        "done": "Your profile is complete!",
        "doneDesc": "You are now visible to scouts and agencies. Good luck!"
    },
    "boostPurchase": {
        "title": "Boost your profile",
        "description": "Appear featured in search results and on the homepage for 7 days.",
        "price": "\u20ac4.99 for 7 days",
        "button": "Buy Boost",
        "active": "Boost active",
        "activeUntil": "Featured until",
        "maxReached": "You have reached the maximum of 4 active boosts."
    },
    "report": {
        "button": "Report",
        "blockButton": "Block user",
        "blockConfirm": "Are you sure you want to block this user? You will no longer be able to communicate.",
        "blocked": "User blocked.",
        "title": "Report content",
        "reason": "Reason for reporting",
        "details": "Additional details",
        "submit": "Submit report",
        "success": "Report submitted. Thank you for helping keep the platform safe."
    },
    "opportunityFilters": {
        "search": "Search castings and jobs...",
        "city": "City",
        "paidOnly": "Paid only",
        "allTypes": "All types",
        "clearFilters": "Clear filters"
    }
}

it.update(it_new)
en.update(en_new)

with open('src/messages/it.json', 'w', encoding='utf-8') as f:
    json.dump(it, f, indent=2, ensure_ascii=False)
    f.write('\n')
with open('src/messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f"Done! IT: {len(it)} keys, EN: {len(en)} keys")
print("New keys:", sorted(it_new.keys()))
