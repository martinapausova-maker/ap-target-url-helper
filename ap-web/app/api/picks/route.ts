import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Proxies to Google Apps Script Web App (deploy as "Anyone" with execute as you).
 * Set APPS_SCRIPT_PICKS_URL in .env.local
 *
 * Script should:
 * - GET  → return JSON { recordIds: string[] }
 * - POST → body { recordId, siteUrl?, om? } append row, return { ok: true }
 */
async function scriptGetList(url: string): Promise<string[]> {
  const u = new URL(url);
  u.searchParams.set("action", "list");
  const res = await fetch(u.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { recordIds?: unknown };
  if (!Array.isArray(data.recordIds)) return [];
  return data.recordIds.map(String);
}

export async function GET() {
  const base = process.env.APPS_SCRIPT_PICKS_URL;
  if (!base) {
    return NextResponse.json({ recordIds: [], configured: false });
  }
  try {
    const recordIds = await scriptGetList(base);
    return NextResponse.json({ recordIds, configured: true });
  } catch {
    return NextResponse.json({ recordIds: [], configured: true, error: true });
  }
}

export async function POST(req: Request) {
  const base = process.env.APPS_SCRIPT_PICKS_URL;
  const body = (await req.json()) as {
    recordId?: string;
    siteUrl?: string;
    om?: string;
  };
  const recordId = body.recordId?.trim();
  if (!recordId) {
    return NextResponse.json({ ok: false, error: "recordId required" }, { status: 400 });
  }

  if (!base) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message: "APPS_SCRIPT_PICKS_URL not set — pick stored locally only in browser.",
    });
  }

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordId,
        siteUrl: body.siteUrl ?? "",
        om: body.om ?? "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, configured: true, remote: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "post failed";
    return NextResponse.json({ ok: false, configured: true, error: msg });
  }
}
