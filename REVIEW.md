# AEQUIV – granskning

Granskad version: `main` efter PR #1–#6 (commit `7ac3fe0` och senare).

## Status efter åtgärder (PR #7, branch `fix/startup-and-sync`)

| Fynd | Status |
| --- | --- |
| K3 Krasch utan Supabase-variabler | **Åtgärdat.** Appen kör lokalt, startflödet verifierat utan variabler. |
| K2 Synken kan skriva över molndata | **Åtgärdat.** Uppladdning först efter lyckad läsning. Fel görs om. |
| V2 Last-write-wins, fel ignoreras, ingen flush | **Delvis åtgärdat.** Fel loggas och görs om, flush vid `pagehide` och när sidan döljs. Samtidiga ändringar på två enheter är fortfarande last-write-wins. |
| V4 Engelska felsidor | **Åtgärdat.** 404 och fel-sidan är på svenska. |
| K1 AI-endpoints utan inloggning | **Öppet.** Kräver beslut: inloggning eller server-gräns. |
| V1 Inloggning ersätter lokal data | **Öppet.** Kräver beslut. |
| V5 Odokumenterade konstanter i `macroTargets` | **Öppet.** Kräver svar på frågan om avsikt. |
| V6 Offline-kontroll i FridgeIdeas | Öppet. |
| Ny: "Nytt pass" kräver konto | Observation. Uppmaning om konto dyker upp när man vill starta ett pass. Produktbeslut. |

Testat i webbläsaren efter åtgärderna: startflödet, hemskärmen, Mat (meny för måltid, även via `?ny=true`), Träning (kalender och knappar), Framsteg, Profil, Inställningar, Integritet, Villkor, Nytt lösenord och 404. Inga konsolfel i de nya laddningarna och ingen horisontell scroll.

## 1. Startstatus

Dessa kontroller gjordes redan under arbetets gång och upprepades inte i den här granskningen.

| Kontroll | Resultat |
| --- | --- |
| `npm i` / `bun install` | Lyckades. Bun är lockfil-källan (`bun.lock`). |
| `npm run dev` | Startar på port 8080 och svarar 200. |
| `npm test` (Node 24) | 184/184 passerar. |
| `npm run build` | Lyckades. |
| Typkontroll (`tsc --noEmit`) | Passerar. |
| Lint | 0 fel, 15 varningar (`react-refresh` i shadcn-filer, två avsiktliga hook-varningar är dokumenterade). |
| `bun audit` | Inga sårbarheter. |

**Avvikelse i den här granskningen:** `.env` saknas i projektmappen. Den togs bort när lokala `main` synkades med GitHub efter att `.env` slutat spåras (se fynd K3). Därför kraschar appen i webbläsaren när den startas.

## 2. Buggar

Allvarlighetsgrad: **kritiskt** = dataförlust, kostnad eller att appen inte går att använda. **viktigt** = fel beteende i normalt flöde eller säkerhetsrisk. **mindre** = kosmetiskt eller svårt att utlösa.

### Kritiskt

**K1. AI-endpoints saknar autentisering. Anyone can spend the owner's Gemini budget.**
- Filer: `src/lib/photo.functions.ts:31` (`analyzePlate`), `src/lib/textlog.functions.ts:22` (`estimateText`), `src/lib/coach.functions.ts:65` (`askCoach`), `src/lib/fridge.functions.ts:22` (`fridgeIdeas`).
- Endast `src/lib/account.functions.ts` använder `requireSupabaseAuth`. De fyra AI-funktionerna saknar middleware.
- Återskapa: anropa en `createServerFn`-endpoint utan session. Gemini-anropet görs med projektets `GEMINI_API_KEY`.
- Daglig gräns för fotoanalyser finns bara i klienten: `src/lib/fairuse.ts:3-4, 23` och `localStorage` (`fairuse.ts:40-52`). Den kan kringgås direkt.

