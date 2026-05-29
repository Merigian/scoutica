export default function PrivacyPage() {
  const sections = [
    {
      h: "Titolare del trattamento",
      p: "Scoutica S.r.l., con sede legale in Milano, Italia. Per qualsiasi questione relativa al trattamento dei dati personali è possibile contattare privacy@scoutica.it.",
    },
    {
      h: "Dati raccolti",
      p: "Raccogliamo dati di registrazione (nome, email), dati di profilo (foto, misure, biografia per i modelli; dati professionali per scout e agenzie), dati di utilizzo della piattaforma e dati di pagamento gestiti tramite Stripe.",
    },
    {
      h: "Finalità del trattamento",
      p: "I dati vengono trattati per fornire e migliorare il servizio, gestire la verifica degli utenti professionali, abilitare comunicazioni tra le parti e adempiere agli obblighi di legge.",
    },
    {
      h: "Base giuridica",
      p: "Il trattamento si basa sull'esecuzione del contratto, sul consenso (per comunicazioni di marketing) e sul legittimo interesse del titolare per la sicurezza della piattaforma.",
    },
    {
      h: "Conservazione dei dati",
      p: "I dati vengono conservati per la durata del rapporto contrattuale e per i periodi richiesti dalla normativa fiscale e civile italiana.",
    },
    {
      h: "Diritti dell'interessato",
      p: "Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Scrivi a privacy@scoutica.it per esercitare questi diritti.",
    },
    {
      h: "Cookie",
      p: "Utilizziamo cookie tecnici necessari al funzionamento della piattaforma e, previo consenso, cookie analitici e di terze parti. Puoi gestire le preferenze dalle impostazioni del browser.",
    },
    {
      h: "Trasferimenti internazionali",
      p: "Alcuni fornitori (es. Stripe, AWS) possono trattare dati al di fuori dell'UE con garanzie contrattuali adeguate ai sensi del GDPR.",
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
