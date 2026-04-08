import { NextResponse } from "next/server";
import { fetchAPRows } from "@/lib/seatable";
import type { APRecord } from "@/lib/types";

export const runtime = "nodejs";

/**
 * GET /api/seatable — fetch AP records from SeaTable API
 */
export async function GET() {
  try {
    const rows = await fetchAPRows();

    const records: APRecord[] = rows.map((row) => ({
      recordId: String(row._id ?? ""),
      client: String(row["Client"] ?? ""),
      month: String(row["Month"] ?? ""),
      status: String(row["AP Status"] ?? ""),
      event: String(row["Event"] ?? ""),
      category: String(row["Category"] ?? ""),
      priority: String(row["Priority"] ?? ""),
      anchorText: String(row["Anchor Text"] ?? ""),
      targetUrl: String(row["Target URL"] ?? ""),
      apIdLabel: String(row["AP ID"] ?? ""),
      notes: String(row["Notes"] ?? ""),
    }));

    return NextResponse.json({ ok: true, records });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