**K2. Synken kan skriva över molndata när hämtningen misslyckas.**
- Fil: `src/lib/cloudsync.ts:25-35`.
- `pullOrSeed` läser `user_state` men kontrollerar inte `error`. Om select:en misslyckas (nätverksfel, tillfälligt serverfel) blir `remote` tom, och `else`-grenen anropar `push()` med det lokala state:t. Det skriver över den befintliga molnraden.
- Återskapa: logga in på ett nytt läge när nätverket är instabilt, eller simulera ett fel i select.

**K3. Appen kraschar utan Supabase-variabler (verifierat i webbläsaren).**
- Filer: `src/integrations/supabase/client.ts:57-70` (kastar fel), `src/lib/cloudsync.ts:40` (anropar `supabase` direkt), `src/routes/__root.tsx:280` (startar synken).
- Återskapa: ta bort `.env` och ladda om. Vid start visas felsidan "This page didn't load" och konsolen visar `Missing Supabase environment variable(s)`. Klickning på **Starta Aequiv** ger samma fel.
- Felet orsakades av att `.env` togs bort lokalt (min miss, se avsnitt 1). Men det visar att appen inte har någon fallback när konfigurationen saknas. I drift med rätt variabler påverkas inte detta.

### Viktigt

**V1. Det lokala state:t skrivs över vid inloggning.**
- Fil: `src/lib/cloudsync.ts:28-31`, `src/lib/balans.ts:269-271`.
- Om molnraden finns ersätter den lokala datan helt, utan varning. Data som registrerats offline eller innan inloggning försvinner. Det kan vara avsiktligt ("nytt telefon"), men det är inte dokumenterat som risk.
- Fråga: är det avsett att molndata alltid vinner, även om lokal data är nyare?

**V2. Synken är last-write-wins för hela dokumentet, och fel ignoreras.**
- Fil: `src/lib/cloudsync.ts:16-23` (`upsert` utan att kontrollera resultat), `:40-44` (debounce 1,5 s, ingen flush vid sidstängning).
- Två enheter som ändrar samtidigt skriver över varandra, eftersom hela `data` skrivs. En ändring som görs inom 1,5 s före att appen stängs skickas aldrig.
- Felet från `upsert` loggas inte och syns inte för användaren.

**V3. Fotogränsen och AI-kostnaden är inte serverbaserade.** Se K1. Dubbelkontroll: det finns inga serverlogs eller räknare.

**V4. Felsidan är på engelska i en svensk app.**
- Fil: `src/routes/__root.tsx:112` (`errorComponent: ErrorComponent`).
- Texten "This page didn't load / Try again / Go home" visas för användaren.

**V5. Beräkningarna har konstanter som inte är dokumenterade.**
- Fil: `src/lib/balans.ts:1125-1140` (`macroTargets`).
- `w * 31` som basenergi, `+150 kcal` när användaren har minst 4 träningsdagar, och `FOCUS_RULES` (kcalAdj och protein per kg). Formlerna är rimliga, men källa och avsikt står inte i AGENTS.md, README eller roadmap.
- Fråga: vad är `31` och varför `150` vid 4 träningsdagar?
- Om `protein * 4 + fat * 9` är större än `kcal` klampas kolhydraterna till 0 (`balans.ts:1139`). Då stämmer inte summan av makron mot kaloritarget. Det händer för "forma" med låg kcal och hög vikt.

**V6. Offline-kontroll saknas i AI-kortet för fridge.**
- `src/components/FridgeIdeas.tsx:20` anropar `fridgeIdeas` utan `isOffline()`-kontroll, till skillnad från `AiCoach.tsx:239`, `PhotoLog.tsx:87` och `mat.tsx:386`.

### Mindre

**M1.** `parseNutrition` (`src/lib/habits.ts:25-45`) kontrollerar inte övre gräns. Värden som `1e9` godkänns.

**M2.** `README.md` säger `npm i`, men projektet använder `bun.lock`. Lägg till en rad om vilken pakethanterare som gäller.

**M3.** `.env` ligger kvar i git-historiken med Supabase-URL och publishable key. Publishable key är avsedd att vara publik, men om en hemlighet någon gång committats ska den roteras.

