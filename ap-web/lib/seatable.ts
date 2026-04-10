/**
 * SeaTable Cloud API (API Gateway v2).
 * Flow: API-Token → POST app-access-token → Base-Token + dtable_uuid → POST list rows.
 * @see https://api.seatable.com/reference/authentication
 * @see https://api.seatable.com/reference/listrows
 */

type SeaTableRow = Record<string, unknown>;

function normalizeServerUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

export function isSeaTableEnvConfigured(): boolean {
  return Boolean(
    process.env.SEATABLE_API_TOKEN?.trim() && process.env.SEATABLE_BASE_URL?.trim(),
  );
}

function getTableName(): string {
  return process.env.SEATABLE_TABLE_NAME?.trim() || "AP";
}

function getViewName(): string | undefined {
  const v = process.env.SEATABLE_VIEW_NAME?.trim();
  return v || undefined;
}

type AccessPayload = {
  access_token: string;
  dtable_uuid: string;
};

async function postAppAccessToken(
  serverUrl: string,
  apiToken: string,
): Promise<AccessPayload> {
  const url = `${serverUrl}/api/v2.1/dtable/app-access-token/`;
  const tryAuth = (scheme: "Bearer" | "Token") =>
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${scheme} ${apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exp: "3d" }),
    });

  let res = await tryAuth("Bearer");
  if (res.status === 401 || res.status === 403) {
    res = await tryAuth("Token");
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null
        ? JSON.stringify(data)
        : await res.text().catch(() => "");
    throw new Error(
      `SeaTable app-access-token failed (${res.status}): ${detail || res.statusText}. Check SEATABLE_API_TOKEN and SEATABLE_BASE_URL.`,
    );
  }

  const access_token = data.access_token;
  const dtable_uuid = data.dtable_uuid;
  if (typeof access_token !== "string" || typeof dtable_uuid !== "string") {
    throw new Error(
      "SeaTable app-access-token: response missing access_token or dtable_uuid.",
    );
  }
  return { access_token, dtable_uuid };
}

async function listRowsPage(
  serverUrl: string,
  accessToken: string,
  dtableUuid: string,
  tableName: string,
  viewName: string | undefined,
  start: number,
): Promise<SeaTableRow[]> {
  const url = `${serverUrl}/api-gateway/api/v2/dtables/${encodeURIComponent(dtableUuid)}/rows/`;
  const body: Record<string, unknown> = {
    table_name: tableName,
    start,
    limit: 1000,
    convert_keys: true,
  };
  if (viewName) body.view_name = viewName;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    rows?: SeaTableRow[];
    results?: SeaTableRow[];
    error_message?: string;
  };

  if (!res.ok) {
    const msg =
      data.error_message ||
      (typeof data === "object" ? JSON.stringify(data) : "") ||
      res.statusText;
    throw new Error(`SeaTable list rows failed (${res.status}): ${msg}`);
  }

  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * Fetch all rows from the table (optionally scoped to a view), with pagination.
 */
export async function fetchAPRows(): Promise<SeaTableRow[]> {
  const apiToken = process.env.SEATABLE_API_TOKEN?.trim();
  const serverUrlRaw = process.env.SEATABLE_BASE_URL?.trim();
  if (!apiToken || !serverUrlRaw) {
    throw new Error(
      "SeaTable not configured. Set SEATABLE_BASE_URL and SEATABLE_API_TOKEN.",
    );
  }

  const serverUrl = normalizeServerUrl(serverUrlRaw);
  const tableName = getTableName();
  const viewName = getViewName();

  const { access_token, dtable_uuid } = await postAppAccessToken(
    serverUrl,
    apiToken,
  );

  const all: SeaTableRow[] = [];
  let start = 0;
  for (;;) {
    const page = await listRowsPage(
      serverUrl,
      access_token,
      dtable_uuid,
      tableName,
      viewName,
      start,
    );
    all.push(...page);
    if (page.length < 1000) break;
    start += 1000;
  }
  return all;
}

/**
 * Update row(s) via API Gateway v2. `updates` should use SeaTable column names.
 */
export async function updateRowStatus(
  rowId: string,
  columnUpdates: Record<string, unknown>,
): Promise<void> {
  const apiToken = process.env.SEATABLE_API_TOKEN?.trim();
  const serverUrlRaw = process.env.SEATABLE_BASE_URL?.trim();
  if (!apiToken || !serverUrlRaw || !rowId) return;

  const serverUrl = normalizeServerUrl(serverUrlRaw);
  const tableName = getTableName();
  const { access_token, dtable_uuid } = await postAppAccessToken(
    serverUrl,
    apiToken,
  );

  const url = `${serverUrl}/api-gateway/api/v2/dtables/${encodeURIComponent(dtable_uuid)}/rows/`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
       body: JSON.stringify({
      table_name: tableName,
      updates: [{ row_id: rowId, row: columnUpdates }],
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error_message?: string };
    throw new Error(
      data.error_message ||
        `SeaTable update row failed: ${res.status} ${res.statusText}`,
    );
  }
}
