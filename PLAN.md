# 🐛 CentipAI — Productplan

> **Social media planning met AI-hulp, voor bedrijven én agencies.**
> Plan, genereer, keur goed en publiceer — met Centi, je AI-duizendpoot.

---

## 1. Het concept in één alinea

CentipAI is een mobiele app (App Store + Google Play) waarmee bedrijven en marketing-agencies social media posts plannen, AI-captions laten genereren op basis van hun eigen foto's en merkidentiteit, en publiceren naar Facebook, Instagram, Threads, TikTok, LinkedIn en Google Mijn Bedrijf. Agencies kunnen content klaarzetten die de ondernemer zelf met één tik goedkeurt. De mascotte **Centi** (de duizendpoot uit het logo) leeft door de hele app heen als chatbot: je dropt een foto van je spare ribs, vraagt om 5 captions, kiest je favoriet en plant hem in voor vrijdag 17:00 — of laat Centi de beste tijd kiezen op basis van je pagina-statistieken.

---

## 2. Kernfeatures

### 2.1 Centi — de AI-chatbot 🗨️
- Chat-interface waarin je **foto's kunt droppen** (één of meerdere).
- Centi genereert captions op basis van de foto **+ jouw brand identity** (tone of voice, doelgroep, emoji-gebruik, hashtag-stijl, taal).
- Vraag om meerdere varianten ("maak er 5") en **tik je favoriet aan**.
- Direct vanuit de chat inplannen: *"Plan deze in op vrijdag 5 augustus om 17:00 op Instagram en Facebook"* — Centi begrijpt dit en maakt de geplande post aan.
- Of: *"Kies zelf het beste moment"* → Centi gebruikt de best-times-analyse (zie 2.5).
- **Vragenlimiet per abonnement** (bijv. 100 chatberichten/maand op Starter) + **AI-credits** voor generates.
- Centi is "levendig": geanimeerde reacties (denken, blij, wijzen naar je content) — zie sectie 6 (Higgsfield).

### 2.2 Brand Identity 🎨
Eenmalige onboarding-wizard per bedrijf:
- Bedrijfsnaam, branche, doelgroep
- Tone of voice (formeel ↔ speels, met voorbeelden)
- Emoji- en hashtag-voorkeuren
- Taal (NL/EN/…)
- Voorbeeldcaptions die je mooi vindt (optioneel)
- Verboden woorden / do's & don'ts

Dit profiel wordt bij **elke** caption-generatie meegestuurd (en gecachet — zie kosten), zodat captions altijd on-brand zijn.

### 2.3 Contentkalender & planning 📅
- Maand/week-kalenderweergave in Instagram-achtige stijl.
- Drag & drop posts naar andere dagen/tijden.
- Per post eenvoudig **aanvinken op welke kanalen** hij gepubliceerd wordt (FB / IG / Threads / TikTok / LinkedIn / GMB), met per kanaal aangepaste versies (bijv. hashtags wel op IG, niet op LinkedIn).
- Statussen: **Concept → Wacht op goedkeuring → Goedgekeurd → Ingepland → Gepubliceerd**.

### 2.4 Agency ↔ Bedrijf: toegangsmodel & goedkeuring ✅
- **Het bedrijfsaccount is altijd de eigenaar** van het brandprofiel, de kanalen en de AI-credits. Een bedrijf kan alles volledig zelf doen, zonder agency.
- **Agencies krijgen toegang tot het account van het bedrijf** (uitnodiging vanuit het bedrijf, of de agency stuurt een koppelverzoek dat het bedrijf accepteert).
- **Credits van de klant**: werkt een agency in het account van klant X, dan gaan generates, chats en fotoverbeteringen van de tegoeden van klant X af. Het Agency-abonnement heeft alleen een klein eigen tegoed voor de eigen kanalen van de agency.
- Agency zet posts klaar → ondernemer krijgt pushnotificatie → ziet een preview precies zoals de post er live uit gaat zien → **Goedkeuren / Afwijzen met opmerking**.
- Optioneel: auto-publiceren na goedkeuring, of stille goedkeuring na X dagen (instelbaar).
- In de app is altijd zichtbaar in welk klantaccount je werkt (workspace-switcher), zodat er nooit verwarring is over wiens credits worden gebruikt.

