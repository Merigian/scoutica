export default function TermsPage() {
  const sections = [
    {
      h: "Oggetto",
      p: "I presenti Termini disciplinano l'utilizzo della piattaforma Scoutica, che mette in contatto modelli, scout, agenzie e studi fotografici nel mercato italiano della moda.",
    },
    {
      h: "Registrazione",
      p: "L'utilizzo della piattaforma richiede la registrazione di un account. Le informazioni fornite devono essere veritiere, complete e aggiornate. Gli utenti professionali (scout, agenzie, studi) sono soggetti a un processo di verifica.",
    },
    {
      h: "Condotta degli utenti",
      p: "È vietato qualsiasi comportamento illecito, molesto, fraudolento o lesivo della dignità altrui. Scoutica si riserva il diritto di sospendere o rimuovere account che violino queste regole o le normative vigenti.",
    },
    {
      h: "Contenuti pubblicati",
      p: "I modelli mantengono i diritti sulle proprie immagini ma concedono a Scoutica una licenza non esclusiva per visualizzarle sulla piattaforma. Ogni utente è responsabile della liceità dei contenuti caricati.",
    },
    {
      h: "Servizi a pagamento",
      p: "Alcuni piani (Scout Pro, Agency, commissioni Studio) sono a pagamento e gestiti tramite Stripe. I pagamenti sono soggetti ai termini di Stripe e alle nostre condizioni economiche pubblicate sulla pagina Tariffario.",
    },
    {
      h: "Limitazione di responsabilità",
      p: "Scoutica fornisce uno strumento di connessione tra utenti ma non è parte dei contratti tra modelli e committenti. Non garantiamo l'esito di trattative o ingaggi originati dalla piattaforma.",
    },
    {
      h: "Risoluzione",
      p: "Puoi cancellare il tuo account in qualsiasi momento. Scoutica può sospendere il servizio in caso di violazione dei Termini, previa comunicazione quando possibile.",
    },
    {
      h: "Legge applicabile",
      p: "I Termini sono regolati dalla legge italiana. Foro competente esclusivo: Milano.",
    },
  ];

  const lastUpdated = new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8">
      <header className="py-20 lg:py-28 hairline-b">
        <p className="text-eyebrow mb-6">Legal · Terms</p>
        <h1 className="text-h1">Termini di Servizio</h1>
        <p className="mt-6 text-eyebrow text-[var(--ink-3)]">Ultimo aggiornamento · {lastUpdated}</p>
      </header>

      <section className="py-12 hairline-b">
        <p className="text-lead max-w-2xl">
          Benvenuto su Scoutica. Utilizzando la piattaforma accetti integralmente i seguenti Termini di Servizio. Ti invitiamo a leggerli con attenzione: definiscono i tuoi diritti e doveri come utente del nostro servizio.
        </p>
      </section>

      <section>
        {sections.map((s, i) => (
          <article key={i} className="py-10 hairline-b">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
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
