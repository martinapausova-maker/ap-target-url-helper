# AP Helper (webová aplikace)

Aplikace je ve složce **`ap-web/`**.

## Git

- Repo má **první commit** a větev **`main`** (lokálně).
- **`ap-web/.env.local` není v gitu** — po klonu ho musíš vytvořit znovu nebo doplnit proměnnou na Vercelu.
- Další kroky (remote, push, Vercel): **`GITHUB_NEXT_STEPS.md`** v kořeni.

## CI (GitHub Actions)

Po pushi na GitHub se spustí workflow **CI** (`npm ci`, `lint`, `build` v `ap-web`).

## Rychlé příkazy

```bash
cd ap-web
npm install
npm run doctor    # volitelné: kontrola Node a .env.local
npm run dev       # http://localhost:3000
```

## Dokumentace (v repu)

| Soubor | Obsah |
|--------|--------|
| `ap-web/README.md` | Hlavní návod (CS), struktura, produkce |
| `ap-web/docs/SETUP_GOOGLE_SHEET.md` | Krok za krokem: Sheet + Apps Script + `.env.local` |
| `ap-web/docs/google-apps-script.gs` | Kód ke vložení do Google Apps Script |

## Stav serveru

Po spuštění `npm run dev` otevři **http://localhost:3000/api/health** — uvidíš verzi aplikace a jestli je nastavená synchronizace výběrů (`APPS_SCRIPT_PICKS_URL`).

---

Co **nemůže** udělat kód za tebe: přihlášení do Google, vytvoření Sheetu, Deploy Web App, vyplnění tajné URL do `.env.local` na tvém počítači.
