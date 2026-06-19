# Scoutica — Descrizione completa e dettagliata del sito

> Documento di riferimento esaustivo: descrive **ogni pagina e ogni sezione** del sito Scoutica, incluse le pagine secondarie (errori, sistema). Aggiornato al design live (tema scuro "Atelier Noir / theme-noir").

---

## 0. Panoramica generale

- **Cos'è**: piattaforma italiana di **scouting professionale per la moda**. Mette in contatto **modelli/e** con **scout, agenzie e brand verificati**, più **studi fotografici prenotabili**.
- **Valore chiave**: ogni operatore (scout/agenzia/brand) passa una **verifica documentale** prima di poter contattare i talenti. Niente DM anonimi.
- **Vincoli**: solo **Italia**, solo **18+**, **bilingue IT/EN** (default IT).
- **Stack**: Next.js 16 (App Router, Turbopack), React, TypeScript, Tailwind v4 (CSS-first), Prisma + PostgreSQL (Neon), NextAuth v5 (JWT), next-intl, Stripe, Cloudflare R2 (immagini), Upstash Redis, Mapbox (mappa studios), Resend (email), Turnstile (anti-bot).
- **4 ruoli**: `MODEL`, `SCOUT` (sottotipi SCOUT/AGENCY/BRAND), `STUDIO`, `ADMIN`.

---

## 1. Identità visiva / Design system

- **Tema live**: `theme-noir` (hardcoded in `layout.tsx`) — sfondo **ossidiana #0A0A0B**, testo **bianco puro #FFFFFF**.
  - `--bg #0A0A0B`, `--bg-soft #131316`, `--bg-elevated #1B1B1F`
  - `--ink #FFFFFF`, `--ink-2 #B7B7BB`, `--ink-3 #8B8B90`
  - Righe sottili (hairline) `rgba(255,255,255,.12)`, spigoli vivi (radius 0), nessuna ombra, **monocromatico** (nessun accento cromatico).
