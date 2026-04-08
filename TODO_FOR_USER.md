# AP Helper v0.3.0 — Hotovo a Co Dál

## ✅ Co je hotovo (všechno pushnuté na GitHub)

### 1. AI Sémantické Matchování (OpenAI Embeddings)
- ✅ Integrace OpenAI SDK (`text-embedding-3-small`)
- ✅ Embeddings se generují při uploadu Excel souboru (pokud máte `OPENAI_API_KEY`)
- ✅ Cosine similarity pro skórování (100bodová škála)
- ✅ Varování při nízké relevanci (<30% similarity)
- **Soubory**: `lib/embeddings.ts`, `lib/parseXlsx.ts` (async), `lib/match.ts`, `lib/types.ts`

### 2. CreditNinja Decision Tree
- ✅ Detekce typu webu: business, finance, law, generic
- ✅ Detekce, jestli web akceptuje loan témata
- ✅ Klasifikace URL: money page (`/personal-loans`, `/`) vs. support page (`/blog/`)
- ✅ Penalizace/bonusy podle pravidel (např. business site + money page = -50 bodů)
- ✅ Varování pro law sites (nutné schválení)
- **Soubory**: `lib/cn-rules.ts`, `lib/match.ts`, `lib/analyze-site.ts`

### 3. SeaTable API Sync (Volitelné)
- ✅ API klient pro SeaTable (`fetchAPRows`, `updateRowStatus`)
- ✅ Next.js API route: `GET /api/seatable`
- ✅ Dokumentace: `docs/SEATABLE_SYNC.md`
- **Soubory**: `lib/seatable.ts`, `app/api/seatable/route.ts`

### 4. Dokumentace
- ✅ Release notes (EN): `docs/RELEASE_v0.3.0.md`
- ✅ SeaTable sync guide: `docs/SEATABLE_SYNC.md`
- ✅ Aktualizovaný README (CZ + odkaz na release notes)
- ✅ `.env.local.example` s novými proměnnými

### 5. Git & GitHub
- ✅ Commit: `989540d` — main features
- ✅ Commit: `8cdfd6f` — docs
- ✅ Pushed to GitHub: `main` branch
- ✅ Build úspěšný (`npm run build` prošel)

---

## 🔧 Co potřebujete udělat

### 1. OpenAI API Key (Pro AI Matching)

**Krok 1**: Zaregistrujte se/přihlaste na https://platform.openai.com/

**Krok 2**: Vytvořte nový API klíč:
- Jděte na https://platform.openai.com/api-keys
- Klikněte na **"Create new secret key"**
- Pojmenujte ho např. "AP Helper Production"
- Zkopírujte klíč (vypadá jako `sk-proj-...`)

**Krok 3**: Přidejte do `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-...
```

**Krok 4**: Restart dev serveru:
```bash
cd ap-web
npm run dev
```

**Cena**: ~$0.002 za 400 AP (~$0.24 ročně při 12 měsících)

---

### 2. SeaTable API Token (Volitelné, Pro Automatický Sync)

**Krok 1**: Přihlaste se do SeaTable: https://cloud.seatable.io (nebo váš self-hosted)

**Krok 2**: Otevřete vaši base s AP daty

**Krok 3**: Jděte na **Advanced** → **API Token** (nebo použijte account-level token)

**Krok 4**: Zkopírujte:
- Base URL (např. `https://cloud.seatable.io`)
- API Token
- Table Name (např. `AP`)

**Krok 5**: Přidejte do `.env.local`:
```bash
SEATABLE_BASE_URL=https://cloud.seatable.io
SEATABLE_API_TOKEN=xxx
SEATABLE_TABLE_NAME=AP
```

**Krok 6**: Test:
- Restart `npm run dev`
- Otevřete: http://localhost:3000/api/seatable
- Měli byste vidět JSON s AP records

**Poznámka**: Zatím není UI tlačítko "Sync from SeaTable", ale API endpoint funguje. Budoucí enhancement.

---

### 3. Vercel Deployment (Aktualizace Env Vars)

**Krok 1**: Otevřete Vercel projekt:
https://vercel.com/martinapausova-maker/ap-target-url-helper

**Krok 2**: Jděte na **Settings** → **Environment Variables**

**Krok 3**: Přidejte tyto proměnné (pro Production, Preview, Development):

```bash
OPENAI_API_KEY=sk-proj-...
APPS_SCRIPT_PICKS_URL=https://script.google.com/a/macros/searchtides.com/s/AKfycb.../exec
```

(Volitelné, pokud chcete SeaTable sync):
```bash
SEATABLE_BASE_URL=https://cloud.seatable.io
SEATABLE_API_TOKEN=xxx
SEATABLE_TABLE_NAME=AP
```

**Krok 4**: Redeploy:
- Vercel by měl automaticky detectnout změny na `main` branci a redeploy
- Nebo můžete ručně trigger: **Deployments** → **...** → **Redeploy**

---

### 4. Testování

#### Test 1: CreditNinja na Dentaltown (s AI)

1. Nahrajte dubnový Excel soubor (s `OPENAI_API_KEY` nastavenou)
2. Vyberete client: **CreditNinja**
3. Zadáte URL: `https://www.dentaltown.com/blogs/posts/all/recent`
4. Kliknete **Get recommendations**

**Očekávaný výsledek**:
- Top doporučení: **"what does total number of allowances mean"** (obecné finance/daně, blog URL)
- Varování pro loan-focused anchors jako "credit score to rent apartment" (žádná relevance k zubnímu webu)

#### Test 2: FanDuel na Sport-Specific Webu

(Stávající chování — žádné změny)

1. Vyberete client: **FanDuel**
2. Zadáte URL z NBA webu (např. `https://www.nba.com/news`)
3. Očekáváno: NBA anchors vysoko, generický "FanDuel Sportsbook" penalizován

---

## 📊 Shrnutí změn

| Feature | Status | Co to dělá |
|---------|--------|------------|
| **AI Embeddings** | ✅ Hotovo | Sémantická shoda pro CreditNinja + ostatní (ne FanDuel main) |
| **CN Decision Tree** | ✅ Hotovo | Detekuje business/finance/law, varuje při money page mismatch |
| **SeaTable API** | ✅ Hotovo (API) | Živá data místo Excel uploadu (zatím bez UI tlačítka) |
| **Scoring Transparency** | ✅ Hotovo | Detailed reasons + warnings pro každý AP |
| **Docs** | ✅ Hotovo | Release notes, SeaTable guide, aktualizovaný README |
| **Git/GitHub** | ✅ Hotovo | Vše pushnuté na `main` |
| **Build** | ✅ Hotovo | `npm run build` prošel bez chyb |

---

## 🚀 Další kroky (Budoucí Enhancement)

1. **UI tlačítko "Sync from SeaTable"** — zatím můžete testovat přes `/api/seatable` endpoint
2. **Batch embedding regeneration** — pokud máte už nahraná data v `localStorage` bez embeddings, budete muset re-upload Excel
3. **Vercel env vars setup** — potřebujete ručně přidat `OPENAI_API_KEY` do Vercel settings

---

## 📞 Máte dotazy?

- **Test lokálně**: `cd ap-web && npm run dev` → http://localhost:3000
- **Check logs**: Konzole v browseru + terminal (server logs)
- **Health check**: http://localhost:3000/api/health
- **SeaTable API test**: http://localhost:3000/api/seatable (pokud máte SEATABLE_* env vars)

---

**Verze**: v0.3.0  
**Commits**: `989540d`, `8cdfd6f`  
**GitHub**: https://github.com/martinapausova-maker/ap-target-url-helper  
**Datum**: 2026-04-08
