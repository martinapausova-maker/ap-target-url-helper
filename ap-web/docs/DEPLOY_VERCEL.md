# Nasazení na Vercel + GitHub

Aplikace je běžný Next.js projekt — na Vercelu funguje stejně jako lokálně, **pokud** v dashboardu nastavíš stejnou env proměnnou jako v `.env.local`.

## GitHub (záloha)

1. Na GitHubu vytvoř **nové prázdné repo** (bez README, pokud už máš obsah lokálně).
2. V kořeni složky `AP_target URL helper` (kde je i `ap-web/`):

```bash
git init
git add .
git status   # ověř, že ap-web/.env.local NENÍ v seznamu (musí být ignorovaný)
# jednorázově (nebo --global):
git config user.email "ty@searchtides.com"
git config user.name "Tvoje Jmeno"
git commit -m "Initial commit: AP Helper"
git branch -M main
git remote add origin https://github.com/TVUJ-UCET/TVUJ-REPO.git
git push -u origin main
```

**Důležité:** Soubor `ap-web/.env.local` **nesmí** být v gitu (obsahuje URL skriptu). Je v `.gitignore`.

Po pushi na GitHub běží workflow **CI** (`.github/workflows/ci.yml`): `npm ci` → `lint` → `build` v adresáři `ap-web`.

## Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → Import z GitHubu (vyber repo).
2. **Root Directory:** nastav na **`ap-web`** (ne celý monorepo kořen, pokud repo obsahuje i PDF/DOCX vedle `ap-web`).
3. Framework: Next.js (detekuje se sám).
4. **Environment Variables** → přidej:
   - **Name:** `APPS_SCRIPT_PICKS_URL`
   - **Value:** stejná URL jako v lokálním `.env.local` (Web App URL z Google).
   - Zaškrtni **Production** (a případně Preview, pokud chceš picks i na preview URL).
5. **Deploy**.

Po deployi otevři URL z Vercelu → mělo by být **Sheet sync enabled** (nebo ověř `https://tvuj-projekt.vercel.app/api/health` → `"configured": true`).

## Funguje to „tak jako tak“?

- **Ano**, pokud na Vercelu **nastavíš** `APPS_SCRIPT_PICKS_URL`. Bez ní picks poběží jen v localStorage v prohlížeči (jako lokálně bez `.env.local`).
- **GitHub** je jen záloha kódu; samotný běh na Vercelu z GitHubu nezávisí na tom, jestli máš `.env.local` u sebe — tam musí být proměnná znovu zadaná ve Vercelu.

## Workspace s velkými soubory (DOCX, PDF)

Celé repo může být těžké; pokud nechceš nahrávat dokumenty na GitHub, buď:

- repo jen pro `ap-web/` (jiný git root), nebo  
- nech je v root `.gitignore` (např. `*.docx`) — podle vaší politiky.
