import * as XLSX from "xlsx";
import type { APRecord } from "./types";
import { getEmbedding } from "./embeddings";

function normalizeHeader(h: unknown): string {
  return String(h ?? "")
    .replace(/\uFE0F/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .trim()
    .toLowerCase();
}

function pickColumnIndex(
  headers: string[],
  matchers: ((h: string) => boolean)[],
): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (matchers.some((fn) => fn(h))) return i;
  }
  return -1;
}

/**
 * Parse an uploaded XLSX (ArrayBuffer) into AP records.
 * Optionally, generate embeddings for each AP (anchor + target context).
 */
export async function parseAPWorkbook(
  buffer: ArrayBuffer,
  generateEmbeddings = false,
): Promise<APRecord[]> {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!rows.length) return [];

  const headerRow = rows[0].map((c) => normalizeHeader(c));

  const idxClient = pickColumnIndex(headerRow, [
    (h) => h === "client" || h.includes("client"),
  ]);
  const idxRecordId = pickColumnIndex(headerRow, [
    (h) => h.replace(/\s+/g, " ") === "record id",
    (h) => h.includes("record") && h.includes("id"),
  ]);
  const idxAnchor = pickColumnIndex(headerRow, [
    (h) => h.includes("anchor") && h.includes("text"),
  ]);
  const idxTarget = pickColumnIndex(headerRow, [
    (h) => h.includes("target") && h.includes("url") && !h.includes("at"),
  ]);
  const idxMonth = pickColumnIndex(headerRow, [(h) => h === "month"]);
  const idxStatus = pickColumnIndex(headerRow, [(h) => h === "status"]);
  const idxEvent = pickColumnIndex(headerRow, [(h) => h === "event"]);
  const idxCategory = pickColumnIndex(headerRow, [(h) => h === "category"]);
  const idxPriority = pickColumnIndex(headerRow, [(h) => h === "priority"]);
  const idxNotes = pickColumnIndex(headerRow, [(h) => h === "notes"]);
  const idxApId = pickColumnIndex(headerRow, [
    (h) => h.replace(/\s+/g, " ") === "ap id",
    (h) => h === "ap id",
  ]);

  const required = [idxClient, idxAnchor, idxTarget];
  if (required.some((i) => i < 0)) {
    throw new Error(
      "Could not find required columns (CLIENT, ANCHOR TEXT, TARGET URL). Check the first row headers.",
    );
  }

  const out: APRecord[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    const cell = (i: number) =>
      i >= 0 && i < row.length ? String(row[i] ?? "").trim() : "";

    const client = cell(idxClient);
    const anchorText = cell(idxAnchor);
    const targetUrl = cell(idxTarget);

    if (!client && !anchorText && !targetUrl) continue;
    if (!targetUrl || !anchorText) continue;

    out.push({
      recordId: idxRecordId >= 0 ? cell(idxRecordId) : "",
      client,
      month: idxMonth >= 0 ? cell(idxMonth) : "",
      status: idxStatus >= 0 ? cell(idxStatus) : "",
      event: idxEvent >= 0 ? cell(idxEvent) : "",
      category: idxCategory >= 0 ? cell(idxCategory) : "",
      priority: idxPriority >= 0 ? cell(idxPriority) : "",
      anchorText,
      targetUrl,
      apIdLabel: idxApId >= 0 ? cell(idxApId) : "",
      notes: idxNotes >= 0 ? cell(idxNotes) : "",
    });
  }

  if (generateEmbeddings) {
    await Promise.all(
      out.map(async (rec) => {
        const text = `${rec.anchorText} ${new URL(rec.targetUrl).pathname}`;
        rec.embedding = (await getEmbedding(text)) ?? undefined;
      }),
    );
  }

  return out;
}

/**
 * Inject embeddings into already-parsed records (for batching).
 */
export async function injectEmbeddings(records: APRecord[]): Promise<void> {
  await Promise.all(
    records.map(async (rec) => {
      if (rec.embedding) return;
      const text = `${rec.anchorText} ${new URL(rec.targetUrl).pathname}`;
      rec.embedding = (await getEmbedding(text)) ?? undefined;
    }),
  );
}

export function uniqueClients(records: APRecord[]): string[] {
  const s = new Set<string>();
  for (const r of records) {
    if (r.client) s.add(r.client);
  }
  return [...s].sort((a, b) => a.localeCompare(b));
}