- **Font**: display **Bodoni Moda** (Didone, alto contrasto, pesi leggeri, corsivo per eyebrow); body **Archivo**; nav/label/bottoni/nomi **Poppins** UPPERCASE con tracking ampio. (Fraunces/Inter Tight caricati ma non live.)
- **Logo**: monogramma geometrico a "S" intrecciata + wordmark "Scoutica" in Bodoni. Asset bianco `/images/logo-finale-256.png`, scuro `/images/logo-finale-dark-256.png`.
- **Utility tipografiche**: `.text-mega/.text-display/.text-h1/.text-h2/.text-h3/.text-lead/.text-eyebrow (corsivo)/.text-meta/.text-agency`, `.hairline*`.
- **Tono**: editoriale, minimale, sobrio, lusso (registro Saint Laurent / Vogue). NIENTE estetica "rivista/libro" (no sommari, numeri di sezione, date edizione).
- **PWA**: installabile (manifest, standalone, theme-color #0A0A0B, icone 192/512).

---

## 2. Navigazione globale

### 2.1 Marketing Nav (`MarketingNav`)
Header fisso, trasparente che si scurisce allo scroll. Layout: link a sinistra, logo al centro, azioni a destra.
- **Link**: PRICING · ABOUT · CONTACT · STUDIOS (uppercase, tracking).
- **Centro**: monogramma + wordmark "Scoutica".
- **Destra**: switch lingua IT/EN, ThemeToggle, e — se loggato — bottone "Dashboard"; altrimenti "Login" + "Register".
- **Mobile**: logo a sinistra + hamburger a destra; menu a tendina con i link + login/register + lingua/tema.

### 2.2 Marketing Footer (`MarketingFooter`)
- **Finale brand**: gigantesco wordmark **SCOUTICA** in Bodoni accanto al monogramma + tagline.
- **3 colonne**: Product (Pricing, Studios, Register) · Company (About, FAQ/Safety, Contact) · Legal (Privacy, Terms).
- **Riga finale**: "© {anno} Scoutica, Milano" + "tutti i diritti riservati".

### 2.3 Dashboard Shell (area autenticata)
- **Sidebar** (`sidebar.tsx`): fissa a sinistra, pinnabile (248px aperta / 68px collassata, si espande all'hover). Avatar+nome+email in fondo, pin, switch lingua, logout, tema. Voci da `NAV_ITEMS[role]`.
- **Header** (`header.tsx`): sticky in alto. Hamburger mobile, logo (mobile), campanella notifiche, switch lingua, tema.
- **Mobile bottom nav** (`mobile-bottom-nav.tsx`): barra inferiore stile app (lg:hidden), 4-5 tab per ruolo + tab Avatar. **Non mostrata per ADMIN**.
- **Mobile menu** (`mobile-menu.tsx`): drawer laterale sinistro con tutte le voci di nav + tema/lingua/logout.
- **/dashboard**: pagina di solo **redirect** in base al ruolo → MODEL `/model/home`, SCOUT `/scout/home`, STUDIO `/studio/studios`, ADMIN `/admin`.

---

## 3. LANDING PAGE — `(marketing)/page.tsx`

Pagina home pubblica. Tema scuro. Sezioni in ordine:

### 3.1 Nav
(vedi 2.1) — fissa in cima.

### 3.2 HERO — `CinematicHero`
- Foto editoriale **a tutto schermo** di una modella (parallax: l'immagine scorre/scala, il contenuto si solleva e svanisce).
- In basso a sinistra: **2 CTA** — "Sono un modello/a" (scuro pieno) + "Sono uno scout/agenzia" (chiaro) → `/register/model` e `/register/scout`.
- In basso al centro (solo desktop): indicatore di scroll "EXPLORE ↓".
- Altezza `min-h-100svh`, sfondo ossidiana.

### 3.3 STATEMENT — "cos'è Scoutica"
- Eyebrow corsivo "Professional scouting".
- Headline enorme in Bodoni: *"Nuovi volti per la moda italiana. Selezionati con cura, presentati con metodo."* (split in due frasi, seconda in corsivo grigio).
- Sottotitolo esplicativo. Su sfondo `--bg`.

### 3.4 "PER CHI È" / Audience Router — `AudienceRouter` (01)
- Eyebrow + titolo + sottotitolo.
- **3 card** (Modelli / Scout & agenzie / Studi): icona, label corsivo, titolo, descrizione, link "Scopri →" verso `/register/model`, `/register/scout`, `/register/studio`. Hover che solleva la card.

### 3.5 CAST / Featured Profiles — `FeaturedProfiles` (02)
- Eyebrow "Cast" + titolo "Volti in evidenza" + sottotitolo + CTA "Iscriviti per vedere ogni profilo".
- **Marquee orizzontale** di **card modelle reali** (`ModelCard`, fino a 12, formato ritratto, 260–340px): foto volto a pieno, NOME (uppercase) + età, città · altezza, tag categoria, badge "Verificata"/"Featured" se presenti, frecce/swipe foto.
- Riga finale: "N selezionati" + link "vedi tutti".

### 3.6 VERIFICA / Trust — `TrustSection` (03)
- Eyebrow "Verification" + headline "Ogni contatto passa una verifica" + sottotitolo + frase di contesto di mercato.
- **3 pilastri**: Verifica documentale · Trasparenza e protezione · Solo professionisti (icona, titolo, descrizione, dettaglio es. "Revisione umana in 24–48h"). Su `--bg-soft`.

### 3.7 BANDI / Sample Openings — `BandiSection` (04)
- Eyebrow "Preview" + titolo + sottotitolo. (Dati di esempio illustrativi.)
- **3 card casting** (editorial/job/casting): tipo, pallino di stato **OPEN (verde) / CLOSING SOON (arancio)**, titolo, "scout · città", descrizione, **compenso € grande**, periodo riprese, scadenza (giorni), CTA "Iscriviti per vedere". Scroll orizzontale su mobile.

### 3.8 MANIFESTO / Quote — `EditorialQuote`
- Pull-quote centrato grande in corsivo Bodoni + eyebrow "Manifesto" + attribuzione "Scoutica · Italy".

### 3.9 STUDI / Studios Showcase — `StudiosShowcase` (05)
- Eyebrow "Studios" + titolo "Studi fotografici, su prenotazione" + sottotitolo + link "Sfoglia studi".
- **3 card studio reali** (cover, nome, città, "da €X / ora") + invito "Aggiungi il tuo studio". Empty-state se nessuno pubblicato.

### 3.10 MANIFESTO + NUMERI (06)
- Headline (`cta.title`) + lead pricing teaser.
- **4 numeri** enormi (Bodoni, count-up): volti pubblicati · scout accreditati · 20 regioni italiane · 50 studi partner. Su `--bg-soft`.

### 3.11 METODO / Method (07)
- Eyebrow "Method" + titolo "Come funziona" + sottotitolo.
- **3 step**: 01 Crea il profilo · 02 Fatti scoprire · 03 Lavorate insieme (numero + titolo + descrizione).

### 3.12 CHIUSURA / Coda
- **Banda invertita** (sfondo bianco/`--ink`, testo ossidiana/`--bg`): headline "Lo scouting italiano cambia indirizzo." + sottotitolo + CTA "Entra in Scoutica" (→ `/register`) + link "Vedi i piani".
- **Card prezzi**: "Per modelli €0 / sempre gratis" e "Per scout & agenzie da €29 /mese".
- Riga masthead: "Scoutica · Italy" + "Nuovi volti per la moda italiana".

### 3.13 Footer
(vedi 2.2) — finale con logo gigante.

---

## 4. Altre pagine Marketing

### 4.1 PRICING — `(marketing)/pricing/page.tsx`
- **Header**: eyebrow + titolo (RevealText) + sottotitolo.
- **Piani interattivi** (`PricingPlans`): toggle mensile/annuale + griglia piani.
  - **FREE €0** (modelli, e assaggio per scout/studi): 12 foto, video, PDF book; 5 contatti/mese (3/giorno); 1 board, 50 elementi/board; no filtri avanzati, no ricerche salvate.
  - **Scout Pro €29/mese** (€290/anno): tutto illimitato + filtri avanzati + ricerche salvate + supporto prioritario. Trial 14 giorni.
  - **Agency €99/mese** (€990/anno).
  - **Studio €49/mese** (€490/anno).
- **Matrice di confronto**: tabella feature × (Scout Pro / Agency / Studio) con ✓ / — / "presto". Scroll orizzontale su mobile.
- **Take-rate / Transazionale**: card con tariffe per tipo di transazione + nota.
- **Footer note**: teaser + CTA "Scopri di più" → /about.
- **One-off**: Boost profilo **€4.99 / 7 giorni** (max 4 cumulati); Casting promosso **€49 / 14 giorni**.

### 4.2 ABOUT — `(marketing)/about/page.tsx`
- **Masthead**: eyebrow + titolo (RevealText) + lead.
- **Banda immagine editoriale** (21:9, ImageReveal).
- **Manifesto**: intro1 (HTML) + intro2.
- **Perché adesso**: eyebrow + titolo + corpo.
- **Valori** (4, griglia 2 col): Sicurezza · Professionalità · Qualità · Italia prima.
- **Principi** (lista numerata): titolo + descrizione per ciascuno.
- **Closing CTA**: eyebrow + titolo + corpo + 2 bottoni (Registrati / Vedi i piani). Su `--bg-soft`.

### 4.3 STUDIOS (directory) — `(marketing)/studios/page.tsx`
- Elenco studi pubblicati con **filtri** (regione/città/tipo) + toggle **Griglia / Mappa**.
- **Mappa Mapbox** bloccata sull'Italia (bounds Italia, marker per studio Milano→Napoli).
- Card studio: cover, nome, città, tariffa oraria.

### 4.4 STUDIO DETAIL — `(marketing)/studios/[slug]/page.tsx`
- Pagina pubblica del singolo studio: gallery foto, descrizione, tipo, indirizzo/mappa, dotazioni (amenities), tariffe (oraria/giornaliera/settimanale), min ore, contatti, CTA prenotazione/inquiry.

### 4.5 CONTACT — `(marketing)/contact`
- Pagina contatti (form/recapiti). Link in nav e footer.

### 4.6 SAFETY / FAQ — `(marketing)/safety`
- FAQ + policy sicurezza, **politica 18+** (minori bloccati alla registrazione). Link "FAQ" nel footer.

---

## 5. Autenticazione — gruppo `(auth)`

Layout dedicato (`(auth)/layout.tsx`): colonna centrata, logo in alto, copyright "© {anno} Scoutica · Milano".

### 5.1 LOGIN — `(auth)/login/page.tsx`
- Eyebrow "Sign in" + titolo "Accedi a Scoutica" + sottotitolo.
- Campi: **Email**, **Password** (con toggle mostra/nascondi), link "Password dimenticata?".
- Bottone "Accedi".
- Divider "oppure continua con" + **bottone Google** (`signIn("google")` → `/dashboard`).
- Link "Non hai un account? Registrati".

### 5.2 REGISTER (role picker) — `(auth)/register/page.tsx`
- Eyebrow + titolo + sottotitolo + "Scegli il ruolo".
- **3 scelte** (riga cliccabile con icona): Modello (Camera) · Scout/Agenzia (Briefcase) · Studio (Building2), ognuna con descrizione → porta al form dedicato.
- Link "Hai già un account? Accedi". *(NB: nessun bottone Google qui — solo sul login.)*

### 5.3 REGISTER MODEL — `(auth)/register/model`
- Campi: email, password, **data di nascita** (controllo **18+**), **conferma età**, **accettazione termini** → auto sign-in → `/verify-email`.

### 5.4 REGISTER SCOUT — `(auth)/register/scout`
- Campi: **sottotipo** (SCOUT / AGENCY / BRAND), email, password, accettazione termini → auto sign-in → `/verify-email`.

### 5.5 REGISTER STUDIO — `(auth)/register/studio`
- Campi: **ragione sociale**, nome, cognome, email, password, conferma password → auto sign-in → `/studio/studios`.

### 5.6 FORGOT PASSWORD — `(auth)/forgot-password`
- Form per reset password via email.

### 5.7 VERIFY EMAIL — `(auth)/verify-email`
- Pagina di verifica email (gli utenti non verificati vengono reindirizzati qui).

### 5.8 Google OAuth
- "Continua con Google" (solo su login). Email verificate da Google → **auto-link** ad account esistente con stessa email (`allowDangerousEmailAccountLinking`). Nuovo utente Google → creato come **MODEL** (default), piano FREE.

### 5.9 `verify-selfie` (pubblica)
- Pagina pubblica per verifica selfie live via QR (token monouso, 30 min).

---

## 6. DASHBOARD MODELLO — `(dashboard)/model/*`

Layout modello: se profilo INCOMPLETO mostra banner di completamento. Bottom nav: Home / Scopri / Casting / Messaggi / Avatar.

- **Home** `/model/home`: saluto col nome; **4 metriche** (Visite settimana + trend, Foto nel portfolio, Richieste in sospeso, Candidature attive); sezione **Opportunità** (casting + lavori consigliati per città/regione); sidebar **Attività recente** (ultime 8 notifiche) + azioni rapide; checklist onboarding se non pubblicato; BoostCard se pubblicato.
- **Profilo** `/model/profile`: editor profilo (nome, bio, città/regione, misure: altezza/bust/vita/fianchi/scarpe/taglia, occhi, capelli, etnia, categorie, status professionale, lingue, disponibilità viaggio, social, video, book PDF).
- **Portfolio** `/model/portfolio`: gestione foto (upload con barra progresso, crop, cover, elimina; max 12 nel FREE; processate in WEBP via sharp).
- **Scopri** `/model/discover`: esplora altre modelle (griglia `ModelCard`, filtri, no salvataggio, self-exclusion).
- **Casting** `/model/castings` + dettaglio `/model/castings/[id]`: lista bandi + dettaglio con candidatura.
- **Candidature** `/model/applications`: stato candidature a casting/lavori.
- **Contatti** `/model/contacts`: richieste di contatto ricevute.
- **Messaggi** `/model/messages` + thread `/model/messages/[conversationId]`: chat (lista + thread; bottom nav nascosta in chat aperta su mobile).
- **Notifiche** `/model/notifications`.
- **Lavori** `/model/lavori` + dettaglio `/model/lavori/[id]`.
- **Impostazioni** `/model/settings` + **Billing** `/model/settings/billing`.
- **Verifica** `/model/verification`: verifica identità via **selfie live** (camera, no upload galleria; QR fallback). Badge "Verificata" se APPROVED.
- **Account** `/model/account`: schermata profilo (stile Instagram con griglia portfolio).

---

## 7. DASHBOARD SCOUT / AGENZIA — `(dashboard)/scout/*`

Accesso read-only finché non APPROVED (banner). Bottom nav: Home / Talenti / +NuovoCasting / Messaggi / Avatar.

- **Home** `/scout/home`: saluto (business name) + badge (sottotipo, piano, città) + CTA (Cerca modelli, Nuovo casting); **4 metriche** (casting attivi, lavori attivi, candidature in sospeso, contatti accettati) + stat secondarie (board, contatti in sospeso); **Candidature recenti** (8) + **Attività** (6); azioni rapide (Scopri talenti, Crea casting, Crea lavoro, Vedi board).
- **Profilo** `/scout/profile`.
- **Verifica** `/scout/verification`: form verifica documentale operatore.
- **Scopri talenti** `/scout/discover`: ricerca modelle (griglia `ModelCard`, salvataggio/board, contatto; filtri avanzati gated al piano).
- **Casting** `/scout/castings` + **Nuovo** `/scout/castings/new` + **Candidature** `/scout/castings/[id]/applications`.
- **Lavori** `/scout/lavori` + **Nuovo** `/scout/lavori/new` + **Candidature** `/scout/lavori/[id]/applications`.
- **Contatti** `/scout/contacts`.
- **Messaggi** `/scout/messages` + thread `[conversationId]`.
- **Notifiche** `/scout/notifications`.
- **Board (shortlist)** `/scout/boards` + dettaglio `/scout/boards/[boardId]`.
- **Impostazioni** `/scout/settings` + **Billing** `/scout/settings/billing`.
- **Gate FREE**: 5 contatti/mese (3/giorno), 1 board (50 elementi), no filtri avanzati/ricerche salvate. PrivateNote + SavedSearch (piano-gated).

---

## 8. DASHBOARD STUDIO — `(dashboard)/studio/*`

Bottom nav: Home / Prenotazioni / +NuovoStudio / Messaggi / Avatar.

- **Home** `/studio/home`: dashboard studio (metriche/sintesi). (Punto d'ingresso storico: `/studio/studios`.)
- **I miei studi** `/studio/studios` + **Nuovo** `/studio/studios/new` + **Editor** `/studio/studios/[id]`: gestione studi (foto, descrizione, tipo, indirizzo/geo, dotazioni, tariffe oraria/giornaliera/settimanale, min ore, disponibilità, contatti, pubblicazione).
- **Prenotazioni** `/studio/bookings`.
- **Richieste** `/studio/inquiries`.
- **Messaggi** `/studio/messages`.
- **Notifiche** `/studio/notifications`.
- **Impostazioni** `/studio/settings`.

---

## 9. DASHBOARD ADMIN — `(dashboard)/admin/*`

Nessuna bottom nav (solo drawer/sidebar).

- **Dashboard** `/admin`: 7 card statistiche (Utenti totali, Modelli, Scout/Agenzie, Verifiche in sospeso, Segnalazioni in sospeso, Casting attivi, Abbonamenti attivi), alcune cliccabili.
- **Utenti** `/admin/users`: gestione utenti.
- **Abbonamenti** `/admin/subscriptions`.
- **Verifiche operatori** `/admin/verifications`.
- **Verifiche modelle** `/admin/model-verifications`: revisione selfie (approva/rifiuta; selfie eliminato dopo per privacy).
- **Casting** `/admin/castings`: moderazione.
- **Segnalazioni** `/admin/reports`.
- **Impostazioni** `/admin/settings`.

---

## 10. Profilo pubblico modella

- **`/profile/[slug]`** (e short URL **`/m/[slug]`** → redirect): pagina pubblica del profilo: carosello foto, nome, età, città/regione, misure, categorie, status, social, badge **Verificata** / **Featured** (boost), CTA **contatto** (per scout verificati), PrivateNote (nota privata scout), gating per profili "solo scout verificati".

---

## 11. Pagine di sistema

- **404 Not Found** `(locale)/not-found.tsx`: enorme "404" in Bodoni, titolo + descrizione, bottoni "Torna alla home" + "Browse Studios", footer con logo "Scoutica · Milano".
- **500 Error** `(locale)/error.tsx`: enorme "500", eyebrow "Error · 500 · Server", titolo + descrizione, bottoni "Riprova" (reset) + "Torna alla home", footer "Scoutica · Milano".
- **Manifest PWA** `app/manifest.ts`: standalone, theme/bg #0A0A0B, icone, start_url "/".
- **robots** `app/robots.ts` + **sitemap** `app/sitemap.ts`.
- **API**: `/api/auth/[...nextauth]`, `/api/portfolio/{upload,cover,delete}`, `/api/studio/upload`, `/api/settings`, `/api/webhooks/stripe`.

---

## 12. Modello prezzi (sintesi)

| Piano | Prezzo | Per chi | Note |
|---|---|---|---|
| FREE | €0 | Modelli (sempre) + assaggio scout/studi | 12 foto, video, PDF; 5 contatti/mese; 1 board |
| Scout Pro | €29/mese (€290/anno) | Scout | Tutto illimitato + filtri avanzati + ricerche salvate |
| Agency | €99/mese (€990/anno) | Agenzie/Brand | come sopra |
| Studio | €49/mese (€490/anno) | Studi | come sopra |
| Boost | €4.99 / 7gg (max 4) | Modelli | Priorità in discovery |
| Promoted casting | €49 / 14gg | Scout | Casting in evidenza |

- **Modelli gratis per sempre** (MODEL_PRO è legacy, nessun checkout). Trial 14 giorni sui piani a pagamento.
- **Gate FREE che "mordono"** (scout/studi): contatti 5/mese, 3/giorno; max 1 board, 50 elementi; filtri avanzati e ricerche salvate OFF.

---

## 13. Ruoli, accesso, sicurezza

- **Protezione rotte** (`auth.config.ts`): rotte dashboard richiedono login; email non verificata → `/verify-email`; controllo ruolo per `/model`, `/scout`, `/studio`, `/admin`.
- **Scout non verificati**: navigano in **sola lettura** (vedono profili, salvano preferiti); bloccati su contatto/casting/lavori/messaggi finché non APPROVED.
- **18+ obbligatorio**: minori bloccati alla registrazione.
- **i18n**: IT (default) / EN, tutte le rotte sotto `[locale]`.
- **SEO/PWA**: metadata OG/Twitter, sitemap, robots, installabile.

---

*Fine documento. Copre: landing (tutte le sezioni), marketing (pricing/about/studios/contact/safety), autenticazione, le 4 dashboard (modello/scout/studio/admin) con tutte le sotto-pagine, profilo pubblico, pagine di sistema (404/500), prezzi, ruoli e sicurezza.*
