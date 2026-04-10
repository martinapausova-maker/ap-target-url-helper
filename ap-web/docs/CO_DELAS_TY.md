# Co děláš **ty** (ručně v prohlížeči / na účtech)

Kód a repo už obsahují aplikaci. **Ty** musíš jen nastavit hosting a účty, kam já nemám přístup.

## Jednorázově na Vercelu

1. Přihlas se na **https://vercel.com** → otevři projekt **ap-target-url-helper**.
2. **Settings → General → Root Directory** musí být **`ap-web`** → Save.
3. **Settings → Environment Variables** — zkontroluj, že máš (hodnoty z SeaTable / OpenAI podle potřeby):
   - `SEATABLE_BASE_URL` (např. `https://cloud.seatable.io`)
   - `SEATABLE_API_TOKEN`
   - `SEATABLE_TABLE_NAME` (pokud tabulka není `AP`)
   - `SEATABLE_VIEW_NAME` (přesný název view „jen volné AP“)
   - Volitelně: `OPENAI_API_KEY`
   - Google Sheet **nemusíš** — `APPS_SCRIPT_PICKS_URL` můžeš vynechat.
4. **Deployments** → u posledního buildu **⋯** → **Redeploy** (po každé změně env).

## Při každém měsíci / práci v aplikaci

1. Otevři **URL tvého Vercelu** (nebo lokálně `npm run dev`).
2. Klikni **Sync from SeaTable** (nebo nahraj XLSX).
3. Vyber klienta, URL webu → **Get recommendations**.

## Ověření, že to žije

- Otevři **`https://tvůj-projekt.vercel.app/api/health`** — mělo by být `ok: true`, u SeaTable `configured: true`.

---

# Co už je **hotové v kódu** (nemusíš to dělat)

- Volání **SeaTable Cloud API** (token → řádky, včetně **view**).
- Tlačítko **Sync from SeaTable** v UI.
- **`/api/health`** ukazuje, jestli jsou nastavené proměnné.

---

# Co může udělat **AI v Cursoru** (já), když přepneš Agent a napíšeš zadání

- Opravit chyby v kódu podle **textu chyby** z Vercelu (Build log / Runtime log).
- Upravit **mapování sloupců** SeaTable, pokud se u vás jmenují jinak.
- Přidat logiku / texty v aplikaci.
- **Commit a push** do GitHubu z tvého počítače (pokud máš v Cursoru nastavený `git` a remote).

# Co **já nemůžu**

- Přihlásit se za tebe na **Vercel**, **SeaTable**, **GitHub**.
- Zadat nebo zkontrolovat tvé **tajné klíče** na produkci.
- Otevřít tvou produkční URL bez tebe.
