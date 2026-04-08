/**
 * SeaTable API client (Base API Token approach).
 * Docs: https://docs.seatable.io/
 */

type SeaTableRow = Record<string, unknown>;

interface SeaTableConfig {
  baseUrl: string;
  token: string;
  tableName: string;
}

function getConfig(): SeaTableConfig | null {
  const baseUrl = process.env.SEATABLE_BASE_URL?.trim();
  const token = process.env.SEATABLE_API_TOKEN?.trim();
  const tableName = process.env.SEATABLE_TABLE_NAME?.trim() || "AP";

  if (!baseUrl || !token) return null;
  return { baseUrl, token, tableName };
}

export async function fetchAPRows(): Promise<SeaTableRow[]> {
  const cfg = getConfig();
  if (!cfg) {
    throw new Error(
      "SeaTable not configured. Set SEATABLE_BASE_URL, SEATABLE_API_TOKEN in .env.local",
    );
  }

  const url = `${cfg.baseUrl}/dtable-server/api/v1/dtables/${encodeURIComponent(cfg.tableName)}/rows/`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${cfg.token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`SeaTable fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { rows?: SeaTableRow[] };
  return data.rows ?? [];
}

export async function updateRowStatus(
  rowId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) return;

  const url = `${cfg.baseUrl}/dtable-server/api/v1/dtables/${encodeURIComponent(cfg.tableName)}/rows/`;
  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Token ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      row_id: rowId,
      row: updates,
    }),
  });
}
