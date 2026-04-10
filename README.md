# AP Target URL Helper (monorepo)

Next.js aplikace pro výběr anchor textů a target URL je ve složce **`ap-web/`**.

## Rychlé odkazy

| Kam | Odkaz |
|-----|--------|
| Návod k aplikaci (CS) | [`ap-web/README.md`](ap-web/README.md) |
| **Vercel po přesunu / nefunguje deploy** | **[`VERCEL_PO_PRENOSU.md`](VERCEL_PO_PRENOSU.md)** |
| Přehled webové app | [`README-AP-APP.md`](README-AP-APP.md) |

## Důležité pro Vercel

Repo **nemá** `package.json` s Next.js v kořeni — jen v **`ap-web/`**. Na Vercelu musí být **Root Directory** nastavené na **`ap-web`**, jinak build selže nebo se nasadí prázdný/wrong projekt.

Nejrychlejší oprava: otevři [`VERCEL_PO_PRENOSU.md`](VERCEL_PO_PRENOSU.md) (checklist + odkaz na import s předvyplněným `ap-web`).
