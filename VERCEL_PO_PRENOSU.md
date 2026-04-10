# Vercel po přesunu na nový GitHub / nový tým

Repo je **monorepo**: Next.js aplikace je jen ve složce **`ap-web/`**. Bez tohoto nastavení import na Vercelu typicky „nefunguje“.

## Oprava stávajícího projektu (bez mazání)

1. [Vercel](https://vercel.com) → otevři projekt **ap-target-url-helper** → **Settings → General → Root Directory** → **`ap-web`** → Save.  
2. **Settings → Environment Variables** → znovu přidej **`APPS_SCRIPT_PICKS_URL`** (a případně ostatní).  
3. **Settings → Git** → ověř repo **MartinaSearchTides/ap-target-url-helper** a větev **main**.  
4. **Deployments** → u posledního deploye **Redeploy**.

## Nový import z GitHubu (s přednastaveným `ap-web`)

Při zakládání projektu přes Vercel můžeš použít odkaz s parametrem **`root-directory=ap-web`** (ekvivalent nastavení v dashboardu):

**[Deploy na Vercel s Root Directory = ap-web](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMartinaSearchTides%2Fap-target-url-helper&root-directory=ap-web)**

Po importu stejně zkontroluj **Environment Variables** (nepřenesou se z jiného účtu).

## Kontrolní seznam (5 minut)

| Krok | Kde | Co nastavit |
|------|-----|-------------|
| 1 | Vercel → **Settings → General → Root Directory** | **`ap-web`** (ne `.` / ne prázdné) |
| 2 | Vercel → **Settings → Environment Variables** | Znovu přidat proměnné ze starého projektu (viz níže) |
| 3 | Vercel → **Settings → Git** | Repo: `MartinaSearchTides/ap-target-url-helper`, větev `main` — žádné visící „Connect Git“ bez repa |
| 4 | **Deployments** | Po úpravách **Redeploy** posledního deploymentu |

## Proměnné prostředí (minimum)

- **`APPS_SCRIPT_PICKS_URL`** — URL Web App z Google Apps Script (sdílená obsazenost AP). Bez ní aplikace běží, ale picks jen lokálně v prohlížeči.
- Volitelně: **`OPENAI_API_KEY`**, **`SEATABLE_BASE_URL`**, **`SEATABLE_API_TOKEN`**, **`SEATABLE_TABLE_NAME`**.

Vzor: [`ap-web/.env.local.example`](ap-web/.env.local.example)

## Ověření po deployi

- Otevři **`https://tvůj-projekt.vercel.app/api/health`**
  - `ok: true`, `version` odpovídá aplikaci
  - `picks.configured: true` jen pokud je na Vercelu nastavená `APPS_SCRIPT_PICKS_URL`

## Proč to bez `ap-web` padá

V kořeni repozitáře **není** soubor `package.json` pro Next.js — je jen ve **`ap-web/package.json`**. Vercel bez Root Directory = `ap-web` hledá build v špatném místě.

Podrobněji: [`ap-web/docs/DEPLOY_VERCEL.md`](ap-web/docs/DEPLOY_VERCEL.md)
