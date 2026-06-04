const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "messages");

const additions = {
  it: {
    serverErrors: {
      admin: { notFound: "Profilo non trovato" },
      verification: { alreadyVerified: "Il tuo profilo è già verificato" },
    },
    nav: { modelVerifications: "Verifiche modelle" },
    verification: {
      capture: {
        take: "Scatta",
        retake: "Ripeti",
        confirm: "Conferma e invia",
        sending: "Invio…",
        hint: "Inquadra il viso al centro, con buona illuminazione.",
        noCamera: "Fotocamera non disponibile su questo dispositivo.",
        uploadError: "Errore durante l'invio. Riprova.",
        doneTitle: "Selfie inviato",
        doneDesc: "Lo verificheremo a breve.",
      },
      qr: {
        title: "Continua dal telefono",
        desc: "Inquadra il QR code con il tuo telefono per scattare il selfie dalla fotocamera.",
        done: "Ho completato dal telefono",
      },
    },
    pages: {
      model: {
        verification: {
          title: "Verifica identità",
          description: "Ottieni il badge verificato con un selfie scattato al momento. È facoltativo.",
          approvedTitle: "Profilo verificato",
          approvedDesc: "Il tuo badge verificato è attivo.",
          submittedTitle: "Selfie in revisione",
          submittedDesc: "Stiamo controllando il tuo selfie. Ti avviseremo appena pronto.",
          rejectedTitle: "Verifica non approvata",
          step1: "Inquadra il viso al centro.",
          step2: "Scatta un selfie dal vivo (non dalla galleria).",
          step3: "Invia e attendi la revisione.",
          privacyNote: "Il selfie è usato solo per la verifica e viene eliminato dopo la decisione.",
        },
      },
      admin: {
        modelVerifications: {
          title: "Verifiche modelle",
          requestsToReview: "richieste da revisionare",
          submitted: "Inviata",
          submittedAt: "Inviata",
          noVerifications: "Nessuna verifica in sospeso",
          noVerificationsDesc: "Le richieste di verifica delle modelle appariranno qui.",
        },
      },
      verifySelfie: {
        title: "Verifica identità",
        description: "Scatta un selfie dal vivo per completare la verifica.",
        missingToken: "Link non valido o scaduto. Riapri il QR code dal tuo account.",
        privacyNote: "Il selfie è usato solo per la verifica e viene eliminato dopo la decisione.",
      },
    },
  },
  en: {
    serverErrors: {
      admin: { notFound: "Profile not found" },
      verification: { alreadyVerified: "Your profile is already verified" },
    },
    nav: { modelVerifications: "Model verifications" },
    verification: {
      capture: {
        take: "Capture",
        retake: "Retake",
        confirm: "Confirm and send",
        sending: "Sending…",
        hint: "Center your face with good lighting.",
        noCamera: "Camera not available on this device.",
        uploadError: "Upload failed. Please try again.",
        doneTitle: "Selfie sent",
        doneDesc: "We'll review it shortly.",
      },
      qr: {
        title: "Continue on your phone",
        desc: "Scan the QR code with your phone to take the selfie with its camera.",
        done: "I finished on my phone",
      },
    },
    pages: {
      model: {
        verification: {
          title: "Identity verification",
          description: "Get the verified badge with a live selfie. It's optional.",
          approvedTitle: "Profile verified",
          approvedDesc: "Your verified badge is active.",
          submittedTitle: "Selfie under review",
          submittedDesc: "We're reviewing your selfie. We'll notify you once it's done.",
          rejectedTitle: "Verification not approved",
          step1: "Center your face.",
          step2: "Take a live selfie (not from your gallery).",
          step3: "Submit and wait for review.",
          privacyNote: "The selfie is used only for verification and is deleted after the decision.",
        },
      },
      admin: {
        modelVerifications: {
          title: "Model verifications",
          requestsToReview: "requests to review",
          submitted: "Submitted",
          submittedAt: "Submitted",
          noVerifications: "No pending verifications",
          noVerificationsDesc: "Model verification requests will appear here.",
        },
      },
      verifySelfie: {
        title: "Identity verification",
        description: "Take a live selfie to complete verification.",
        missingToken: "Invalid or expired link. Reopen the QR code from your account.",
        privacyNote: "The selfie is used only for verification and is deleted after the decision.",
      },
    },
  },
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
}

for (const locale of ["it", "en"]) {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  deepMerge(data, additions[locale]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${locale}.json`);
}
