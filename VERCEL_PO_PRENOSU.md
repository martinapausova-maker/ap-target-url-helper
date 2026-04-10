# Vercel po přesunu na nový GitHub / nový tým

Repo je **monorepo**: Next.js aplikace je jen ve složce **`ap-web/`**. Bez tohoto nastavení import na Vercelu typicky „nefunguje“.

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
