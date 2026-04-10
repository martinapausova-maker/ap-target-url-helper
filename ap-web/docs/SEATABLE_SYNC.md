# SeaTable sync (Cloud API)

## Jak to funguje (v0.3.1+)

1. Aplikace zavolá **SeaTable Cloud**:
   - `POST {SEATABLE_BASE_URL}/api/v2.1/dtable/app-access-token/` s hlavičkou `Authorization: Bearer {SEATABLE_API_TOKEN}` → vrátí **Base-Token** a **dtable_uuid**.
   - `POST {SEATABLE_BASE_URL}/api-gateway/api/v2/dtables/{dtable_uuid}/rows/` s tělem obsahujícím `table_name`, volitelně **`view_name`**, `convert_keys: true`, stránkování (`start`, `limit`).

2. Pokud je nastavené **`SEATABLE_VIEW_NAME`**, vrátí se jen řádky z toho view (např. jen volné AP).

3. V UI použij **Sync from SeaTable** — data se uloží do `localStorage` stejně jako po nahrání XLSX.

## Proměnné prostředí

| Proměnná | Povinné | Příklad |
|----------|---------|---------|
| `SEATABLE_BASE_URL` | ano | `https://cloud.seatable.io` (bez lomítka na konci) |
| `SEATABLE_API_TOKEN` | ano | API token k base (SeaTable → base → **Advanced** → **API Token**) |
| `SEATABLE_TABLE_NAME` | ne | výchozí `AP` |
| `SEATABLE_VIEW_NAME` | ne | přesný název view v UI (doporučeno pro „jen volné AP“) |

Na Vercelu: **Project → Settings → Environment Variables** → Production (+ Preview podle potřeby) → **Redeploy**.

## Ověření

- `GET /api/health` — sekce `seatable` (configured / view).
- `GET /api/seatable` — JSON `{ ok, count, records, skipped }`.

## Sloupce

Mapování je v `app/api/seatable/route.ts` (názvy sloupců jako v SeaTable při `convert_keys: true`). Případně uprav podle vaší base.

## Google Sheet

Není nutný, pokud obsazenost řešíte změnou statusu v SeaTable a view už obsazené neukazuje.