### 2.5 Beste-tijden-analyse 📈
- Per gekoppeld kanaal analyseren we engagement-data (via de platform-API's: Instagram Insights, Facebook Page Insights, LinkedIn Analytics, TikTok, …).
- Heatmap per weekdag/uur: "Jouw volgers zijn het actiefst op vrijdag 17:00–19:00."
- Bij het inplannen twee opties: **"Kies zelf"** (datum/tijd-picker) of **"Slim inplannen"** (Centi kiest het beste moment op de gekozen dag of in de gekozen week).

### 2.6 Publiceren naar 6 platformen 🚀
| Platform | API | Bijzonderheden |
|---|---|---|
| Facebook (pagina's) | Meta Graph API | Foto, video, tekst, carrousel |
| Instagram | Instagram Graph API (Content Publishing) | Business/Creator-account vereist; feed, carrousel, Reels |
| Threads | Threads API | Sinds 2024 publiek beschikbaar |
| TikTok | TikTok Content Posting API | App-audit door TikTok vereist |
| LinkedIn | LinkedIn Community Management API | Bedrijfspagina's |
| Google Mijn Bedrijf | Google Business Profile API | "Updates/aanbiedingen" posts |

Publicatie loopt via onze backend-scheduler (niet vanaf de telefoon), zodat posts ook live gaan als de app dicht is.

### 2.7 Centi trainen: eigen AI-regels 🎓
- Gebruikers geven Centi permanente instructies, bijv. *"Gebruik altijd emoticons, maar nooit 🙏"* of *"Sluit altijd af met #ribhousetexas"*.
- Elke regel wordt opgeslagen bij het brandprofiel, meegestuurd bij elke generatie, en is **op elk moment weer te verwijderen** in het scherm "Centi trainen".
- Naast de eigen regels gelden vaste CentipAI-regels (zichtbaar, niet verwijderbaar), waaronder: **nooit het teken "-" in captions**, en nooit feiten/prijzen/acties verzinnen.

---

## 3. Kan het voor ≤ €10 per 100 generates? → **Ja, ruim.**

Een caption-generate = foto('s) + brand-profiel + prompt naar Claude, caption(s) terug.

Rekenvoorbeeld per generate (1 foto, 5 caption-varianten):
- Input: ~1.600 tokens (foto) + ~1.300 tokens (brand-profiel + instructies) ≈ **3.000 input tokens**
- Output: 5 captions ≈ **400 output tokens**

| Model | Kosten per generate | Kosten per 100 generates |
|---|---|---|
| **Claude Haiku 4.5** ($1 / $5 per 1M tokens) | ± $0,005 | **± €0,45** |
| **Claude Sonnet 5** ($3 / $15) | ± $0,015 | **± €1,40** |

Zelfs met het slimste Sonnet-model zitten we op **~€1,40 per 100 generates** — een factor 7 onder je plafond van €10. Met **prompt caching** (het brand-profiel wordt gecachet, ~90% korting op herhaalde context) daalt dit nog verder. Er blijft dus ruime marge voor:
- chatgesprekken met Centi (aparte, goedkopere calls),
- de best-tijden-analyse,
- en gewoon winst op de credit-bundels.

**Strategie:** Haiku 4.5 voor chat-smalltalk en simpele vragen, Sonnet 5 voor de daadwerkelijke caption-generatie (kwaliteit merkbaar beter, kosten nog steeds verwaarloosbaar).

---

## 4. Verdienmodel & credits 💳

- **AI-credits**: 1 credit = 1 caption-generate. Bundels via abonnement + los bij te kopen.
- **Vragenlimiet**: chatberichten aan Centi per maand gemaximeerd per tier.
- **Beloning**: credits verdienen door content in te plannen (bijv. +1 credit per 5 ingeplande posts, gemaximeerd per maand) → stimuleert het kerngedrag: consistent posten.
- Indicatieve tiers:

| | Starter | Business | Agency |
|---|---|---|---|
| Prijs | €14,99/mnd | €29,99/mnd | €79,99/mnd |
| Bedrijven | 1 | 1 | toegang tot 10 klantaccounts |
| AI-credits/mnd | 100 | 300 | 250 eigen; klantwerk gaat van de credits van de klant |
| Fotoverbeteringen/mnd | 10 | 30 | 25 eigen |
| Chatberichten/mnd | 200 | 750 | onbeperkt* |
| Kanalen | 3 | 6 | 6 per klant |
| Goedkeuringsflow | agency uitnodigen kan | ✓ | ✓ |

*"onbeperkt" met fair-use limiet.

**Let op (App Store/Play Store):** digitale tegoeden (credits, abonnementen) **moeten** via Apple In-App Purchase / Google Play Billing → 15–30% commissie. Prijzen dus hierop calculeren. (RevenueCat als abstractielaag over beide stores.)

---

## 5. Design: Instagram-stijl 🎨

- Het logo (oranje → roze → paars gradient) wordt het designsysteem: die gradient als accent op knoppen, actieve states, progress rings en de "Slim inplannen"-knop.
- UI-patronen die van Instagram bekend zijn: stories-achtige ringen rond bedrijfsprofielen (agency-view), grid-preview van je geplande feed ("zo gaat je Instagram-grid eruitzien"), bottom-tab-navigatie, kaart-gebaseerde feed.
- Licht + donker thema.
- **Feed-preview** is een killer feature: je geplande posts als visueel grid zien vóór ze live staan.

## 6. Centi levendig maken met Higgsfield ✨

Via de Higgsfield-connectie genereren we een set **animatie-assets van de duizendpoot-mascotte** (op basis van het bestaande logo):
- Lottie/video-loops: idle (kruipend), denkend (tijdens AI-generatie), blij (post goedgekeurd), trots (post gepubliceerd), slapend (leeg scherm 's nachts).
- Deze worden **eenmalig gegenereerd** en als assets in de app gebundeld (geen runtime-API-kosten, geen latency).
- In de chat reageert Centi met de juiste animatie op de context; bij het wachten op captions "denkt" hij zichtbaar.
- Later uitbreidbaar: seizoensvarianten (kerst-Centi), onboarding-animaties, marketingvideo's voor de stores.

---

## 7. Technische architectuur 🏗️

```
┌──────────────────────────┐
│  Mobiele app             │  React Native + Expo (iOS + Android, 1 codebase)
│  (Instagram-stijl UI)    │  → App Store + Google Play
└───────────┬──────────────┘
            │ HTTPS
┌───────────▼──────────────┐
│  Backend API             │  Node.js/TypeScript (of Supabase Edge Functions)
│  - Auth (bedrijf/agency) │  Supabase: Postgres + Auth + Storage + Realtime
│  - Credits & limieten    │
│  - Goedkeuringsflow      │
└──┬────────┬──────────┬───┘
   │        │          │
┌──▼─────┐ ┌▼───────┐ ┌▼────────────────────┐
│ Claude │ │Schedu- │ │ Social publishers    │
│ API    │ │ler/    │ │ Meta / Threads /     │
│ Haiku+ │ │queue   │ │ TikTok / LinkedIn /  │
│ Sonnet │ │(cron)  │ │ Google Business      │
└────────┘ └────────┘ └─────────────────────┘
```

- **React Native + Expo**: één codebase voor beide stores, snelle iteratie, OTA-updates.
- **Supabase**: Postgres (posts, bedrijven, credits), Auth (e-mail + Apple/Google sign-in — Apple Sign-In is verplicht bij social logins), Storage (foto's), Realtime (goedkeurings-notificaties).
- **Scheduler**: queue (bijv. pg_cron + worker) die op het geplande tijdstip publiceert en retries afhandelt.
- **Claude API**: vision (foto-analyse) + caption-generatie + chat, met prompt caching op het brand-profiel.
- **Notificaties**: Expo Push (goedkeuring gevraagd, post gepubliceerd, post mislukt).

### Datamodel (kern)
`agencies` → `companies` → `brand_profiles`, `channel_connections` (OAuth-tokens per platform), `posts` (status, kanalen, media, caption per kanaal), `approvals`, `credit_ledger`, `chat_sessions`.

---

## 8. Store-vereisten (App Store & Google Play) ⚠️

1. **IAP verplicht** voor credits/abonnementen (RevenueCat aanbevolen).
2. **Apple Sign-In verplicht** zodra je Google/Facebook-login aanbiedt.
3. **TikTok API-audit**: aanvraag + demo-video vereist voor de Content Posting API — vroeg starten.
4. **Meta App Review**: permissies voor publiceren op IG/FB vereisen een review met screencast — vroeg starten.
5. **Privacy**: privacy-labels (Apple), Data Safety-formulier (Google), AVG (we verwerken klantfoto's en tokens).
6. **AI-content-beleid**: beide stores eisen moderatie-mogelijkheid op AI-gegenereerde content → rapporteer/regenereer-knop bij captions.
7. Account-verwijdering in-app verplicht (Apple-regel).

---

## 9. Roadmap 🗺️

### Fase 1 — MVP (±6–8 weken bouwen)
- Auth + bedrijfsaccount + brand identity wizard
- Centi-chat: foto droppen → captions (meerdere varianten, favoriet kiezen)
- Handmatig inplannen + kalender
- Publiceren naar **Instagram + Facebook** (Meta eerst; grootste doelgroep, één API-familie)
- Credits + vragenlimiet + IAP
- Centi-animaties (eerste set via Higgsfield)

### Fase 2 — Agency & goedkeuring
- Agency-accounts, bedrijven uitnodigen, goedkeuringsflow + push
- LinkedIn + Google Mijn Bedrijf
- Feed-preview (grid)

### Fase 3 — Slim & compleet
- Best-tijden-analyse + "Slim inplannen"
- TikTok + Threads
- Credits verdienen door in te plannen
- Analytics-dashboard (bereik/engagement per post)

### Fase 4 — Groei
- Web-versie voor agencies (bulk-werk is fijner op desktop)
- AI-beeldsuggesties, carrousel-teksten, hashtagsets per niche
- Teamrollen binnen agencies

---

## 10. Besluiten (28 juli)

- **Haiku-first**: Haiku 4.5 is het standaardmodel (chat, simpele captions); alleen opschalen naar Sonnet als de taak erom vraagt (complexe captions, website-analyse).
- **Foto's upload je zelf** — wij genereren geen beelden. Wel **AI-fotoverbetering** (belichting/scherpte/uitsnede), en die is **strikt gelimiteerd** per abonnement (10/30/150 p/mnd) omdat beeldbewerking veel duurder is dan tekst.
- **Brand-onboarding**: websitelink + exact 4 vragen (type bedrijf, toon persoonlijk↔strikt zakelijk met voorbeeldcaptions, je/u, taal + emoji).
- **Betalen hybride**: Stripe op web/desktop (geen store-commissie), verplichte IAP via RevenueCat in de mobiele apps.
- **Desktop-versie**: zelfde Expo-codebase, geëxporteerd als webapp; alle schermen zijn responsive gebouwd.
- **Toegangsmodel**: het bedrijf is eigenaar van account en credits; agencies werken ín het klantaccount en verbruiken de credits van die klant. Bedrijven kunnen ook alles zelf.
- **Nooit "-" in teksten**: vaste generatieregel, ook doorgevoerd in alle app-teksten.
- **Trainbare Centi**: eigen AI-regels toevoegen én verwijderen via het scherm "Centi trainen".

## 11. Openstaande keuzes (input gevraagd)

1. **Prijspunten** — kloppen de indicatieve tiers met je gevoel voor de markt?
2. **MVP-kanalen** — akkoord om met Instagram + Facebook te starten en TikTok/Threads naar fase 3 te schuiven (vanwege audit-doorlooptijd)?
3. **Naam chatbot** — "Centi" als werknaam oké?
4. **Web-versie** — direct meedenken in fase 1 (alleen responsive marketing-site) of pas fase 4?

---

*Kostenbronnen: Claude API-prijzen per juli 2026 — Haiku 4.5: $1/$5 per 1M tokens; Sonnet 5: $3/$15 (introductieprijs $2/$10 t/m aug 2026). Wisselkoers ~$1,08/€.*
