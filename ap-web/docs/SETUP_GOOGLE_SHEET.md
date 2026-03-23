# Google Sheet + Apps Script — sdílená obsazenost AP

Tento návod doplňuje `README.md`. Cíl: když jeden OM klikne **I used this AP**, ostatní se stejnou URL aplikace už ten **Record ID** v doporučeních neuvidí.

## Požadavky

- Google účet (stejný Sheet může vlastnit např. manager).
- Nasazená webová aplikace Apps Script (URL začíná `https://script.google.com/macros/...`).

## Krok 1 — Nový Google Sheet

1. [Google Sheets](https://sheets.google.com) → **Blank**.
2. Můžeš nechat výchozí list **Sheet1** — skript si vytvoří list **`Picks`** sám, až spustíš menu (krok 3).

## Krok 2 — Apps Script

1. V tabulce: **Extensions** (Rozšíření) → **Apps Script**.
2. Smaž výchozí `function myFunction() { ... }`.
3. Vlož celý obsah souboru **`ap-web/docs/google-apps-script.gs`** z tohoto repozitáře.
4. **Save** (disketa), projekt můžeš pojmenovat např. `AP Helper Picks`.

## Krok 3 — Vytvořit list Picks (jednou)

1. V editoru skriptu: vyber funkci **`setupPicksSheet`** v rozbalovacím menu a klikni **Run**, **nebo**
2. V tabulce obnov stránku → menu **AP Helper** → **Create Picks sheet (if missing)**.
3. Povol oprávnění (Google se zeptá).
4. V sešitu by měl přibýt list **Picks** s hlavičkou:  
   `record_id | picked_at | site_url | om`

## Krok 4 — Deploy Web App

1. V Apps Script: **Deploy** → **New deployment**.
2. Typ: **Web app**.
3. **Execute as:** Me  
4. **Who has access:**  
   - **Anyone** — nejjednodušší pilot (kdokoli s URL může volat GET/POST).  
   - Nebo **Anyone within your organization** / Google účet — podle bezpečnostní politiky.
5. **Deploy** → zkopíruj **Web app URL** (končí často `/exec`).

## Krok 5 — Propojení s Next.js (localhost)

1. V složce `ap-web` vytvoř soubor **`.env.local`** (necommituj ho do gitu).
2. Obsah:

```env
APPS_SCRIPT_PICKS_URL=https://script.google.com/macros/s/VAŠE_ID/exec
```

3. Restartuj dev server: `Ctrl+C`, pak `npm run dev`.
4. Na úvodní stránce by mělo být **Sheet sync enabled** (zeleně).

## Ověření

- Otevři v prohlížeči: `http://localhost:3000/api/health` — mělo by být `"picks": { "configured": true }`.
- V aplikaci označ jeden AP → v listu **Picks** přibude řádek.

## Časté problémy

| Problém | Řešení |
|--------|--------|
| `Exception: Specified permissions are not sufficient` | Znovu Deploy Web app, Execute as: **Me**. |
| GET vrací prázdné `recordIds` | Zkontroluj, že list se jmenuje přesně **Picks** a první řádek jsou hlavičky. |
| POST nic nepřidává | Zkontroluj v Deploy, že používáš **novou** verzi deploymentu po změně kódu (**Manage deployments** → **Edit** → Version: **New version**). |
| CORS v prohlížeči | Volání jde přes Next.js `/api/picks`, ne přímo z prohlížeče na Google — `.env.local` musí být na serveru, kde běží `next dev` / Vercel. |

## Produkce (Vercel)

V **Project Settings → Environment Variables** přidej `APPS_SCRIPT_PICKS_URL` stejně jako lokálně. Redeploy.