**M4.** 15 lint-varningar kvarstår, varav de flesta är `react-refresh/only-export-components` i shadcn-filer.

## 3. Förbättringsförslag

Förslagen är inte genomförda. Designdelen är delvis: jag kunde bara granska startskärmen i mobilstorlek (375x812) eftersom onboarding kraschade (K3).

### Prioritet 1: säkerhet och dataintegritet

1. **Skydda AI-endpoints med `requireSupabaseAuth`** (K1). Lägg till en serverbaserad daglig räknare i `user_state` eller en egen tabell, så att gränsen inte kan kringgås från klienten.
2. **Stoppa uppladdning när hämtning misslyckas** (K2). Kontrollera `error` i `pullOrSeed`, och ladda inte upp lokal data förrän hämtningen lyckats.
3. **Kontrollera `error` i `push()`** och visa en diskret status ("Sparat" / "Ej synkat"). Lägg till flush vid `pagehide` och `visibilitychange`.
4. **Visa en varning vid inloggning** när lokal data skulle ersättas, eller slå ihop lokal och molnad data per fält.
5. **Fallback när Supabase saknas**: visa en tydlig felruta eller kör lokalt utan synk, istället för att kasta fel i `client.ts`.

### Prioritet 2: tillstånd och användarflöden

6. **Onboarding först**: kontrollera hela "Starta Aequiv"-flödet med variabler satta, eftersom detta är första upplevelsen.
7. **Svensk felsida** i `__root.tsx`, med "Försök igen" och "Till startsidan".
8. **Offline-kontroll** i FridgeIdeas, och samma meddelande som i övriga AI-funktioner.
9. **Tomma tillstånd**: kontrollera vilka skärmar som visar en tom lista utan vägledning. Det gick inte att kontrollera fullt ut här.

### Prioritet 3: design och tillgänglighet

10. **Startskärmen är ren** i mobilstorlek, utan horisontell scroll. Ingen teknisk brist hittades där. Om jag ska jämföra med Hevy, Linear och Apple behöver jag se fler skärmar. Projektdokumentationen innehåller ingen definierad kvalitetsribba, så den kan inte användas som facit.
11. **Ikonknappar**: en skanning av `size="icon"` visar att alla knappar i appens egna komponenter har `aria-label`. Shadcn-filerna `sidebar.tsx` och `calendar.tsx` är inte kontrollerade i detalj.
12. **Enhetlig skala**: samla typografi, avstånd och färger i tokens. Det finns 87 träffar för `text-xs` och små pixelstorlekar (`text-[10px]`/`text-[11px]`), som kan vara svåra att läsa.

### Prioritet 4: teknik och prestanda

13. **Dela upp stora filer**: `src/lib/exercises.ts` (4 436 rader) och `src/components/ExerciseDemo.tsx` (4 470 rader) bör delas upp. Ladda övningskatalogen lazy så att den inte hamnar i alla routes.
14. **Klientbundlar**: totalt cirka 1,5 MB okomprimerad JS. Största filerna är `esm-*.js` (441 KB), `index-*.js` (316 KB) och `utils-*.js` (241 KB). Mät gzip-storlek och lazy-load övningsdelen.
15. **Lint-varningar**: flytta konstanter ut ur komponentfiler (`react-refresh`). Lägg in en kommentar eller gör den avsiktlig för shadcn-filer.
16. **Minska onödiga omrenderingar**: `useDictation` skapar nytt objekt varje render (`AiCoach.tsx:99`). Memoisera returvärdet om komponenten renderas ofta.

## 4. Frågor innan vi går vidare

- **V1:** ska molndata alltid vinna vid inloggning, även när lokal data är nyare?
- **V5:** vad är `31` och `150` i `macroTargets`? Vilken källa ligger bakom dem?
- **K3:** `.env` togs bort lokalt av misstag. Får jag återställa den från git-historiken (`git show 7ac3fe0:.env > .env`)? Det ändrar en fil du har sagt att jag inte ska ändra utan att fråga.
