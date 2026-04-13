import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";
import { isSeaTableEnvConfigured } from "@/lib/seatable";

export const runtime = "nodejs";

/**
 * Quick status for admins / debugging. Safe to expose (no secrets).
 */
export async function GET() {
  // #region agent log
  console.log("[HEALTH-N] GET /api/health called", { ts: Date.now(), vercel: process.env.VERCEL, node: process.version });
  // #endregion
  const picksUrl = Boolean(process.env.APPS_SCRIPT_PICKS_URL?.trim());
  const onVercel = Boolean(process.env.VERCEL);
  const seatable = isSeaTableEnvConfigured();
  const viewSet = Boolean(process.env.SEATABLE_VIEW_NAME?.trim());

  return NextResponse.json({
    ok: true,
    app: "ap-helper",
    version: APP_VERSION,
    runtime: {
      vercel: onVercel,
      hint: onVercel
        ? "Running on Vercel — check env vars in Project → Settings → Environment Variables"
        : "Local / non-Vercel",
    },
    seatable: {
      configured: seatable,
      view: viewSet,
      hint: seatable
        ? viewSet
          ? "SEATABLE_* set; list rows use SEATABLE_VIEW_NAME if provided"
          : "SEATABLE_* set; no SEATABLE_VIEW_NAME — all rows in table (no view filter)"
        : "Set SEATABLE_BASE_URL + SEATABLE_API_TOKEN (+ optional SEATABLE_VIEW_NAME)",
    },
    picks: {
      configured: picksUrl,
      hint: picksUrl
        ? "APPS_SCRIPT_PICKS_URL is set (Google Sheet picks)"
        : "APPS_SCRIPT_PICKS_URL not set — optional if you use SeaTable-only workflow",
    },
    node: process.version,
  });
}
