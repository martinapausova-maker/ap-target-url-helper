import { NextResponse } from "next/server";
import { fetchAPRows } from "@/lib/seatable";
import type { APRecord } from "@/lib/types";

export const runtime = "nodejs";

function strField(row: Record<string, unknown>, ...candidates: string[]): string {
  const keys = Object.keys(row);
  for (const want of candidates) {
    const exact = keys.find((k) => k === want);
    if (exact !== undefined && row[exact] != null && String(row[exact]).trim() !== "") {
      return String(row[exact]).trim();
    }
  }
  for (const want of candidates) {
    const lower = want.toLowerCase();
    const hit = keys.find((k) => k.toLowerCase() === lower);
    if (hit !== undefined && row[hit] != null && String(row[hit]).trim() !== "") {
      return String(row[hit]).trim();
    }
  }
  return "";
}

function rowToAPRecord(row: Record<string, unknown>): APRecord {
  const recordId =
    strField(row, "Record ID", "record id") || String(row._id ?? "").trim();

  return {
    recordId,
    client: strField(row, "Client", "CLIENT"),
    month: strField(row, "Month", "MONTH"),
    status: strField(row, "AP Status", "Status", "status"),
    event: strField(row, "Event", "EVENT"),
    category: strField(row, "Category", "CATEGORY"),
    priority: strField(row, "Priority", "PRIORITY"),
    anchorText: strField(row, "Anchor Text", "Anchor text", "ANCHOR TEXT"),
    targetUrl: strField(row, "Target URL", "Target url", "TARGET URL"),
    apIdLabel: strField(row, "AP ID", "AP Id", "ap id"),
    notes: strField(row, "Notes", "NOTES"),
  };
}

/**
 * GET /api/seatable — fetch AP records from SeaTable (optionally filtered by view via env).
 */
export async function GET() {
  try {
    const rows = await fetchAPRows();
    const records: APRecord[] = rows.map((r) =>
      rowToAPRecord(r as Record<string, unknown>),
    );
    const valid = records.filter((r) => r.anchorText && r.targetUrl);

    return NextResponse.json({
      ok: true,
      count: valid.length,
      skipped: records.length - valid.length,
      records: valid,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
