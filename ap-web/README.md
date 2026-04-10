# AP Helper (Searchtides) v0.3.1

Next.js app: nahraj měsíční **AP XLSX** (export z SeaTable) **nebo** **Sync from SeaTable**, vyber **CLIENT** přesně jako ve sloupci v souboru, vlož **URL webu** vydavatele → dostaneš **seřazené** anchor + target URL s **AI sémantikou** (CreditNinja + ostatní klienti). Po **I used this AP** se `Record ID` schová ostatním (při zapnutém Google Sheet).

**Kdo co dělá (Vercel, env, klikání):** [docs/CO_DELAS_TY.md](./docs/CO_DELAS_TY.md)

## Co je nového v0.3.0

- **AI sémantická analýza** (OpenAI embeddings `text-embedding-3-small`) pro klienty mimo hlavní FanDuel — přesnější než token matching, cena ~$0.002 za 400 AP.
- **CreditNinja decision tree** integrovaná do skóre: detekuje business/finance/law weby, varuje při nesouladu money page, preferuje `/blog/` URL pro neutrální weby.
- **Volitelný SeaTable API sync** (viz `docs/SEATABLE_SYNC.md`) — žádné měsíční Excel uploady, pokud chcete živá data.
- Zlepšená transparence skórování pro všechny klienty.

| Příkaz | Účel |
|--------|------|
| `npm install` | První instalace závislostí |
| `npm run doctor` | Kontrola Node + `.env.local` (bez sítě) |
| `npm run dev` | Vývoj na http://localhost:3000 |
| `npm run build` / `npm start` | Produkční build / spuštění |

## Rychlý start (OM / lokálně)

1. `cd ap-web` → `npm install` → `npm run dev`
2. Otevři **http://localhost:3000**
3. **Upload XLSX** nebo **Sync from SeaTable** (na serveru musí být `SEATABLE_*`)
4. Vyber **CLIENT**, vlož URL webu → **Get recommendations**
5. **Copy details** nebo **I used this AP** (po použití zadej i do SeaTable jako dnes)

Data z XLSX jsou v **localStorage** prohlížeče, dokud nenahraješ nový soubor.

## Sdílená obsazenost (Google Sheet)

Bez nastavení: „I used this“ platí **jen v tom prohlížeči**.

Kompletní návod (ČJ): **[docs/SETUP_GOOGLE_SHEET.md](./docs/SETUP_GOOGLE_SHEET.md)**  
Šablona skriptu: **[docs/google-apps-script.gs](./docs/google-apps-script.gs)**

Zkráceně:

1. Nový Google Sheet → Apps Script → vlož `google-apps-script.gs`
2. V tabulce menu **AP Helper** → **Create Picks sheet (if missing)** (nebo Run `setupPicksSheet`)
3. **Deploy → Web app** → zkopíruj URL
4. `ap-web/.env.local`:

```env
APPS_SCRIPT_PICKS_URL=https://script.google.com/macros/s/XXXX/exec
```

5. Restart `npm run dev`

Vzor proměnné: [.env.local.example](./.env.local.example)

### OpenAI embeddings (volitelné, pro přesnější skórování)

Pro AI sémantiku u CreditNinja a ostatních klientů (ne FanDuel main):

```env
OPENAI_API_KEY=sk-proj-...
```

Cena: ~$0.002 za 400 AP (cca $0.24 ročně při 12 měsících).

### SeaTable API sync (volitelné, místo Excel uploadu)

Pokud chcete automaticky tahát data ze SeaTable místo ručního uploadu:

```env
SEATABLE_BASE_URL=https://cloud.seatable.io
SEATABLE_API_TOKEN=xxx
SEATABLE_TABLE_NAME=AP
SEATABLE_VIEW_NAME=Přesný název view
```

Návod: **[docs/SEATABLE_SYNC.md](./docs/SEATABLE_SYNC.md)**

---

## Kontrola prostředí

- **http://localhost:3000/api/health** — verze aplikace, jestli je `APPS_SCRIPT_PICKS_URL` nastavená
- `npm run doctor` — Node verze + existence `.env.local`

## Měsíční plán (Apr Plan)

Po změně od Julie uprav čísla v **`lib/april-plan.json`** (objekt `plan`). Ovlivňuje jen **CLIENT = `FanDuel`** (hlavní sportsbook).

## Pravidla skórování (shrnutí)

- **`FanDuel`:** vrstvy EVENT (NBA, MLB, NFL, NHL, PREDICTS nejvýš; pak Golf, Soccer), sloupec **Priority**, jemný boost z **april-plan.json**, penalizace **homepage** `sportsbook.fanduel.com/` když web vypadá sportovně specificky.
- **Ostatní klienti:** slabší shoda textu (anchor vs stránka) + základní heuristika CreditNinja pro „business“ slovník.
- **Fetch webu** může selhat → zaškrtni **Skip fetching site**.

## Struktura kódu

| Cesta | Účel |
|-------|------|
| `lib/parseXlsx.ts` | Parsování XLSX, detekce sloupců z hlavičky |
| `lib/match.ts` | Skórování řádků |
| `lib/april-plan.json` | Měsíční kvóty |
| `lib/analyze-site.ts` | Stažení + Cheerio + tokeny |
| `app/api/analyze` | POST `{ url }` → signály |
| `app/api/picks` | GET/POST → Apps Script |
| `app/api/health` | Stav serveru |
| `app/api/seatable` | GET → živá data ze SeaTable |
| `lib/embeddings.ts` | OpenAI embeddings + cosine similarity |
| `lib/cn-rules.ts` | CreditNinja decision tree |
| `lib/seatable.ts` | SeaTable API client |

## Dokumentace

- **[Nastavení Google Sheet (sdílená obsazenost)](./docs/SETUP_GOOGLE_SHEET.md)**
- **[Nastavení SeaTable API (volitelné)](./docs/SEATABLE_SYNC.md)**
- **[Vercel deployment](./docs/DEPLOY_VERCEL.md)**
- **[Release Notes v0.3.0 (EN)](./docs/RELEASE_v0.3.0.md)** ✨ NEW

## Produkce (Vercel / jiný host)

Podrobně: **[docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)** (GitHub + Vercel, Root Directory `ap-web`, env proměnná).

Zkráceně:

1. Repo na GitHubu (bez commitu `.env.local`).
2. Vercel → Import → **Root Directory:** `ap-web`.
3. Environment variable: **`APPS_SCRIPT_PICKS_URL`** = stejná URL jako lokálně.
4. `npm run build` musí projít (Vercel to spustí sám).

## Bezpečnost

- **Necommituj** `.env.local` (je v `.gitignore`).
- Web app URL s přístupem „Anyone“ je veřejný endpoint — pro přísnější režim použij omezení přístupu u Google deploymentu.

## Licence / použití

Interní nástroj Searchtides. Analyzer stránek je best-effort (paywall, bot protection).
