export default function PrivacyPage() {
  const sections = [
    {
      h: "Titolare del trattamento",
      p: "Scoutica S.r.l., con sede legale in Milano, Italia. Per qualsiasi questione relativa al trattamento dei dati personali è possibile contattare privacy@scoutica.it.",
    },
    {
      h: "Dati raccolti",
      p: "Raccogliamo dati di registrazione (nome, email, password cifrata), dati di profilo (foto, misure, biografia per i modelli; dati professionali per scout e agenzie), dati di utilizzo della piattaforma (visualizzazioni, ricerche, messaggi) e dati di pagamento gestiti da Stripe (noi non memorizziamo dati di carta).",
    },
    {
      h: "Finalità del trattamento",
      p: "I dati vengono trattati per fornire e migliorare il servizio, gestire la verifica degli utenti professionali, abilitare comunicazioni tra le parti, prevenire abusi e adempiere agli obblighi di legge.",
    },
    {
      h: "Base giuridica",
      p: "Il trattamento si basa sull'esecuzione del contratto, sul consenso (per comunicazioni di marketing) e sul legittimo interesse del titolare per la sicurezza della piattaforma.",
    },
    {
      h: "Conservazione dei dati",
      p: "I dati vengono conservati per la durata del rapporto contrattuale e per i periodi richiesti dalla normativa fiscale e civile italiana. In caso di cancellazione dell'account, i dati personali sono rimossi entro 30 giorni; i dati anonimizzati possono essere conservati per finalità statistiche.",
    },
    {
      h: "Diritti dell'interessato",
      p: "Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Puoi richiedere l'esportazione dei tuoi dati o la cancellazione dell'account scrivendo a privacy@scoutica.it.",
    },
    {
      h: "Cookie",
      p: "Utilizziamo cookie tecnici necessari al funzionamento della piattaforma (autenticazione, preferenze) e, previo consenso, cookie analitici aggregati. Puoi gestire le preferenze dal banner cookie o dalle impostazioni del browser.",
    },
    {
      h: "Sicurezza",
      p: "Le password sono cifrate con bcrypt. Le connessioni avvengono via HTTPS/TLS 1.2+. Gli accessi di terze parti (scout, agenzie) sono soggetti a verifica documentale manuale. Anomalie e segnalazioni sono gestite da un team di moderazione.",
    },
    {
      h: "Fornitori terzi (responsabili del trattamento)",
      p: "Hosting applicazione: Vercel Inc. (USA) — Standard Contractual Clauses UE. Database: Neon, Inc. (USA, region EU-West). Storage immagini: Cloudflare R2 (EU). Pagamenti: Stripe Payments Europe Ltd. (Irlanda). Email transazionali: Resend, Inc. (USA). Mappe: Mapbox Inc. (USA). Tutti i fornitori dispongono di DPA conformi al GDPR.",
    },
    {
      h: "Trasferimenti internazionali",
      p: "Alcuni fornitori (Vercel, Stripe, Resend, Mapbox) possono trattare dati al di fuori dell'UE con garanzie contrattuali adeguate (Standard Contractual Clauses) ai sensi del Capo V del GDPR.",
    },
    {
      h: "Minori",
      p: "Scoutica non accetta utenti di età inferiore ai 18 anni. La data di nascita è obbligatoria in fase di registrazione come modello e viene bloccata una volta inserita. Eventuali profili di minori segnalati vengono rimossi immediatamente.",
    },
  ];

  const lastUpdated = new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <header className="py-20 lg:py-28 hairline-b">
        <p className="text-eyebrow mb-6">Legal · Privacy</p>
        <h1 className="text-h1">Privacy Policy</h1>
        <p className="mt-6 text-eyebrow text-[var(--ink-3)]">Ultimo aggiornamento · {lastUpdated}</p>
      </header>

      <section className="py-12 hairline-b">
        <p className="text-lead max-w-2xl">
          Scoutica rispetta la tua privacy. Questo documento descrive in modo trasparente quali dati raccogliamo, perché li raccogliamo e come puoi esercitare i tuoi diritti ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
        </p>
      </section>

      <section>
        {sections.map((s, i) => (
          <article key={i} className="py-10 hairline-b">
            <div className="flex gap-8">
              <span className="font-[var(--font-body)] text-[var(--ink-3)] text-sm tabular-nums shrink-0 w-10 pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-h3 mb-4">{s.h}</h2>
                <p className="text-body text-[var(--ink-2)] max-w-2xl">{s.p}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="py-12 text-center">
        <p className="text-eyebrow text-[var(--ink-3)]">Scoutica S.r.l. · Milano</p>
      </footer>
    </div>
  );
}
