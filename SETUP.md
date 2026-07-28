# CentipAI aansluiten op jouw Supabase-project

Drie stappen, ongeveer 10 minuten. Daarna werken accounts, credits en echte
AI-captions via Claude.

## Stap 1 · Database aanmaken (2 min)

1. Open je project op [supabase.com/dashboard](https://supabase.com/dashboard).
2. Ga naar **SQL Editor** → **New query**.
3. Plak de volledige inhoud van [`supabase/schema.sql`](supabase/schema.sql) en klik **Run**.

Je hebt nu alle tabellen, beveiligingsregels en het welkomstcadeau
(25 gratis proef-credits per nieuw bedrijf).

## Stap 2 · App koppelen (2 min)

1. Dashboard → **Project Settings** → **API**.
2. Kopieer de **Project URL** en de **anon public** key.
3. Maak in de hoofdmap van dit project een bestand `.env` (kopie van
   `.env.example`) en vul beide waarden in:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Herstart de app (`npm run web` of `npm start`). Registreren en inloggen
   werken nu; bij registratie worden bedrijf, brandprofiel en AI-regels uit
   de onboarding automatisch opgeslagen.

> Tip: zet in het dashboard onder **Authentication → Providers → Email**
> "Confirm email" tijdelijk uit om zonder mailverificatie te testen.

## Stap 3 · Echte AI-captions via Claude (5 min)

Hiervoor is de Supabase CLI nodig ([installatie](https://supabase.com/docs/guides/local-development/cli/getting-started))
en een Anthropic API-key ([console.anthropic.com](https://console.anthropic.com)).

```sh
supabase login
supabase link --project-ref JOUWPROJECTREF   # de ref staat in je dashboard-URL
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy generate-captions
```

Klaar. De chat gebruikt vanaf nu Claude Haiku met jouw brandprofiel en
AI-regels, en boekt per generate 1 credit af op het juiste bedrijfsaccount.
Zolang stap 3 nog niet is gedaan valt de chat automatisch terug op de
ingebouwde demo-captions, dus er gaat nooit iets stuk.

## Belangrijk over sleutels

- De **anon key** mag in `.env` staan (die is ontworpen om publiek te zijn;
  de beveiliging zit in de database-regels).
- De **service role key** en je **Anthropic API-key** zijn geheim: alleen
  via `supabase secrets set`, nooit in de app of in git.
