# Scoutica — Master Redesign Brief for Google Stitch

> **What this document is.** A complete, copy-paste-ready brief for [stitch.withgoogle.com](https://stitch.withgoogle.com/) to redesign **all** of Scoutica from scratch: layout, palette, fonts, UX, components and every single screen (including error pages, empty states, identity verification, etc.). Instructions to Stitch are **in English** (Stitch performs best in English), while the UI microcopy stays **in Italian** (the product is Italian-first, bilingual IT/EN).

---

## How Stitch works and how to use this brief

**What Stitch is (in short).** A Google Labs experiment powered by Gemini 2.5 Pro. It turns **natural-language prompts** and **images/wireframes** into high-fidelity UI + front-end code. It can: generate screens from a description, accept reference images to steer the mood, generate **variants**, iterate via chat ("make the header smaller", "change the palette"), and **paste to Figma** or export code.

**Model to use → Stitch `3.1 Pro` (NOT Flash).** Always select **3.1 Pro**, the highest-quality model, even for repetitive screens. Here **consistency** across screens matters more than saving generations: Flash tends to drift on palette/fonts from one screen to the next.

**Recommended strategy:**
1. **Paste PART 1 + PART 2 first** (master brief + creative mandate). Let Stitch propose **the design system** (palette, type, grid, motion) by generating the `A1 — Design System & UI Kit` screen first. This "locks in" the theme.
2. From then on, for each screen write: *"Using the exact same design system, fonts, palette and components, design the following screen: …"* and paste the PART 4 block.
3. Generate **one screen at a time** with `3.1 Pro`, starting with the key screens (A1 design system → H1 public profile → B1 landing → the 4 role homes) and then all the rest.
4. **Upload 2–3 reference images** at the start (see PART 2 → Moodboard) to orient the taste.
5. **After EACH completed screen, take a screenshot** and compare it against the locked design system: palette, fonts, spacing, navigation and components must be **identical**. Fix any drift immediately before moving to the next screen.
6. Iterate with micro-commands in chat, then **Paste to Figma** to assemble everything.

**A note on creative freedom.** As requested, Stitch has a **full mandate** over colors, fonts and style: **it** must propose the best strategy. This brief does NOT impose the current palette or fonts. It only provides: (a) the brand's **soul**, (b) **non-aesthetic functional constraints** (bilingual, light+dark, photography-first, 4 roles, trust/safety, accessibility, responsive). The current system is mentioned once as optional context, free to **ignore completely**.

---

# PART 1 — MASTER PROMPT (paste this first)

```text
You are designing a complete, world-class product redesign for SCOUTICA — an Italian fashion-talent marketplace and SaaS web app. I want an awwwards-worthy, editorial, premium result. You have FULL creative freedom over palette, typography, layout system, motion and overall art direction: propose the strongest strategy yourself. Do not feel bound by any existing styling.

WHAT SCOUTICA IS
A two-sided marketplace + SaaS that connects Italian fashion faces with the people who hire them, plus the spaces they shoot in. Four user roles, each with its own dashboard:
- MODEL (talent): builds a verified portfolio, gets discovered, applies to castings/jobs. Free forever.
- SCOUT / AGENCY / BRAND (demand side): searches talent, builds shortlists ("boards"), posts castings & jobs, contacts models. Paid plans.
- STUDIO (photo studios / locations): lists shootable spaces, receives bookings and inquiries. Paid plan.
- ADMIN: platform operations — moderation, verifications, reports, subscriptions.

CORE VALUES THAT MUST BE FELT IN THE DESIGN
- "Made in Italy", editorial sophistication (think a contemporary art book meets a precise software tool).
- TRUST & SAFETY first: human identity verification, 18+ only, anti-abuse. Verification badges matter.
- PHOTOGRAPHY IS THE PRODUCT: portfolios, faces and spaces are the hero content. The UI must frame imagery like a gallery, never compete with it.
- Premium but human, calm, confident, uncluttered. Less chrome, more content.

HARD FUNCTIONAL CONSTRAINTS (non-aesthetic — always respect)
1. Bilingual IT/EN. Primary language is ITALIAN — all sample copy in Italian (I provide real microcopy per screen). Keep room for longer Italian strings.
2. Full LIGHT and DARK themes, both first-class (not an afterthought).
3. Fully responsive: design desktop AND mobile for key screens. App uses a left sidebar on desktop and a bottom tab bar on mobile for dashboards.
4. Accessible: WCAG AA contrast, visible focus states, large tap targets, legible type.
5. A reusable design system: consistent buttons, inputs, cards, badges, tabs, modals, empty states, skeletons/loading, toasts.
6. Strong empty states and error states everywhere (this matters to me — include them).

DELIVERABLE STYLE
High-fidelity screens with real Italian content, real photography placeholders (editorial fashion portraits & studio interiors), and a coherent component system shared across every screen. Avoid generic dashboard-template look. Aim for a distinctive, memorable art direction.

I will now ask you to (1) propose the design system, then (2) design each screen one at a time, all sharing that system. Acknowledge and start with the DESIGN SYSTEM when I send it.
```

> *(Optional context — only tell Stitch this if you want it to start from a base, otherwise omit.)* The current system is called "Galleria": editorial serif (Fraunces) + grotesque (Inter Tight), zero border-radius, 1px hairline borders, quiet editorial look. **Stitch is free to keep, evolve or fully replace it.**

---

# PART 2 — CREATIVE MANDATE (the "revolution")

Paste this right after Part 1, or use it as a second message.

```text
ART DIRECTION MANDATE — surprise me, but stay coherent.

Emotional target: walking into a Milan gallery opening — quiet luxury, confidence, human warmth, zero noise. The reader should feel "this is where serious Italian fashion talent lives."

Explore (your choice, pick ONE strong direction and commit):
- A distinctive type system: pair an expressive display face with a precise text face. Big, art-directed headlines.
- A confident color strategy that flatters photography. It can be warm-neutral editorial, high-contrast monochrome, or a bold single-accent system — your call. It MUST work in both light and dark.
- A clear grid and layout rhythm (editorial columns, generous whitespace, intentional asymmetry).
- Tasteful motion: reveals, image parallax, hover micro-interactions. Subtle, never gimmicky.
- The LOGO is FIXED — do not invent one. Scoutica already has an official brand mark (an angular, interlocking geometric monogram — a stylized "S" on a 45° diagonal, rhombus silhouette, thin uniform strokes, Greek-key feel, fully monochrome). Reproduce it faithfully (see the "BRAND ASSET — LOGO" section below + the uploaded reference image). You MAY still choose the TYPOGRAPHY of the "Scoutica" wordmark that locks up beside it. The mark is used for favicon, collapsed sidebar, avatars and badges.

AVOID: generic SaaS gradients, bubbly rounded cards everywhere, stocky illustrations, neon, cluttered dashboards, drop-shadow soup. Avoid anything that looks like a default UI kit.

PRINCIPLES: content over chrome; photography framed like a gallery; hairlines and type doing the work instead of heavy boxes; one confident accent rather than many colors.

Give imagery direction too: where full-bleed editorial photos go, where portrait grids go, where the UI stays quiet to let faces speak.
```

**Moodboard to upload to Stitch (reference images):**
- **The official logo** `public/images/logo-finale-dark.png` (the mark to reproduce faithfully — see below).
- The current cover `public/images/hero-cover.webp` (for the photographic subject/mood).
- 1 screenshot of an awwwards fashion/editorial site you like (for taste).
- 1 photo-studio interior (for the Studio side).

---

## SCOUTICA LOGO — fixed brand asset (do NOT redesign)

The logo is **not** part of the creative freedom: it already exists and must be kept. It is a **geometric monogram** — a stylized "S", angular and interlocking, rotated 45° with a tall **rhombus** (diamond) silhouette; thin, uniform-width strokes, only 90°/45° angles (a "Greek-key"/labyrinth feel), no curves, **monochrome** (solid ink on light backgrounds, white on dark). Stitch stays free **only** over the typography of the "Scoutica" wordmark that locks up beside it.

<img src="public/images/logo-finale-dark.png" alt="Scoutica — monogram (official mark)" width="140" />

**Assets already in the repo** (`public/images/`):
- `logo-finale-dark.png` — **black** mark, for light backgrounds (sizes `-32 / -64 / -128 / -256 / -512`).
- `logo-finale.png` — **white** mark, for dark backgrounds (same sizes `-32 … -512`).
- Usage: favicon, collapsed sidebar, avatar placeholder, badges. Lockup = mark + "Scoutica" wordmark (gap ~10px, optically centered); mark-only where space is tight.

> To paste into Stitch:
```text
BRAND LOGO IS FIXED — do not invent a new one. Scoutica's mark is an angular, interlocking geometric monogram: a stylized "S" rotated 45° with a tall rhombus (diamond) silhouette, built only from thin, uniform-width straight strokes meeting at 90°/45° angles (Greek-key / labyrinth feel), no curves, no fills, fully monochrome. Reproduce it faithfully as a crisp inline SVG that inherits currentColor: solid ink (the theme's primary text color) on light surfaces, pure white on dark surfaces — it MUST invert cleanly with the theme. I am uploading the official mark as a reference image; match its proportions and stroke exactly. Use it for: favicon, collapsed sidebar, avatar placeholder, brand/"Verificato" badges, and as a lockup (mark + "Scoutica" wordmark) in the marketing navbar, footer and auth pages. You may choose ONLY the wordmark typography that pairs with the mark.
```

---

# PART 3 — ARCHITECTURE & REASONING (what to show, where, why)

This is the "let's reason together" part: my information-architecture recommendations, to pass to Stitch as guidance (already referenced in the Part 4 prompts).

## Product map (sitemap)
- **Public / Marketing:** Landing · About · Pricing · Studios (directory) · Studio (detail) · Public model profile (`/profile/[slug]`, shareable, OG/social optimized).
- **Auth:** Login · Register (role picker) · Register Model/Scout/Studio · Forgot password · Verify email · Verify selfie (identity, public via token).
- **Model dashboard:** Home · Profile (editor) · Portfolio · Discover · Castings (+detail) · Jobs (+detail) · Applications · Contacts · Messages (+thread) · Notifications · Settings · Subscription.
- **Scout/Agency/Brand dashboard:** Home · Profile · Verification · Discover (talent search) · Castings (+new, +applications) · Jobs (+new, +applications) · Boards (+detail) · Contacts · Messages · Notifications · Settings · Subscription.
- **Studio dashboard:** Home (NEW — see below) · Studios (list, +new, +editor) · Bookings · Inquiries · Messages · Notifications · Settings.
- **Admin:** Dashboard · Users · Scout verifications · Model verifications (selfie) · Castings (moderation) · Reports · Subscriptions · Settings.
- **System:** 404 · 500 · empty states · skeleton/loading.

## Landing — recommended section order
1. **Immersive full-bleed hero cover.** Full-page editorial photo, a quiet top brand row (left "Scoutica · Italia" in uppercase letter-spacing, right "Milano · Roma · Firenze" — no issue number, no date), display headline, subtitle, **dual CTA** ("Sono un modello" / "Sono uno scout o un'agenzia"). The photo is the background, text and buttons on top, dark scrim for legibility. *(This is the direction already chosen: keep and elevate it.)*
2. **Trust strip / numbers.** Published models · Verified scouts · 20 regions · Partner studios. Social proof early, just below the fold.
3. **Cast — featured talent.** Editorial grid/marquee of real model cards (photos are the product). For logged-out users: "Register to see the rest" teaser.
4. **Three paths.** 3 large cards with editorial photos: *Model* (portrait), *Scout/Agency/Brand* (casting backstage), *Studio* (space interior). Each with a dedicated CTA.
5. **Method (how it works).** 3 steps, emphasizing **identity verification & safety** (it's the differentiator: say it loud).
6. **Open calls — opportunity preview.** 3 "live" casting/job cards to prove the marketplace is active (highlighted compensation, city, deadline, open/closing status).
7. **Pricing teaser.** "Gratis per i talenti. Sostenibile per la filiera." From €0.
8. **Manifesto / values.** Editorial, Italian, trust, made in Italy.
9. **Dark closing band + CTA + footer.**

## Dashboard — what to put (per role)
**Common principle for every Home:** personal greeting + **3–4 KPIs** + **primary action** + a "what to do now" feed + recent activity. No walls of numbers: clear hierarchy, one hero figure.

- **Model Home:** "Profile Strength" ring (0–100%), weekly views + trend, **recommended opportunities feed** (compatible castings+jobs), pending contacts, active applications. Onboarding checklist until the profile is published. CTA: complete/publish profile, update portfolio.
- **Scout Home:** **talent search** front and center (big search bar), recent applications received, boards/shortlists, monthly **contact quota** (with upsell to the Pro plan), active castings/jobs. CTA: search talent, new casting.
- **Studio Home (TO ADD):** missing today — Studio lands directly on the list. Create a real home: **upcoming bookings** (mini-calendar/list), **incoming inquiries** (inbox), listing performance (views), CTA: add studio / manage availability.
- **Admin Home:** platform KPIs + **moderation queues** highlighted (scout verifications, model verifications, reports) with badges when >0, and revenue (MRR, active subscriptions).

## Where photos and logos go
- **Full-bleed photos:** landing hero, auth pages side column, closing band.
- **Portrait grids:** landing Cast, Discover, Boards, public profile (the gallery IS the hero).
- **Interiors/spaces:** Studios directory + Studio detail (large cover + thumbnails).
- **"Scoutica" wordmark:** marketing nav, footer, sidebar top (expanded), auth pages.
- **"S" monogram:** favicon, collapsed sidebar, avatar placeholder, badges.
- **Quiet UI:** dashboards, forms, settings — here photos are small (avatar, cover), content leads.

## Navigation model
- **Marketing:** fixed transparent nav over the hero (turns solid on scroll), wordmark left, links center (Home, About, Pricing, Studios), right Login + Register + language switch.
- **Dashboard desktop:** collapsible/pinnable left sidebar (248px ↔ 68px, expands on hover), sticky header with notifications + language + theme, sidebar footer with avatar/name/logout.
- **Dashboard mobile:** bottom tab bar (4–5 items per role), header with logo + menu.

## Component system to standardize
Buttons (primary/secondary/outline/ghost/destructive + sizes), inputs/labels/validation, select/multiselect, checkbox/toggle, **cards** (talent, casting/job, studio, booking, stat), **badges** (role, plan, status, verified, featured/boost), tabs/segmented, **empty state** (icon + title + subtitle + CTA), **skeleton/loading**, toast, modal/dialog, pagination, avatar, progress ring, editorial eyebrow.

---

# PART 4 — SCREEN-BY-SCREEN PROMPTS (ready to paste)

> Prefix each with: *"Using the exact same design system, fonts, palette and components we established, design this screen for Scoutica (Italian-first, light + dark, responsive desktop + mobile):"* — then paste the block.

## A — Global design system & components

### A1 — Design System & UI Kit *(generate first · 3.1 Pro)*
```text
Propose the full Scoutica design system on one canvas: color palette for LIGHT and DARK (background, surfaces, text scale, one confident accent, success/danger), full type scale (display + text faces, from oversized editorial H1 down to captions/eyebrows), spacing & grid, and a component library: buttons (primary, secondary, outline, ghost, destructive; sm/md/lg), text inputs with label + helper + error, select, multiselect chips, checkbox, toggle, radio, tabs/segmented control, badges (role, plan, status, "Verificato" with check, "In evidenza"), avatar + the FIXED Scoutica monogram (see the BRAND ASSET — LOGO section; reproduce it, don't redesign it), progress ring, card shells, modal/dialog, toast, pagination, empty-state block, and loading skeletons. Show light and dark side by side. Editorial, premium, photography-friendly, zero clutter.
```

### A2 — Marketing navbar + footer
```text
Design the public marketing navigation bar and footer.
NAVBAR: transparent overlay on top of a full-bleed hero (text light), turning into a solid bar on scroll. Left: "Scoutica" wordmark. Center: links "Home", "Chi siamo", "Prezzi", "Studi". Right: "Accedi" (ghost), "Registrati" (primary), and an IT/EN language switch. Mobile: hamburger → full drawer.
FOOTER: editorial, multi-column. Columns: Prodotto (Prezzi, Studi, Funzionalità), Azienda (Chi siamo, Contatti), Legale (Privacy, Termini), Social (Instagram, LinkedIn). Big "Scoutica" wordmark, tagline "Nuovi volti per la moda italiana.", a brand line "Scoutica — Milano · Roma · Firenze", "© 2026 Scoutica", IT/EN switch.
```

### A3 — Dashboard shell (sidebar + header + mobile tab bar)
```text
Design the dashboard application shell, light and dark.
DESKTOP: fixed left sidebar, collapsible (wide ~248px showing icon+label, collapsed ~68px icons-only, expands on hover). Top: Scoutica wordmark (collapsed: "S" monogram) + pin/collapse button. Middle: nav items (icon + label), a PRIMARY group and, below a hairline divider, a SECONDARY group (Notifiche, Impostazioni). Active item clearly marked. Bottom: user avatar + name + email, language switch, theme toggle, logout. Sticky top header: optional page title, right side has notifications bell (with unread dot), language switch, theme toggle. Main content area with generous padding, max content width.
MOBILE: sidebar hidden; sticky header with "S" monogram + menu; fixed bottom tab bar with 5 items. Show the MODEL set as example: Dashboard, Opportunità, Candidature, Messaggi, Notifiche.
```

## B — Marketing

### B1 — Landing page *(key screen · 3.1 Pro)*
```text
Design the Scoutica marketing landing page, desktop and mobile, light + dark. Sections in this exact order:
1) HERO: full-bleed editorial fashion portrait as the background; dark scrim for legibility; a quiet top brand row ("Scoutica · Italia" left in uppercase letter-spacing, "Milano · Roma · Firenze" right — NO issue number, NO date); large display headline "Nuovi volti per la moda italiana. Selezionati con cura, presentati con metodo."; supporting line; two CTAs side by side: primary light button "Sono un modello", outline-white "Sono uno scout o un'agenzia"; a thin manifesto line at the bottom "Nuovi volti per la moda italiana". Text and buttons sit ON the photo.
2) TRUST STRIP: four big numbers with labels — "Modelli pubblicati", "Scout verificati", "Regioni coperte" (20), "Studi partner".
3) CAST (featured talent): editorial heading "Cast" + an art-directed grid/marquee of real model portrait cards (face, name, city). Tasteful, gallery-like.
4) TRE VIE: section "Le tre vie" — three large cards each with an editorial photo: "Sono un modello" (portrait), "Sono uno scout o un'agenzia" (casting backstage), "Ho uno studio" (studio interior). Each: eyebrow label, title, short description, arrow link.
5) METODO: "Il metodo" — three steps emphasizing human identity verification and safety as the differentiator (no step numbers).
6) BANDI: "Bandi aperti" — three live opportunity cards (type badge Casting/Lavoro, title, scout · city, short description, COMPENSO highlighted, days left, status dot "Aperto"/"In chiusura").
7) PRICING TEASER: big "€0", line "Gratis per i talenti. Sostenibile per la filiera.", link "Vedi i piani".
8) MANIFESTO: editorial values block, Italian, made-in-Italy tone.
9) CLOSING: dark full-width band with a serif CTA headline, "Registrati" button, and a brand footer line.
Use hairlines and big type instead of heavy boxes. Photography is the hero.
```

### B2 — About (Chi siamo)
```text
Design the "Chi siamo" page, editorial and text-led. Header: eyebrow "Manifesto · Chi siamo", giant serif headline "Chi siamo", lead "Una piattaforma editoriale per il fashion italiano. Talento, sguardo, luogo — un solo sistema." Then sticky-eyebrow sections (NO number prefixes): "Manifesto" (why Scoutica exists, modernising Italian scouting), "Perché adesso" ("Il fashion italiano merita la sua piattaforma."), "Valori" (4-card grid: Sicurezza, Professionalità, Qualità, Italia prima di tutto), "Princìpi" (a list of 5: Trasparenza, Verifica umana, Controllo al modello, Editorial first, Made in Italy). Centered closer: "Scoutica è progettata, sviluppata e mantenuta a Milano." Use generous whitespace, hairline dividers, big editorial type.
```

### B3 — Pricing (Prezzi)
```text
Design the pricing page. Header: eyebrow "Tariffario · Prezzi", display headline "Gratis per i talenti. Sostenibile per la filiera.", lead "I modelli non pagano mai. Scout, agenzie e studi scelgono il piano che serve. Nessuna percentuale sui guadagni. 14 giorni di prova gratuita." A Mensile/Annuale (-17%) toggle. Then a 4-column plan grid:
- MODELLO: "€0 / per sempre", "Per chi vuole farsi notare." features: portfolio, candidature, richieste, URL pubblico. CTA "Registrati come modello".
- SCOUT PRO (featured, "Più scelto" badge): "€29/mese" (or €290/anno). features: contatti illimitati, boards, ricerca avanzata, ricerche salvate, casting illimitati. CTA "Inizia come Scout Pro".
- AGENCY: "€99/mese" (founding badge, €149 struck-through). features: tutto Pro, workspace multi-utente (3 posti), profilo agenzia pubblico, analytics, account manager. CTA "Registra agenzia".
- STUDIO: "€49/mese". features: casting illimitati, candidature avanzate, ricerca talenti, annuncio studio con gallery, statistiche. CTA "Inizia come Studio".
Below: add-ons section "Promozione e visibilità" — two cards: "Profile Boost €4,99 / 7 giorni" (profilo in evidenza nella discovery) and "Casting Promosso €49 / 14 giorni". Footnote about managed payments arriving H2 2026. Clean cards, the featured plan visually elevated, hairline grid.
```

### B4 — Studios directory & B5 — Studio detail
```text
B4 STUDIOS DIRECTORY: Header eyebrow "Studi", display headline "Studi e location in Italia", lead description. Filter bar: search by name, region dropdown (20 Italian regions), studio type. Results count "X spazi trovati". Responsive grid of studio cards (image 4:5, name, type badge, city with pin, short description). Pagination "01 / 12" with Prev/Next. Editorial, image-forward.

B5 STUDIO DETAIL: Back link "← Studi". Large gallery: big cover + thumbnail strip. Two-column layout: LEFT — type badge, studio name (H1), location line with pin, "Gestito da {nome}", description, a specs grid (mq, tariffa/ora, capienza, parcheggio, accessibilità, servizi) with icons, amenities checklist, availability. RIGHT (sticky) — a booking request form: date range, ora, durata, nome, email, telefono, note, CTA "Richiedi prenotazione"; plus a contact card. Gallery is the hero.
```

## C — Auth

### C0 — Auth layout (shared)
```text
Design the shared auth layout: a two-column split. LEFT: form column on a clean surface with the "Scoutica" wordmark at top, the form centered, a small footer link. RIGHT: a full-height dark editorial photo column with a quiet eyebrow "Scoutica · Italia" (no issue number), a centered serif statement "Lavoro autentico. Identità verificata.", and a city list at the bottom (Milano · Roma · Firenze). On mobile the photo column collapses to a slim top banner. This frame wraps all auth screens below.
```

### C1 — Login
```text
Login screen inside the auth layout. Eyebrow "Accesso", headline "Accedi a Scoutica", subtitle "Bentornato! Accedi al tuo account." Fields: Email, Password (with right-aligned "Password dimenticata?" link). Error banner state for wrong credentials. Primary button "Accedi". Hairline divider, then a "Continua con Google" secondary button. Bottom: "Non hai un account? Registrati". Show normal and error states.
```

### C2 — Register (role picker)
```text
Role picker screen. Eyebrow "Registrazione", headline "Unisciti a Scoutica", subtitle "Crea il tuo account e inizia." Section label "Come vuoi registrarti?" then three large clickable rows/cards, each with an icon and hover accent:
"Sono un modello — Crea il tuo profilo professionale e fatti scoprire." (camera icon)
"Sono un professionista — Scout, agenzia o brand: scopri nuovi talenti." (briefcase icon)
"Ho uno studio — Affitta il tuo spazio a professionisti della moda." (building icon)
Footer: "Hai già un account? Accedi". Editorial, hairline dividers between rows.
```

### C3 — Register Model / Scout / Studio
```text
Three registration forms in the auth layout, same visual system, each with eyebrow "Registrazione · {Modello|Scout|Studio}" and headline "Unisciti a Scoutica".
MODELLO: Email, Password, Data di nascita (date picker), checkbox "Confermo di avere almeno 18 anni" (required — show the underage error state), checkbox "Accetto i Termini e la Privacy", a CAPTCHA widget, primary button "Crea account".
SCOUT: Tipo (segmented: SCOUT / AGENZIA / BRAND), Email, Password, Termini checkbox, CAPTCHA, "Crea account".
STUDIO: Nome, Cognome, Nome attività, Email, Password, Conferma password, Termini, CAPTCHA, "Crea account".
Show the 18+ validation prominently for the model form (safety is core).
```

### C4 — Forgot password + Verify email
```text
TWO related screens in the auth layout.
FORGOT PASSWORD: eyebrow "Password dimenticata", headline "Hai dimenticato la password?", subtitle, Email field, button "Invia link di reset". Plus the SUCCESS state: a check icon in a bordered box, "Email inviata", body "Se un account con quell'email esiste, riceverai le istruzioni.", link "Torna al login".
VERIFY EMAIL: three states on one canvas — (1) waiting: "Controlla la tua casella e clicca il link per verificare il tuo account." with resend + change-email actions; (2) success: check icon, "Email verificata!", CTA "Continua"; (3) error: "Il link non è valido o è scaduto", "Richiedi un nuovo link".
```

### C5 — Verify selfie (identity, optional)
```text
Design the live identity verification screen (optional badge, not a gate). Centered card. Title "Verifica identità", subtitle "Scatta un selfie per ottenere il badge di verifica (opzionale)." Main panel: a live camera viewport (front camera) with a face guide, a large "Scatta" capture button, then a captured-preview state with "Conferma e invia" / "Riprova". A QR fallback block for when there's no camera ("Inquadra il QR dal telefono"). Success state: "Selfie inviato. La verifica è in revisione, ti avviseremo." Privacy reassurance microcopy. Calm, trustworthy, not clinical.
```

## D — Model dashboard

### D1 — Model Home *(key screen · 3.1 Pro)*
```text
Model dashboard home. Header: eyebrow "Panoramica", serif greeting "Bentornata, {Nome}", and a contextual status line + actions (if profile incomplete: "Completa il tuo profilo per farti scoprire" with buttons "Completa profilo"/"Pubblica profilo"; if published: "Visualizza profilo" + "Modifica profilo"). If not yet published, show an ONBOARDING CHECKLIST card ("Pronto per essere scoperta?", 4 steps: dati, 3+ foto, misure, pubblica) with progress. METRICS row, eyebrow "Numeri", four KPI cells on a hairline grid: Visite questa settimana (+trend %), Profile Strength (progress ring + tier "Professionale/Solido/Iniziale"), Contatti in attesa, Candidature attive. MAIN GRID: left (8 cols) "Opportunità per te" — feed of recommended casting/job cards (type badge, title, scout · city, deadline) with empty state "Nessuna opportunità al momento"; right (4 cols) "Attività recente" notification list + "Azioni rapide" (Aggiorna portfolio, Esplora opportunità). Editorial hierarchy, one hero number, not a wall of stats.
```

### D2 — Model Profile (editor)
```text
Model profile editor. Title "Il tuo profilo", subtitle "Completa il tuo profilo per farti scoprire da scout e agenzie." A completeness card (progress ring + % + tips like "Aggiungi foto", "Completa le misure"). A profile photos manager (thumbnail grid, upload/drag-drop, set-cover, reorder). A long form in clear sections (use tabs or accordion): Dati personali (nome, bio, nascita, genere, città, regione), Misure (altezza, seno, vita, fianchi, scarpe, taglia), Aspetto (occhi, capelli, etnia), Professionale (categorie multi-select, status, lingue, disponibilità a viaggiare), Social (Instagram, TikTok, YouTube, X, sito, follower), Visibilità (toggle pubblico/privato). A publish-control card showing status (INCOMPLETO / NON PUBBLICATO / PUBBLICATO) with publish/unpublish and a requirements checklist. Inputs must handle long Italian labels.
```

### D3 — Model Portfolio
```text
Model portfolio manager. Eyebrow "Portfolio", serif headline "Portfolio", lead "Gestisci le tue immagini. Massimo 12 foto. JPG, PNG, WebP — max 10MB." Then "Le tue immagini (X/12)": an editorial image grid where each item shows the photo, a cover badge if set, and hover actions (Imposta cover, Elimina, Riordina via drag handle). An upload dropzone tile when under the max. Optional plan-upgrade teaser. Treat photos like a gallery, minimal chrome.
```

### D4 — Model Discover + D5 — Model Castings/Jobs list *(reusable pattern)*
```text
D4 DISCOVER: a browse grid of model cards (cover photo, name, city, category chips, verified badge, save/like heart on hover). Top bar: results count + a column-density selector (1–5). Empty state "Nessun profilo trovato".

D5 OPPORTUNITY LIST (reuse this pattern for Model "Casting Aperti" AND "Lavori Disponibili", and for Scout's own listings): header with title + description; a list/grid of opportunity cards — type badge (Casting/Lavoro), title, scout name + type badge, city with pin, deadline with calendar, compensation badge, an apply CTA with states (Non candidato / Candidato / Chiuso), and a save bookmark. Empty state with a megaphone icon, e.g. "Al momento non ci sono casting aperti. Torna più tardi!". Make it scannable.
```

### D6 — Casting/Job detail *(reusable pattern)*
```text
Opportunity detail page (reuse for casting and job, model side). Header: type badge, title (H1), posted by (scout name + verified badge), status. Full description, a requirements section, a specs strip (date, compenso, posti). A sticky apply panel on the right with the primary CTA "Candidati" (and applied/closed states) + "Contatta". A "simili" rail at the bottom. Let the brief read like an editorial call sheet.
```

### D7 — Applications / Contacts *(reusable pattern)*
```text
TWO list screens, same system.
CANDIDATURE (model): title "Le tue candidature", subtitle, segmented filter (Tutte / In attesa / Accettate / Rifiutate / Ritirate). Rows: casting/job title, status badge (orologio/check/x), scout, città, scadenza, "Ritira" if pending. Empty state "Non hai ancora candidature".
CONTATTI (model): title "Richieste di contatto", subtitle "Gestisci chi può contattarti". Cards: scout avatar+name, motivo, anteprima messaggio, status badge, Accetta/Rifiuta if pending, timestamp. Empty "Nessuna richiesta di contatto".
```

### D8 — Messages (messaging) *(reusable pattern for all roles)*
```text
Messaging screen, two-pane. LEFT: conversation list (avatar, name, last-message preview, timestamp, unread badge) + search. RIGHT: chat thread with a conversation header (avatar, name, status), scrollable bubbles (mine vs theirs), and a composer "Scrivi un messaggio…" with send. Mobile: list and thread are separate views. Empty state "Nessuna conversazione". Calm, focused, lots of breathing room.
```

### D9 — Notifications + Settings + Subscription *(reusable pattern for all roles)*
```text
THREE screens sharing the system.
NOTIFICHE: title "Notifiche", subtitle "Cronologia della tua attività", "Segna tutte come lette". A typed notification list (icon, title, description, timestamp, link). Empty state bell icon "Nessuna notifica — le tue notifiche appariranno qui."
IMPOSTAZIONI: title "Impostazioni". Sections: Profilo (nome, email, avatar), Preferenze (lingua IT/EN, tema chiaro/scuro/auto), Password, Notifiche email (toggles), and a clearly separated "Zona pericolo" with "Elimina account" (destructive + confirm modal).
ABBONAMENTO: title "Abbonamento". Current plan card (nome piano, prezzo, rinnovo, status badge). A compact plan comparison with upgrade/downgrade. For scouts on FREE: a "X di Y contatti rimasti questo mese" meter with upsell. Billing history table (data, descrizione, importo, ricevuta). Active boosts list with days remaining.
```

## E — Scout / Agency / Brand dashboard

### E1 — Scout Home *(key screen · 3.1 Pro)*
```text
Scout dashboard home. Header: eyebrow "Panoramica", serif greeting "Bentornato, {Nome attività}", meta badges "{Scout|Agenzia|Brand} · {Piano} · {Città}", CTAs "Ricerca talenti" (primary, search icon) + "Nuovo casting" (outline). A prominent TALENT SEARCH entry (big search field or hero search card) — searching talent is the scout's #1 job. METRICS, eyebrow "Numeri": primary 4-cell hairline grid (Casting attivi, Lavori attivi, In revisione [highlight if >0], Conversazioni) + secondary 2-cell grid (Shortlist/Boards, Contatti in attesa). MAIN GRID: left (8) "Candidature recenti" (model avatar, name, casting/job, status, time, view-profile/message) with empty state; right (4) "Attività recente". A 4-tile quick actions grid: Cerca talenti, Crea casting, Crea lavoro, Apri boards. If the scout is NOT yet verified, show a read-only banner at top (see E2).
```

### E2 — Scout read-only banner + Verification
```text
Design (a) a persistent read-only banner shown to unverified scouts across the dashboard: "Account in verifica — puoi esplorare, ma alcune azioni sono bloccate finché non sei verificato." with a "Completa la verifica" button; and (b) the VERIFICA screen: title "Verifica account", subtitle "Completa la verifica per accedere a tutte le funzionalità." Form: nome, nome attività, ruolo (es. Casting Director), città, email professionale, sito, profilo social, P. IVA, upload documenti (opzionale), button "Invia richiesta di verifica". States: submitted ("La tua richiesta è in revisione."), approved (success badge). Reassuring, trust-building.
```

### E3 — Scout Discover (talent search) *(key screen · 3.1 Pro)*
```text
Scout talent search — the core demand-side screen. LEFT filter panel (collapsible on mobile): testo, regioni (multi), categorie (multi), range altezza, range età, colore occhi/capelli, lingue, status professionale, plus "Salva ricerca" and a saved-searches list. Some advanced filters are gated to paid plans (show a subtle lock + "Pro"). MAIN: results count + grid-density selector (1–6), then an editorial grid of model cards (cover, name, city, category chips, verified badge, boost/featured badge, save-to-board heart). Pagination. Empty state "Nessun modello trovato con questi filtri — Azzera i filtri". This screen should feel like flipping through a casting book.
```

### E4 — Scout Boards (shortlist) + detail
```text
TWO screens.
BOARDS LIST: header + CTA "Crea bacheca" (opens a small dialog: nome + descrizione). Grid of board cards: an overlapping mini-avatar stack of the first models, board name, "12 modelli", "Aggiornata 2 giorni fa". Empty state "Non hai ancora bacheche — Crea una bacheca".
BOARD DETAIL: board name + description, actions (modifica, elimina, condividi/esporta), then a model-card grid (same as discover) with per-card "Rimuovi", "Vedi profilo", "Messaggio". Empty state "Questa bacheca è vuota". Treat it like a curated mood/casting board.
```

### E5 — Scout Castings/Jobs (list, new, applications)
```text
THREE screens for the scout's own listings (reuse for both Casting and Lavori).
LISTA: eyebrow + serif headline "I tuoi casting" + lead, top-right "Nuovo casting" CTA. A row list: title, status badge (Bozza/Pubblicato/Chiuso/Archiviato), "X candidature", timestamp, link to applications. Empty "Non hai ancora casting — Crea il tuo primo casting".
NUOVO: form — titolo, descrizione, città (regione auto), data casting, scadenza candidature, requisiti, compenso + toggle "Pagato", posti disponibili, note, upload foto. Buttons "Salva bozza" + "Pubblica". (Job version adds: tipo lavoro [Editorial/Commercial/Campaign], durata, diritti d'uso.)
CANDIDATURE: casting title + status header, back link, list of applicant cards (model avatar+name, data, status badge, Accetta/Rifiuta/Messaggio/Vedi profilo), optional bulk select. Empty "Nessuna candidatura ancora".
```

> Scout **Profile, Contacts, Messages, Notifications, Settings, Subscription**: reuse patterns D7/D8/D9 and E2, with scout-side copy (e.g. Contacts = "Richieste di contatto inviate", "Modelli che hai contattato").

## F — Studio dashboard

### F1 — Studio Home *(NEW · key screen · 3.1 Pro)*
```text
Create a NEW Studio dashboard home (it doesn't exist yet — studios currently land on a list). Header: eyebrow "Panoramica", serif greeting "Bentornato, {Studio}", CTAs "Aggiungi studio" + "Gestisci disponibilità". METRICS: Prenotazioni in arrivo, Richieste da gestire (highlight if >0), Visite agli annunci (settimana), Studi attivi. MAIN GRID: left (8) "Prossime prenotazioni" as a mini calendar or date-grouped list (progetto, studio, date range, ora, stato) with empty state "Nessuna prenotazione in arrivo"; right (4) "Richieste recenti" inbox preview + "Attività recente". Make a studio owner feel in control of their calendar.
```

### F2 — Studio: Studios (list, new, editor)
```text
THREE screens.
STUDI LIST: eyebrow "Studi", serif headline "I miei studi", lead, top-right "Aggiungi studio". Card grid (image 4:5 with Building fallback, nome, type badge, città/regione, status badge Attivo/Inattivo, "X prenotazioni", "Aggiornato…"). Empty state Building icon "Non hai ancora studi — Crea il tuo primo studio per ricevere prenotazioni".
NUOVO (multi-step or accordion): 1) Base — nome, tipo (Studio fotografico/Location/Sala), descrizione, indirizzo, città, regione, CAP; 2) Dettagli — mq, tariffa oraria, servizi (checkbox: WiFi, Parcheggio, A/C, Cucina…), capienza, accessibilità; 3) Foto — gallery upload, set cover, riordina; 4) Disponibilità — fasce orarie settimanali, chiusure. "Salva bozza" + "Pubblica".
EDITOR: same populated + editable, status badge, gallery editor, availability, plus quick "Prenotazioni recenti" and "Richieste recenti" sections linking to the full pages.
```

### F3 — Studio: Bookings + Inquiries
```text
TWO inbox-style screens.
PRENOTAZIONI: title "Prenotazioni", subtitle "Visualizza e gestisci le prenotazioni dei tuoi studi". Booking cards: progetto (H3), "per {Studio}", status badge (In attesa/Confermata/Annullata/Completata), actions menu (conferma, annulla, completa), date range with calendar icons, time range, prezzo, contatti (email/telefono). Empty state Inbox icon "Nessuna prenotazione — le richieste appariranno qui."
RICHIESTE (inquiries): title "Richieste di informazioni", subtitle "Gestisci le richieste dei clienti". Inquiry cards: nome/progetto, "per {Studio}", status (In attesa/Risposto), message preview, contatti, date preferite, durata, timestamp, actions (Rispondi, Archivia). Empty "Nessuna richiesta".
```

> Studio **Messages, Notifications, Settings**: reuse D8/D9 with studio copy.

## G — Admin

### G1 — Admin Dashboard
```text
Admin overview. Title "Admin", subtitle "Piattaforma — Panoramica". A stat-card grid (responsive 2/3/4 cols): Utenti totali (clickable), Modelli, Scout/Agenzie, Verifiche in attesa (highlight if >0, clickable), Segnalazioni in attesa (highlight if >0, clickable), Casting attivi, Abbonamenti attivi (with MRR €/mese). Dense, calm, operational — the highlighted moderation queues should pull the eye.
```

### G2 — Admin: Scout verifications + Model verifications
```text
TWO moderation queues.
VERIFICHE SCOUT: title + "X richieste in attesa". Cards: nome+avatar, tipo (Scout/Agenzia/Brand), status badge, an info grid (nome attività, email, sito link, P.IVA, città, inviato il), optional admin notes, and actions Approva (primary) / Rifiuta (with reason modal). Empty "Nessuna verifica in attesa".
VERIFICHE MODELLE: title + "X selfie in attesa". Cards: the submitted selfie thumbnail, nome (link to public profile), status "Inviato", email, inviato il, "4 foto" portfolio count, actions Approva/Rifiuta (with optional notes). Note that after a decision the selfie is deleted for privacy. Empty "Nessuna verifica modella in attesa".
```

### G3 — Admin: Users, Castings (moderation), Reports, Subscriptions, Settings
```text
FIVE admin screens, same dense system.
UTENTI: "Gestione utenti", "Ultimi 100 utenti". Dense rows: avatar, nome/email, role badge (Modello/Scout/Studio/Admin), plan badge if paid, suspended badge if applicable, "Iscritto 3 settimane fa", actions menu (sospendi, vedi profilo, messaggio).
CASTING (moderazione): "Casting (Moderazione)". Rows: titolo, scout (link), status badge, data, "X candidature", flag se segnalato, actions (revisiona, segnala, archivia, elimina).
SEGNALAZIONI: "Segnalazioni", "Violazioni segnalate". Cards: utente segnalato, tipo contenuto, motivo (Molestie/Profilo falso/Contenuto inappropriato/Spam), status, dettagli, actions (Risolvi, Ignora, Sospendi utente, Vedi contenuto).
ABBONAMENTI: "Abbonamenti", metrics (abbonamenti attivi, MRR, breakdown per piano), subscription rows (utente, piano, status, prezzo, rinnovo, actions).
IMPOSTAZIONI: "Impostazioni amministrative" — feature toggles, template email, rate limit, chiavi Stripe (mascherate), zona pericolo.
```

## H — Public model profile

### H1 — Public Model Profile *(showcase screen · 3.1 Pro)*
```text
Design the public, shareable model profile (the product's showcase page, optimized for sharing). Back link. A large gallery hero: full-width cover photo + a thumbnail strip / lightbox for the rest of the portfolio. Two-column layout. LEFT (2/3): badges row (a "Verificata" check badge if approved, a "In evidenza" badge if boosted), name (H1), location with pin, age ("20 anni"), professional-status badge; an "About"/bio section; a "Misure" grid (altezza, seno, vita, fianchi, scarpe, taglia, occhi, capelli, etnia) with small icons; a "Professionale" section (lingue, disponibilità a viaggiare, categorie chips, status); a social row (Instagram, TikTok, YouTube, X, sito) with follower count. RIGHT (1/3, sticky): a contact panel — for verified scouts "Richiedi contatto" (primary), for logged-out "Accedi per contattare"; a "…" menu with Segnala / Blocca; for scouts a private-note card + "Aggiungi a bacheca" selector. The photography must dominate; the data is set like an editorial spec sheet. This is the single most important screen to make stunning.
```

## I — System (errors and states)

### I1 — 404 + 500
```text
TWO system pages, matching the editorial brand.
404: a giant serif "404" (oversized, light weight), eyebrow "Errore · 404 · Not Found", headline "Pagina non trovata", body "La pagina che cerchi non esiste o è stata spostata.", buttons "Torna alla home" (primary) + "Esplora gli studi" (outline). Footer line: "S" monogram + "Scoutica · Milano".
500: same composition with a giant "500", eyebrow "Errore · 500 · Server", headline "Qualcosa è andato storto", body "Si è verificato un errore imprevisto. Riprova o torna indietro.", buttons "Riprova" (primary) + "Torna alla home" (outline). Make errors feel intentional and on-brand, not default.
```

### I2 — Empty & loading states (system)
```text
Design a consistent EMPTY STATE block (centered icon, serif title, one-line subtitle, single CTA) shown in three contexts as examples: no opportunities, no messages, no search results. And design LOADING SKELETONS for: a model-card grid, an opportunity list, and a dashboard home (KPIs + lists). Quiet, elegant, on-brand — no spinners-only.
```

---

# PART 5 — REUSABLE CLAUSES (append to any prompt)

```text
[FREEDOM] You have full creative freedom on palette, type and styling — choose the strongest option; just keep it consistent with the design system we locked, and ensure AA contrast in both light and dark.

[RESPONSIVE] Provide both a desktop and a mobile version. On mobile, dashboards use a bottom tab bar; marketing uses a hamburger drawer.

[ITALIAN] All visible copy in Italian (the strings I provide). Keep layouts tolerant of longer Italian text. Keep an EN equivalent in mind (bilingual product).

[PHOTOGRAPHY] Use real editorial fashion photography placeholders (portraits for talent, interiors for studios). Frame images like a gallery; keep surrounding UI quiet.
```

---

## Coverage checklist (so nothing is missing)

- [x] Landing (9 sections) · About · Pricing · Studios directory · Studio detail
- [x] Login · Role picker · Register Model/Scout/Studio · Forgot password · Verify email · Verify selfie
- [x] Marketing nav · Footer · Dashboard shell (sidebar/header/bottom-nav)
- [x] Model: Home · Profile · Portfolio · Discover · Castings (+detail) · Jobs (+detail) · Applications · Contacts · Messages · Notifications · Settings · Subscription
- [x] Scout: Home · Read-only banner · Verification · Discover · Boards (+detail) · Castings/Jobs (list/new/applications) · Profile · Contacts · Messages · Notifications · Settings · Subscription
- [x] Studio: Home (new) · Studios (list/new/editor) · Bookings · Inquiries · Messages · Notifications · Settings
- [x] Admin: Dashboard · Users · Scout verifications · Model verifications · Casting moderation · Reports · Subscriptions · Settings
- [x] Public model profile (showcase)
- [x] 404 · 500 · empty states · loading skeletons
- [x] Design system / UI kit · components · badges · states

> **Final tip.** Generate in this order: A1 (design system) → H1 (public profile) → B1 (landing) → D1/E1/F1/G1 (the 4 role homes) → then everything else reusing the patterns. Generate **everything in `3.1 Pro`**; the first five are the most important — do them first and take a **verification screenshot** after each.
